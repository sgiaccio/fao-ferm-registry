const functions = require("firebase-functions");
const admin = require("firebase-admin");

const firestore = require('@google-cloud/firestore');


const firebase = require('firebase/app');
const { getAuth, sendSignInLinkToEmail, signInWithCustomToken } = require('firebase/auth');


// Initialize admin SDK
admin.initializeApp();

// Initialize client SDK - for sending emails
// TODO set apiKey as a env variable when deploying
firebase.initializeApp({
    apiKey: 'AIzaSyAt432GRajoVZg2gNtdyQnZyICbhq66H0M',
    credential: admin.credential.applicationDefault()
});

const GROUP_ROLES = ['admin', 'editor', 'guest'];

// Finds the first element in the array for which the async predicate returns true
async function findAsync(array, predicate) {
    for (const t of array) {
        if (await predicate(t)) {
            return t;
        }
    }
}

async function isValidGroup(groupId) {
    const groupsRef = admin.firestore().collection("groups");
    const snapshot = await groupsRef.doc(groupId).get();

    return snapshot.exists;
}

function isAdmin(context) {
    return !!context.auth.token.admin;
}

// function getGroupRole(privileges, groupName) {
//     const group = privileges.find((p => p.group === groupName));
//     return group.role;
// }

// New user signup. Everyone can sign up.
// TODO: deploy this function
exports.signUp = functions.https.onCall(async (data, _context) => {
    try {
        // Create the user - do not set the password as we will only allow login via email linkå
        const { uid } = await admin.auth().createUser({
            email: data.email,
            emailVerified: false,
            displayName: data.fullName,
            disabled: false
        });

        console.log('Successfully created new user:', uid);

        // Create custom token for the user
        const customToken = await admin.auth().createCustomToken(uid);
        // Login with the custom token
        const auth = getAuth();
        console.log(customToken);
        await signInWithCustomToken(auth, customToken);

        // Send email sign in link
        const actionCodeSettings = {
            url: 'https://ferm.fao.org/',
            handleCodeInApp: true
        };
        await sendSignInLinkToEmail(auth, data.email, actionCodeSettings)
        console.log('Sent sign in link to email ' + data.email);
        
        // const customToken = await admin.auth().createCustomToken(uid);
        // return { customToken };
        return { message: 'Success! User created.' };
    } catch (err) {
        console.error('Error creating new user:', JSON.stringify(err, null, 2));
        throw new functions.https.HttpsError('aborted', err.message, err);
    }
});

// Returns the list of all users (only admins can call this)
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

// // Set a user as an admin
// exports.addAdminRole = functions.https.onCall(async (data, context) => {
//     // check privileges
//     if (!isAdmin(context)) {
//         throw new functions.https.HttpsError('permission-denied', 'Only admins can add other admins');
//     }

//     // get user and add custom claim (admin)
//     try {
//         const user = await admin.auth().getUserByEmail(data.email);
//         await admin.auth().setCustomUserClaims(user.uid, { admin: true });
//         return { message: `Success! ${data.email} has been made an admin` };
//     } catch (err) {
//         throw new functions.https.HttpsError('internal', err);
//     }
// });

// Set users privileges by wringing into the user's custom claims
exports.setUserPrivileges = functions.https.onCall(async ({ email, privileges, admin: _admin }, context) => {
    // if (!GROUP_ROLES.includes(role)) {
    //     throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${role}`);
    // }

    if (!privileges) privileges = {}

    if (typeof _admin === 'undefined') {
        throw new functions.https.HttpsError('invalid-argument', 'admin is undefined');
    }

    if (!isAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can add assign users to groups (for now)');
    }

    // Check if the roles are valid
    const roles = Object.values(privileges);
    const invalidRole = roles.find(r => !GROUP_ROLES.includes(r));
    if (invalidRole) {
        throw new functions.https.HttpsError('invalid-argument', `Role ${invalidRole} doesn't exist`);
    }

    // Check if the groups are valid
    const groups = Object.keys(privileges);
    const invalidGroup = await findAsync(groups, async g => !(await isValidGroup(g)));
    if (invalidGroup) {
        throw new functions.https.HttpsError('invalid-argument', `Group ${invalidGroup} doesn't exist`);
    }

    // Set the user's custom claims
    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { privileges, admin: !!_admin });

    return { message: 'Success! Privileges assigned' }
});


// Schedules a firestore export every 24 hours
const client = new firestore.v1.FirestoreAdminClient();
const bucket = 'gs://fao-ferm-firebase-backup';
exports.scheduledFirestoreExport = functions.pubsub
    .schedule('every 24 hours')
    .onRun(_context => {
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        const databaseName = client.databasePath(projectId, '(default)');

        return client.exportDocuments({
            name: databaseName,
            outputUriPrefix: bucket,
            // Leave collectionIds empty to export all collections
            // or set to a list of collection IDs to export,
            // collectionIds: ['users', 'posts']
            collectionIds: []
        }).then(responses => {
            const response = responses[0];
            console.log(`Operation Name: ${response['name']}`);
        }).catch(err => {
            console.error(err);
            throw new Error('Export operation failed');
        });
    });

// TODO: deploy this function
exports.createUserRecord = functions.auth.user().onCreate(async ({ uid }) => {
    // Try to set default custom claims, just log error if it fails
    try {
        await admin.auth().setCustomUserClaims(uid, {
            admin: false,
            privileges: {}
        });
    } catch (err) {
        console.error('Error setting custom claims:', err);
    }

    // Try to create user record, just log error if it fails
    const newUserRecord = { bpConsentAccepted: false };
    try {
        await admin.firestore().collection('user').doc(uid).set(newUserRecord);
    } catch (err) {
        console.error('Error creating user record:', err);
    }
});

// TODO: deploy this function
exports.deleteUserRecord = functions.auth.user().onDelete(async ({ uid }) => {
    const newUser = { bpConsentAccepted: false };
    await admin.firestore().collection('users').doc(uid).delete();

    return newUser;
});

// TODO: deploy this function
// Blocks password sign in attempts. Only passwordless and social sign in are allowed
exports.beforeSignIn = functions.auth.user().beforeSignIn((_user, context) => {
    if (context.eventType.endsWith('password')) {
        throw new functions.auth.HttpsError('permission-denied');
    }
});
