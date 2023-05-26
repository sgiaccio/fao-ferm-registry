const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = require('@google-cloud/firestore');


// const emailTemplates = require('./emailTemplates');

// Initialize admin SDK
admin.initializeApp();

// These are the roles that can be assigned to users in a group.
// Possibly add 'restricted'? Restricted users could only edit and view their own data
const GROUP_ROLES = ['admin', 'editor', 'guest'];
const STATUSES = ['draft', 'submitted', 'published'];


const db = admin.firestore();
const usersCollection = db.collection('users');
const groupsCollection = db.collection('groups');
const registryCollection = db.collection('registry');
const bestPracticesCollection = db.collection('bestPractices');
const assignmentRequestsCollection = db.collection('assignementRequests'); // Typo in the name
const mailCollection = db.collection('mail');


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
    const snapshot = await groupsCollection.doc(groupId).get();
    return snapshot.exists;
}

// Checks if the groups are valid, returns the first invalid group or null if all are valid
async function checkValidGroups(privileges) {
    // TODO handle the case where privileges is empty!!!

    const groupIds = Object.keys(privileges);
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
function isSuperAdmin(context) {
    if (!context.auth.token) {
        return false;
    }
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
exports.createUser = functions.https.onCall(async ({ email, displayName, privileges, admin: admin_ }, context) => {
    // check if the user is an admin
    if (!isSuperAdmin(context)) {
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
    console.log('listAllUsers called');
    console.log(context.auth);
    if (!context.auth) {
        console.log('User is not authenticated');
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    if (!isSuperAdmin(context)) {
        console.log('Only admins can list all users');
        throw new functions.https.HttpsError('permission-denied', 'Only admins can list all users');
    }

    console.log('ecchice');
    try {
        console.log('riecchice');
        console.log(await(admin.auth().listUsers()));
        return await admin.auth().listUsers();
    } catch (err) {
        console.log('error!');
        console.log(err);
        throw new functions.https.HttpsError('internal', err);
    }
})

// Returns the list of all users in my groups.
exports.listMyGroupsUsers = functions.https.onCall(async (_data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    // Get the groups where the user is group admin
    const groupsWhereAdmin = getGroupsWhereAdmin(context);

    if (groupsWhereAdmin.length === 0) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin or a group admin');
    }

    // Get all the users in the groups
    const allUsers = await admin.auth().listUsers();
    const filteredUsers = allUsers.users.filter(u => u.customClaims && u.customClaims.privileges && groupsWhereAdmin.some(g => u.customClaims.privileges[g]));
    // const users = await Promise.all(groupsWhereAdmin.map(async groupId => {
    //     const groupUsers = allUsers.users.filter(u => u.customClaims && u.customClaims.privileges && u.customClaims.privileges[groupId]);
    //     return groupUsers;
    // }));


    // Delete duplicate users
    const usersNoDuplicates = filteredUsers.reduce((acc, val) => acc.includes(val) ? acc : [...acc, val], []);

    // Make suer that we don't return sensitive data
    return {
        users: usersNoDuplicates.map(u => ({
            uid: u.uid,
            photoURL: u.photoURL,
            displayName: u.displayName,
            enabled: u.enabled,
            customClaims: u.customClaims,
            metadata: u.metadata,
        }))
    };
});


// Set a user's privileges by updating their custom claims. Also sets the admin claim.
// Only admins can call this function for now.
// Group admins should be able to set the privileges of users in their group.
exports.setUserPrivileges = functions.https.onCall(async ({ email, privileges, admin: _admin }, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }
    // if (!GROUP_ROLES.includes(role)) {
    //     throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${role}`);
    // }

    if (!isSuperAdmin(context)) {
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


    // get the previous privileges
    const previousPrivileges = user.customClaims.privileges || {};
    // find the differences between the previous privileges and the new privileges
    const privilegesToAdd = Object.keys(privileges).filter(g => !Object.keys(previousPrivileges).includes(g));
    const privilegesToRemove = Object.keys(previousPrivileges)
        .filter(g => !Object.keys(privileges).includes(g));
    const privilegesToUpdate = Object.keys(previousPrivileges)
        .filter(g => Object.keys(privileges).includes(g) && previousPrivileges[g] !== privileges[g]);

    console.log('privilegesToAdd', privilegesToAdd);
    console.log('privilegesToRemove', privilegesToRemove);
    console.log('privilegesToUpdate', privilegesToUpdate);

    // send email to user with the changes in privileges
    const mailDoc = {
        to: [email],
        message: {
            subject: 'Changes in your FERM privileges',
            html: `
                <p>Hi,</p>
                <p>Your privileges in the FERM Registry have been updated.</p>
                <p>Privileges added: ${privilegesToAdd.join(', ')}</p>
                <p>Privileges removed: ${privilegesToRemove.join(', ')}</p>
                <p>Privileges updated: ${privilegesToUpdate.join(', ')}</p>
                <p>Best regards,</p>
                <p>the FERM team</p>
            `
        }
    };

    // add mail document to mail collection
    await mailCollection.add(mailDoc);

    await admin.auth().setCustomUserClaims(user.uid, { privileges, admin: !!_admin });

    return { message: 'Success! Privileges assigned' }
});

exports.setUserPrivilegesGroupAdmin = functions.https.onCall(async ({ uid, privileges }, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    // check the parameters
    if (!uid) {
        throw new functions.https.HttpsError('invalid-argument', 'uid is undefined');
    }

    if (!privileges) privileges = {}

    // check if the groups are valid
    const invalidAssignedGroup = await checkValidGroups(privileges);
    if (invalidAssignedGroup) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid group id ${invalidAssignedGroup}`);
    }

    // check if the roles are valid
    const roles = Object.values(privileges);
    const invalidRole = roles.find(r => !GROUP_ROLES.includes(r));
    if (invalidRole) {
        throw new functions.https.HttpsError('invalid-argument', `Role ${invalidRole} doesn't exist`);
    }

    // check if the current user is admin of all the groups in privileges
    const groupsWhereAdmin = getGroupsWhereAdmin(context);
    const groupsIds = Object.keys(privileges);
    const invalidGroup = groupsIds.find(g => !groupsWhereAdmin.includes(g));
    if (invalidGroup) {
        throw new functions.https.HttpsError('permission-denied', `User is not admin of group ${invalidGroup}`);
    }

    // throw error if the user is not a member of all the groups in privileges
    const userGroups = await getUserGroupIds(uid);
    const invalidGroup3 = groupsIds.find(g => !userGroups.includes(g));
    if (invalidGroup3) {
        throw new functions.https.HttpsError('permission-denied', `User is not a member of group ${invalidGroup3}`);
    }

    await admin.auth().setCustomUserClaims(uid, { privileges, admin: false });

    return { message: 'Success! Privileges assigned' }
});

// Scheduled Firestore Export every 24 hours
// This is used to export the data from the firestore database
const client = new firestore.v1.FirestoreAdminClient();
// TODO: move this to env variables
const backupBucket = 'gs://fao-ferm-firebase-backup';

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
    const { registrationData: { name } } = change.after.data();


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

async function getUserGroupIds(uid) {
    const user = await admin.auth().getUser(uid);
    const userPrivileges = user.customClaims.privileges;
    const userGroups = Object.keys(userPrivileges);

    return userGroups;
}

async function getSuperAdmins() {
    // TODO store custom claims in a collection in firestore for performance
    const users = await admin.auth().listUsers();
    return users.users.filter(u => u.customClaims && u.customClaims.admin).map(u => ({ uid: u.uid, email: u.email }));
}

// Create documents in the mail collection when a user requests for a new group to be created
exports.sendNewGroupRequestEmail = functions.firestore.document('newGroupRequests/{requestId}').onCreate(async (snap, _context) => {
    const data = snap.data();

    const { userId, name, type, otherType, isa: { partner, actor, flagship } } = data;

    // Get user's name from the auth system
    const { displayName } = await admin.auth().getUser(userId);

    // create mail document
    const mailDoc = {
        to: await getSuperAdminEmails(),
        message: {
            subject: `New group request for group ${name}`,
            html: `
                <p>Hi,</p>
                <p>User ${displayName || 'anonymous'} has requested to create a new group ${name}:</p>
                
                <p>
                Name of the group: ${name}<br>
                Type of the group: ${type} ${type === 'Other' ? ' - Other type: ' + otherType : ''}<br>
                </p>

                <p>
                ${partner ? 'UN Decade partner<br>' : ''}
                ${actor ? 'UN Decade actor<br>' : ''}
                ${flagship ? 'Global Flagship' : ''}
                </p>

                <p>As a superadmin, please go to <a href="https://ferm.fao.org/admin/groups">https://ferm.fao.org/admin/groups</a> to create the new group.</p>

                <p>Best regards,</p>
                <p>the FERM team</p>
            `
        }
    };

    // add mail document to mail collection
    await mailCollection.add(mailDoc);
});


// Create documents in the mail collection when a user requests to be assigned to a group
exports.sendAssignmentRequestEmail = functions.firestore.document('assignementRequests/{requestId}').onCreate(async (snap, context) => {
    const data = snap.data();
    const { userId, groupId, status, reasons } = data;

    // check if status is 'pending'
    if (status !== 'pending') {
        throw new functions.https.HttpsError('invalid-argument', 'Status must be "pending"');
    }

    // TODO check if group exists - already checked in rules

    // Get all group admins
    // Get user's name from the auth system
    const { displayName } = await admin.auth().getUser(userId);

    // Get group name from the database
    const groupDoc = await groupsCollection.doc(groupId).get();
    const groupName = groupDoc.data().name;

    const groupAdminEmails = await getGroupAdminEmails(groupDoc.data());
    let mailDoc = null;
    if (groupAdminEmails > 0) {
        // create mail document
        mailDoc = {
            to: groupAdminEmails,
            message: {
                subject: `New assignement request for group ${groupName}`,
                html: `
                <p>Hi,</p>
                <p>User ${displayName || 'anonymous'} has requested to be assigned to your institution ${groupName}:</p>
                
                <p style="font-style: italic;">${reasons}</p>
        
                <p>As an administrator of the group, please go to <a href="https://ferm.fao.org/admin/groupAssignments">https://ferm.fao.org/admin/groupAssignments</a> to accept or reject the request.</p>
        
                <p>Best regards,</p>
                <p>the FERM team</p>
            `
            }
        };
    } else {
        mailDoc = {
            to: await getSuperAdminEmails(),
            message: {
                subject: `New assignement request for group ${groupName}`,
                html: `
                <p>Hi,</p>
                <p>User ${displayName || 'anonymous'} has requested to be assigned to the institution ${groupName}:</p>
                
                <p style="font-style: italic;">${reasons}</p>
        
                <p>This institution has no administators - as a superadmin please go to <a href="https://ferm.fao.org/admin/groupAssignments">https://ferm.fao.org/admin/groupAssignments</a> to accept or reject the request.</p>
        
                <p>Best regards,</p>
                <p>the FERM team</p>
            `
            }
        }
    }

    // add mail documents to mail collection
    await mailCollection.add(mailDoc);
});

// Set default custom claims and create a user record in Firestore when a user is created
exports.createUserRecord = functions.auth.user().onCreate(async ({ uid }) => {
    console.log('Adding custom claims and creating user record for user', uid);
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
        await usersCollection.doc(uid).set(newUserRecord);
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
    await mailCollection.add(mailDoc);
}


// Delete a user record in Firestore when a user is deleted
exports.deleteUserRecord = functions.auth.user().onDelete(async ({ uid }) => {
    await usersCollection.doc(uid).delete();
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

function getGroupsWhereRole(context, role) {
    const privileges = context.auth.token && context.auth.token.privileges || {};
    return Object.keys(privileges).filter(group => privileges[group] === role);
}

function getGroupsWhereEditor(context) {
    return getGroupsWhereRole(context, 'editor');
}

function getGroupsWhereAdmin(context) {
    return getGroupsWhereRole(context, 'admin');
}

function isGroupAdmin(context, project) {
    const groupsWhereAdmin = getGroupsWhereAdmin(context);
    return groupsWhereAdmin.includes(project.groupId);
}

function isGroupEditor(context, project) {
    const groupsWhereEditor = getGroupsWhereEditor(context);
    return groupsWhereEditor.includes(project.groupId);
}

async function getSuperAdminEmails() {
    const superAdmins = await getSuperAdmins();
    return superAdmins.map(a => a.email);
}

async function getGroupAdminEmails(project) {
    const groupAdmins = await getGroupAdmins(project.groupId);
    return groupAdmins.map(a => a.email);
}

exports.getMyGroupsAssigmentRequests = functions.https.onCall(async (_, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    const groupsWhereAdmin = getGroupsWhereAdmin(context);

    if (groupsWhereAdmin.length === 0 && !isSuperAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'User is not a superadmin nor a group admin');
    }

    // Get the requests
    let requests;
    if (isSuperAdmin(context)) {
        // if superadmin, get all requests
        requests = await assignmentRequestsCollection.get();
    } else {
        // if group admin, get only requests for the groups where the user is admin
        requests = await assignmentRequestsCollection
            .where('groupId', 'in', groupsWhereAdmin)
            .get();
    }

    const requestDocs = requests.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // add user display name to each request
    const requestsWithUserDisplayName = (await Promise.all(requestDocs.map(async request => {
        try {
            const { displayName } = await admin.auth().getUser(request.userId);
            return { ...request, userName: displayName };
        } catch (error) {
            // if the user doesn't exist anymore, skip the request
            console.log('User', request.userId, 'does no longer exist. Skipping request');
            return null;
        }
    }))).filter(r => r !== null);

    // add group name to each request
    const requestsWithUserAndGroupDisplayName = await Promise.all(requestsWithUserDisplayName.map(async request => {
        const groupDoc = await groupsCollection.doc(request.groupId).get();
        const groupName = groupDoc.data().name;
        const dateFormatted = request.createTime.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        return { ...request, groupName, createTime: dateFormatted };
    }));

    return requestsWithUserAndGroupDisplayName;
});

// Accept or reject an assignment request
exports.handleGroupAssignmentRequest = functions.https.onCall(async ({ requestId, status: newStatus }, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    // Check if the user is a group admin of the group the user wants to join
    const groupsWhereAdmin = getGroupsWhereAdmin(context);
    const requestDoc = await assignmentRequestsCollection.doc(requestId).get();
    const request = requestDoc.data();
    if (!groupsWhereAdmin.includes(request.groupId) && !isSuperAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'User is not an admin of the group');
    }

    // Check if the status is valid
    if (!['accepted', 'rejected'].includes(newStatus)) {
        throw new functions.https.HttpsError('invalid-argument', 'Status must be "accepted" or "rejected"');
    }

    // Get the request
    // const requestDoc = await admin.firestore().collection('assignementRequests').doc(requestId).get();
    // const request = requestDoc.data();

    // Check if the request exists
    if (!request) {
        throw new functions.https.HttpsError('not-found', 'Request not found');
    }

    const { status, userId, groupId } = request;

    console.log('Handling request', requestId, 'with userId', userId, 'and groupId', groupId, 'and old status', status, 'and new status', newStatus);

    // Check if the request is pending
    if (status !== 'pending') {
        throw new functions.https.HttpsError('invalid-argument', 'Request is not pending');
    }


    // Check if the group exists
    const groupDoc = await groupsCollection.doc(request.groupId).get();
    const group = groupDoc.data();
    if (!group) {
        throw new functions.https.HttpsError('not-found', 'Group not found');
    }

    // Check if the user exists in the auth service
    const user = await admin.auth().getUser(userId);
    if (!user) {
        throw new functions.https.HttpsError('not-found', 'User not found');
    }

    // Update the request
    await assignmentRequestsCollection.doc(requestId).update({ status: newStatus });

    // Add the user to the group by modifying the privileges in the user's token
    if (newStatus === 'accepted') {
        try {
            const user = await admin.auth().getUser(userId);

            // Custom claims should already be there as they are set when the user signs up. Old users might not have them though.
            let customClaims;

            if (!user.customClaims) {
                customClaims = { privileges: {}, admin: false };
            } else {
                customClaims = { ...user.customClaims, privileges: user.customClaims.privileges || {} };
            }

            customClaims.privileges[groupId] = 'editor';

            console.log('New custom claims:', JSON.stringify(customClaims, null, 2));
            await admin.auth().setCustomUserClaims(userId, customClaims);
        } catch (error) {
            // revert the request status - TODO use a transaction
            await assignmentRequestsCollection.doc(requestId).update({ status });
            console.log(error);
            throw new functions.https.HttpsError('internal', 'Could not add user to group');
        }
    }

    // // Send email to user
    // const { email } = await admin.auth().getUser(userId);
    // const groupName = groupDoc.data().name;
    // const mailDoc = {
    //     to: [email],
    //     message: {
    //         subject: `${groupName} - Membership Request Status`,
    //         html: `
    //             <p>Hi,</p>
    //             <p>This email is to inform you about the status of your membership request to ${groupName}. Your request has been ${newStatus}.</p>
    //             <p>Sincerely,</p>
    //             <p>the FERM team</p>
    //         `
    //     }
    // };

    // // add mail document to mail collection
    // await admin.firestore().collection('mail').add(mailDoc);
});


exports.handleSupportRequest = functions.https.onCall(async ({ firstName, lastName, email, message }, _context) => {
    if (!firstName || !lastName || !email || !message) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing arguments');
    }

    // create mail document
    const mailDoc = {
        to: await getSuperAdminEmails(),
        message: {
            subject: `New support request from ${firstName} ${lastName}`,
            html: `
                <p>Hi,</p>
                <p>${firstName} ${lastName} has sent a support request:</p>
                <p>
                    Name: ${firstName} ${lastName}<br>
                    Email: <a href="mailto:${email}">${email}</a><br>
                </p>

                <p style="font-style: italic;white-space: break-spaces;">${message}</p>

                <p>Best regards,</p>
                <p>the FERM team</p>
            `
        }
    };

    // add mail document to mail collection
    await mailCollection.add(mailDoc);

    return { message: 'Success! Contact request sent.' };
});






// functions.firestore.document('newGroupRequests/{requestId}').onCreate

// Cloud functions that updates the number of good practices in the registry document when a good practice is created or deleted
exports.updateBestPracticesCount = functions.firestore.document('bestPractices/{goodPracticeId}').onWrite(async (change, _context) => {
    // get the project id from the good practice document
    const { projectId } = change.after.data();

    // count the number of good practices for the project
    const bestPractices = await bestPracticesCollection.where('projectId', '==', projectId).count().get();
    const bestPracticesCount = bestPractices.data().count;
    console.log('Updating best practices count for project', projectId, 'to', bestPracticesCount);

    // update the good practices count in the registry document
    await registryCollection.doc(projectId).update({ bestPracticesCount });
});


/************************************************
 * 
 * POJECT PUBLISHING WORKFLOW
 * 
 * **********************************************/



// async function updateStatus(projectRef, newStatus) {
//     // ... the rest of your code here ...

//     if (allowed) {
//         // Get a reference to the Firestore document for the project
//         const projectRef = admin.firestore().collection('projects').doc(project.projectId);
        
//         // Run the update operation as a transaction
//         await admin.firestore().runTransaction(async (transaction) => {
//             // Read the current project document
//             const projectDoc = await transaction.get(projectRef);
            
//             // If the document does not exist, throw an error
//             if (!projectDoc.exists) {
//                 throw new functions.https.HttpsError('invalid-argument', 'Project does not exist');
//             }
            
//             // Update the status of the project
//             transaction.update(projectRef, { status: newStatus });
//         });
//     }

//     // If not allowed, an error should have been thrown before reaching this point
// }

async function updateStatus(projectRef, newStatus) {
    await db.runTransaction(async (transaction) => {
        // Read the current project document
        const projectDoc = await transaction.get(projectRef);

        // Update the status of the project
        transaction.update(projectRef, { status: newStatus });
    });
}

function updateProjectStatus(context, projectRef, newStatus) {
    // Check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    // Check arguments
    if (!projectRef.exists) {
        throw new functions.https.HttpsError('invalid-argument', 'Project does not exist');
    }
    if (!newStatus) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing new status');
    }

    const oldStatus = project.status;

    if (oldStatus === newStatus) {
        throw new functions.https.HttpsError('invalid-argument', 'Old status and new status are the same');
    }

    if (!STATUSES.includes(newStatus)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid status');
    }

    // Check if the user is authorized to update the project status
    if (isSuperAdmin(context)) {
        // superadmin can update from any status to any status
        updateStatus(projectRef, newStatus);
    } else if (user.role === 'admin') {
        // group admins can update from 'draft' to 'submitted' and from 'submitted' to 'draft' (when they reject a project submission)
        if ((oldStatus === 'draft' && newStatus === 'submitted') || (oldStatus === 'submitted' || newStatus === 'draft')) {
            updateStatus(projectRef, newStatus);
            // they can also update from 'submitted' to 'published' or from 'published' to 'draft' (when they unpublish a project) 
        } else if ((oldStatus === 'submitted' && newStatus === 'published') || (oldStatus === 'published' || newStatus === 'draft')) {
            updateStatus(projectRef, newStatus);
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Group admins can only update from draft to submitted, from submitted to draft, or from submitted to published.');
        }
    } else if (user.role === 'editor') {
        // editors can update from 'draft' to 'submitted' only if they are the author of the project
        if (newStatus === 'submitted' && oldStatus === 'draft' && user.id === project.authorId) {
            updateStatus(projectRef, newStatus);
        } else {
            throw new functions.https.HttpsError('permission-denied', 'Editors can only update to draft status if they are the author of the project.');
        }
    } else {
        throw new functions.https.HttpsError('permission-denied', 'User is not authorized to update project status');
    }
}

exports.submitProject = functions.https.onCall(async ({ projectId }, context) => {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    // check arguments
    if (!projectId) {
        throw new functions.https.HttpsError('invalid-argument', 'Missing arguments');
    }

    // get the project document from Firestore
        const projectRef = await registryCollection.doc(projectId).get();
    // check that the project exists
    if (!projectRef.exists) {
        throw new functions.https.HttpsError('not-found', 'Project not found');
    }
    
    const project = projectRef.data();

    // check that the project status is 'draft' - only draft projects can be submitted   
    if (project.status && project.status !== 'draft') {
        throw new functions.https.HttpsError('invalid-argument', 'Project status must be "draft"');
    }

    const isAdmin = isGroupAdmin(context, project);
    const isAuthorAndEditor = isGroupEditor(context, project) && project.created_by === context.auth.uid;
    const authorized = isSuperAdmin(context) || isAdmin || isAuthorAndEditor;
    if (!authorized) {
        throw new functions.https.HttpsError('permission-denied', 'User is not a super admin, nor a group admin, nor a group editor and owner of the project');
    }

    // updateProjectStatus also checks if the user is authorized to update the project status
    // updateStatus(projectRef, 'submitted');
    console.log('Updating project status to submitted');
    registryCollection.doc(projectId).update({ status: 'submitted' });
    console.log('Project status updated to submitted');

    // send email to group admins
    // const groupAdminEmails = await getGroupAdminEmails(project);
    // const groupDoc = await groupsCollection.doc(project.groupId).get();
    // const groupName = groupDoc.data().name;

    // const mailDoc = emailTemplates.submittedForReview(groupAdminEmails, groupName, projectId, project.project.title);
    // await mailCollection.add(mailDoc);

    // return { message: 'Success! Project submitted.' };
});
