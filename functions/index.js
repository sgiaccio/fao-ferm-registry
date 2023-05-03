const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = require('@google-cloud/firestore');


// Initialize admin SDK
admin.initializeApp();

// These are the roles that can be assigned to users in a group.
// Possibly add 'restricted'? Restricted users could only edit and view their own data
const GROUP_ROLES = ['admin', 'editor', 'guest'];

const usersCollection = 'users';
const _groupsCollection = 'groups';

// This is used to export the data from the firestore database
const client = new firestore.v1.FirestoreAdminClient();
// TODO: move this to env variables
const backupBucket = 'gs://fao-ferm-firebase-backup';


// Finds the first element in the array for which the async predicate returns true
async function findAsync(array, predicate) {
    for (const t of array) {
        if (await predicate(t)) {
            return t;
        }
    }
}

// Checks if a group exists
async function isValidGroup(groupId) {
    const groupsRef = admin.firestore().collection(_groupsCollection);
    const snapshot = await groupsRef.doc(groupId).get();

    return snapshot.exists;
}

// Checks if the groups are valid, returns the first invalid group or null if all are valid
async function checkValidGroups(privileges) {
    // TODO handle the case where privileges is empty!!!

    const groupIds = Object.keys(privileges);
    const groupsCollection = admin.firestore().collection(_groupsCollection);
    const groupsSnapshot = await groupsCollection.where(firestore.FieldPath.documentId(), 'in', groupIds).get();
    const groupIdsFromFirestore = groupsSnapshot.docs.map(d => d.id);
    const invalidGroup = groupIds.find(g => !groupIdsFromFirestore.includes(g));
    return invalidGroup || null;
}

// Checks if the privilege levels are valid, returns teh first group with an invalid privilege level or null if all are valid
async function checkValidLevels(privileges) {
    const groupIds = Object.keys(privileges);
    const invalidGroup = await findAsync(groupIds, async (g) => !GROUP_ROLES.includes(privileges[g]));
    return invalidGroup || null;
}


// Checks if the user is an admin
function isAdmin(context) {
    // console.log(JSON.stringify(context.auth.token));
    return !!context.auth.token.admin;
}

// Check if the user is an admin of the group
function hasGroupRole(context, groupId, role) {
    // check if the role is valid
    if (!GROUP_ROLES.includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid role ${role}`);
    }

    return !!context.auth.token.privileges[groupId] && context.auth.token.privileges[groupId] === role;
}

// Find the administrators of a group
async function getGroupAdmins(groupId) {
    // get all users
    const users = await admin.auth().listUsers();
    // filter out the admins
    const admins = users.users.filter(u => u.customClaims && u.customClaims.privileges && u.customClaims.privileges[groupId] === 'admin');
    // return the uids
    // return admins.map(a => a.uid);
    return admins;
}

// function getGroupRole(privileges, groupName) {
//     const group = privileges.find((p => p.group === groupName));
//     return group.role;
// }

// Creates a new user. Only admins can call this function for now.
// Group admins should be able to create new users in their group.
exports.createUser = functions.https.onCall(async ({ email, displayName, privileges, admin: admin_ }, context ) => {
    // check if the user is an admin
    if (!isAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can create new users');
    }


    // Validate the input
    if (typeof admin_ === 'undefined') {
        throw new functions.https.HttpsError('invalid-argument', 'admin is undefined');
    }

    if (!email) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with one argument "email" containing the email for the user.');
    }

    const invalidGroup = await checkValidGroups(privileges);
    if (invalidGroup) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid group id ${invalidGroup}`);
    }

    const invalidLevelGroup = await checkValidLevels(privileges);
    if (invalidLevelGroup) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid privilege ${privileges[invalidLevelGroup]} level for group ${invalidLevelGroup}`);
    }

    try {
        // Create the user
        const { uid } = await admin.auth().createUser({
            email,
            displayName,
            disabled: false,
            emailVerified: false,
        });

        // Set the custom claims on the newly created user. Just print the error to the console for now.
        try {
            await admin.auth().setCustomUserClaims(uid, { privileges, admin: admin_ });
        } catch (err) {
            console.error('Error setting custom claims:', JSON.stringify(err, null, 2));
        }

        sendWelcomeEmail(email, displayName);

        return { message: 'Successfully created new user', uid };
    } catch (err) {
        console.error('Error creating new user:', JSON.stringify(err, null, 2));
        throw new functions.https.HttpsError('aborted', err.message, err);
    }
});

// Returns the list of all users. Only admins can call this function for now.
// Group admins should be able to list all users in their group.
exports.listAllUsers = functions.https.onCall(async (_data, context) => {
    if (!isAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can list all users');
    }

    try {
        return await admin.auth().listUsers();
    } catch (err) {
        throw new functions.https.HttpsError('internal', err);
    }
})

// Set a user's privileges by updating their custom claims. Also sets the admin claim.
// Only admins can call this function for now.
// Group admins should be able to set the privileges of users in their group.
exports.setUserPrivileges = functions.https.onCall(async ({ email, privileges, admin: _admin }, context) => {
    // if (!GROUP_ROLES.includes(role)) {
    //     throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${role}`);
    // }

    if (!isAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can change user privileges (for now)');
    }

    if (!privileges) privileges = {}

    if (typeof _admin === 'undefined') {
        throw new functions.https.HttpsError('invalid-argument', 'admin is undefined');
    }

    // Check if the roles are valid
    const roles = Object.values(privileges);
    const invalidRole = roles.find(r => !GROUP_ROLES.includes(r));
    if (invalidRole) {
        throw new functions.https.HttpsError('invalid-argument', `Role ${invalidRole} doesn't exist`);
    }

    // Check if the groups are valid
    const groups = Object.keys(privileges);

    // if (Promise.any(groups.map(async g => !(await isValidGroup(g))))) {
    //     throw new functions.https.HttpsError('invalid-argument', `Group ${invalidGroup} doesn't exist`);
    // }
    const invalidGroup = await findAsync(groups, async g => !(await isValidGroup(g)));
    if (invalidGroup) {
        throw new functions.https.HttpsError('invalid-argument', `Group ${invalidGroup} doesn't exist`);
    }

    // Set the user's custom claims
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { privileges, admin: !!_admin });

    return { message: 'Success! Privileges assigned' }
});

// Scheduled Firestore Export every 24 hours
exports.scheduledFirestoreExport = functions.pubsub
    .schedule('every 24 hours')
    .onRun(_context => {
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        const databaseName = client.databasePath(projectId, '(default)');

        return client.exportDocuments({
            name: databaseName,
            outputUriPrefix: backupBucket,
            // collectionIds: ['users']
            collectionIds: []
        }).then(responses => {
            const response = responses[0];
            console.log(`Operation Name: ${response['name']}`);
        }).catch(err => {
            console.error(err);
            throw new Error('Export operation failed');
        });
    });

// Update the user's name in the auth system when the user's name is updated in the database
exports.updateAuthDisplayName = functions.firestore.document('users/{userId}').onUpdate(async (change, context) => {
    const { userId } = context.params;
    const { registrationData: { name }  } = change.after.data();


    // Check if the user already has a displayName
    const user = await admin.auth().getUser(userId);
    if (user.displayName) {
        console.log('User already has a displayName, not updating');
        return;
    }

    try {
        await admin.auth().updateUser(userId, { displayName: name });
    } catch (err) {
        console.error('Error updating user:', err);
    }
});

// Create documents in the mail collection when a user requests to be assigned to a group
exports.sendAssignmentRequestEmail = functions.firestore.document('assignementRequests/{requestId}').onCreate(async (snap, context) => {
    const data = snap.data();
    const { user, group, status, reasons } = data;

    // check if status is 'pending'
    if (status !== 'pending') {
        throw new functions.https.HttpsError('invalid-argument', 'Status must be "pending"');
    }

    // TODO check if group exists - already checked in rules

    // Get group admins
    const admins = await getGroupAdmins(group);
    const adminEmails = admins.map(a => a.email);

    // Get user's name from the auth system
    const { displayName } = await admin.auth().getUser(user);
    
    // Get group name from the database
    const groupDoc = await admin.firestore().collection('groups').doc(group).get();
    const groupName = groupDoc.data().name;

    // create mail document
    const mailDoc = {
        to: adminEmails,
        message: {
            subject: `New assignement request for group ${groupName}`,
            html: `
                <p>Hi,</p>
                <p>User ${displayName} has requested to be assigned to group ${groupName}:</p>
                
                <p style="font-style: italic;">${reasons}</p>

                <p>Go to the <a href="https://ferm.fao.org">FERM group administration page</a> to accept or reject the request</p>

                <p>Best regards,</p>
                <p>the FERM team</p>

            `
        }
    };

    // add mail document to mail collection
    await admin.firestore().collection('mail').add(mailDoc);
});

// Accept or reject an assignment request
exports.acceptOrRejectAssignmentRequest = functions.https.onCall(async ({ requestId, status }, context) => {
    // Check if the user is an admin or a group admin
    if (!isAdmin(context) && !isGroupAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can accept or reject assignment requests');
    }

    // Check if the status is valid
    if (!['accepted', 'rejected'].includes(status)) {
        throw new functions.https.HttpsError('invalid-argument', 'Status must be "accepted" or "rejected"');
    }

    // Get the request
    const requestDoc = await admin.firestore().collection('assignementRequests').doc(requestId).get();
    const request = requestDoc.data();

    // Check if the request exists
    if (!request) {
        throw new functions.https.HttpsError('not-found', 'Request not found');
    }

    // Check if the request is pending
    if (request.status !== 'pending') {
        throw new functions.https.HttpsError('invalid-argument', 'Request is not pending');
    }

    // Get the user's email
    const { email } = await admin.auth().getUser(request.user);

    // Get the group name
    const groupDoc = await admin.firestore().collection('groups').doc(request.group).get();
    const groupName = groupDoc.data().name;

    // Update the request
    await admin.firestore().collection('assignementRequests').doc(requestId).update({ status });

    // Send email to user
    const mailDoc = {
        to: [email],
        message: {
            subject: `Your request to join group ${groupName} has been ${status}`,
            html: `
                <p>Hi,</p>
                <p>Your request to join group ${groupName} has been ${status}.</p>
                <p>Best regards,</p>
                <p>the FERM team</p>
            `
        }
    };

    // add mail document to mail collection
    await admin.firestore().collection('mail').add(mailDoc);
});


// Set default custom claims and create a user record in Firestore when a user is created
exports.createUserRecord = functions.auth.user().onCreate(async ({ uid }) => {
    // get user's custom claims
    const user = await admin.auth().getUser(uid);
    const currentCustomClaims = user.customClaims || {};

    // Try to set default custom claims if not set, just log error if it fails
    try {
        await admin.auth().setCustomUserClaims(uid, {
            admin: false,
            privileges: {},
            ...currentCustomClaims
        });
    } catch (err) {
        console.error('Error setting custom claims:', err);
    }

    // Try to create user record, just log error if it fails
    const newUserRecord = { bpConsentAccepted: false };
    try {
        await admin.firestore().collection(usersCollection).doc(uid).set(newUserRecord);
    } catch (err) {
        console.error('Error creating user record:', err);
    }
});

// Send a welcome email when a user is created manually by an admin
async function sendWelcomeEmail(email, displayName) {
    // create mail document
    const mailDoc = {
        to: [email],
        message: {
            subject: 'Welcome to FERM',
            html: `
                <p>Dear ${displayName},</p>
                <p>Congratulations and welcome to the FERM Registry community! We are pleased to inform you that your request for a new account has been processed, and your user account is now active.</p>
                <p>Username: ${email}</p>
                <p>To access your account, simply visit the FERM Registry homepage at <a href="https://ferm.fao.org/initiatives">https://ferm.fao.org/initiatives</a> and log in. Check <a href="https://www.fao.org/3/cb5046en/cb5046en.pdf">here</a> for guidance on how to use the registry.</p>
                <p>The FERM Registry aims to provide a comprehensive register of ecosystem restoration projects and initiatives in the context of the United Nations Decade on Ecosystem Restoration. By registering your initiatives in the FERM registry, joining our platform, you are contributing to the global restoration movement and helping ensure interoperability with other restoration monitoring platforms and initiatives.</p>
                
                <p>We look forward to supporting you in your ecosystem restoration efforts and are excited to see the positive impact you'll make through your work with the FERM Registry.</p>
                <p>Once again, welcome to the FERM Registry community!</p>
                <p>Best regards,
                <br>
                The FERM Registry team
                </p>
            `
        }
    };

    // <p>If you have any questions or need assistance, we will be launching a dedicated support email and an FAQ section soon. In the meantime, please feel free to reply to this email if you need any help.</p>

    // add mail document to mail collection
    await admin.firestore().collection('mail').add(mailDoc);
}


// Delete a user record in Firestore when a user is deleted
exports.deleteUserRecord = functions.auth.user().onDelete(async ({ uid }) => {
    await admin.firestore().collection(usersCollection).doc(uid).delete();
});

// TODO: deploy this function and configure it as a blocking function in the Firebase console
// Blocks password sign in attempts. Only passwordless and social sign in are allowed
exports.beforeSignIn = functions.auth.user().beforeSignIn((_user, context) => {
    if (context.eventType.endsWith('password')) {
        throw new functions.auth.HttpsError('permission-denied');
    }
});


// New user signup. Everyone can sign up.
// This function is not used anymore. We now use the client SDK to send the email sign in link.
// It might be useful in the future if we want to allow users to sign up with a password and send them an email verification link.
// Initialize client SDK - for sending emails
// const apiKey = 'AIzaSyAt432GRajoVZg2gNtdyQnZyICbhq66H0M';
// firebase.initializeApp({
//     apiKey,
//     credential: admin.credential.applicationDefault()
// });
// exports.signUp = functions.https.onCall(async (data, _context) => {
//     try {
//         // Create the user - do not set the password as we will only allow login via email linkå
//         const { uid } = await admin.auth().createUser({
//             email: data.email,
//             emailVerified: false,
//             displayName: data.fullName,
//             disabled: false
//         });

//         console.log('Successfully created new user:', uid);

//         // Create custom token for the user
//         const customToken = await admin.auth().createCustomToken(uid);
//         // Login with the custom token
//         const auth = getAuth();
//         await signInWithCustomToken(auth, customToken);

//         // Send email sign in link
//         const actionCodeSettings = {
//             url: redirectUrl,
//             handleCodeInApp: true
//         };
//         await sendSignInLinkToEmail(auth, data.email, actionCodeSettings)
//         console.log('Sent sign in link to email ' + data.email);

//         // const customToken = await admin.auth().createCustomToken(uid);
//         // return { customToken };
//         return { message: 'Success! User created.' };
//     } catch (err) {
//         console.error('Error creating new user:', JSON.stringify(err, null, 2));
//         throw new functions.https.HttpsError('aborted', err.message, err);
//     }
// });

