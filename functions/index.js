const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const { Firestore } = require('firebase-admin/firestore');

const firestore = require('@google-cloud/firestore');

// import util functions
const util = require('./util');

// Creates a new user. Only admins can call this function for now.
// Group admins should be able to create new users in their group.
exports.createUser = functions.https.onCall(
    async ({ email, displayName, privileges, admin: admin_ }, context) => {
        // check if the user is an admin
        if (!util.isSuperAdmin(context)) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Only admins can create new users',
            );
        }

        // Validate the input
        if (typeof admin_ === 'undefined') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'admin is undefined',
            );
        }

        if (!email) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'The function must be called with one argument "email" containing the email for the user.',
            );
        }

        const invalidGroup = await util.checkValidGroups(privileges);
        if (invalidGroup) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Invalid group id ${invalidGroup}`,
            );
        }

        const invalidLevelGroup = await util.checkValidLevels(privileges);
        if (invalidLevelGroup) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Invalid privilege ${privileges[invalidLevelGroup]} level for group ${invalidLevelGroup}`,
            );
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
                await admin
                    .auth()
                    .setCustomUserClaims(uid, { privileges, admin: admin_ });
            } catch (err) {
                console.error(
                    'Error setting custom claims:',
                    JSON.stringify(err, null, 2),
                );
            }

            await sendWelcomeEmail(email, displayName);

            return { message: 'Successfully created new user', uid };
        } catch (err) {
            console.error(
                'Error creating new user:',
                JSON.stringify(err, null, 2),
            );
            throw new functions.https.HttpsError('aborted', err.message, err);
        }
    },
);

// Returns the list of all users. Only admins can call this function for now.
async function _fetchAllUsers() {
    // Get all users by making multiple requests if needed
    let allUsers = [];
    let pageToken = undefined;

    // Loop until we've fetched all users
    do {
        // Get a batch of users (max 1000 per call)
        const listUsersResult = await admin.auth().listUsers(1000, pageToken);

        // Add the users from this batch to our result
        allUsers = [...allUsers, ...listUsersResult.users];

        // Get the page token for the next batch (if any)
        pageToken = listUsersResult.pageToken;
    } while (pageToken);

    // Return just the users array that contains all users
    return { users: allUsers };
}

// Group admins should be able to list all users in their group.
exports.listAllUsers = functions.https.onCall(async (_data, context) => {
    if (!context.auth) {
        console.log('User is not authenticated');
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User is not authenticated',
        );
    }

    if (!util.isSuperAdmin(context)) {
        console.log('Only admins can list all users');
        throw new functions.https.HttpsError(
            'permission-denied',
            'Only admins can list all users',
        );
    }

    try {
        return await _fetchAllUsers();
    } catch (err) {
        console.log(err);
        throw new functions.https.HttpsError('internal', err);
    }
});

// exports.listMyGroupsUsers = functions.https.onCall(async (_data, context) => {
//     if (!context.auth) {
//         throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
//     }
//
//     try {
//         const myGroups = Object.keys(context.auth.token?.privileges || {});
//
//         // Get all the users in all of my groups
//         const allUsers = await admin.auth().listUsers();
//         const filteredUsers = allUsers.users
//             .filter(u => Object.keys(u.customClaims?.privileges || {})
//                 .some(g => myGroups.includes(g))
//             ).filter(u => !u.disabled);
//
//         // Make sure that we don't return sensitive data
//         return {
//             users: filteredUsers.map(u => ({
//                 uid: u.uid,
//                 photoURL: u.photoURL,
//                 displayName: u.displayName
//             }))
//         };
//     } catch (error) {
//         console.error("Error in listMyGroupsUsers function:", error);
//         throw new functions.https.HttpsError("internal", "Something went wrong. Please try again later.");
//     }
// });

// This function returns the list of editors in the given group
exports.listGroupEditors = functions.https.onCall(
    async ({ groupId }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User is not authenticated',
            );
        }

        // check that the user is an admin or an editor of the group or a superadmin
        const isSuperAdmin = util.isSuperAdmin(context);
        const groupsWhereAdmin = util.getGroupsWhereAdmin(context);
        const groupsWhereEditor = util.getGroupsWhereEditor(context);
        const isGroupAdmin = groupsWhereAdmin.includes(groupId);
        const isGroupEditor = groupsWhereEditor.includes(groupId);

        // const isGroupEditor = util.isGroupEditor(context, groupId);
        if (
            !isSuperAdmin && // this will be needed when we will allow superadmins to list all users and invite them to groups or assign them as collaborators to initiatives
            !isGroupAdmin &&
            !isGroupEditor
        ) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'User is not a superadmin nor an admin nor an editor of the group',
            );
        }

        try {
            // Get all the users
            const allUsers = await _fetchAllUsers();
            // get only the users that are editors of the group
            const filteredUsers = allUsers.users.filter(
                (u) =>
                    u.customClaims &&
                    u.customClaims.privileges &&
                    u.customClaims.privileges[groupId] === 'editor',
            );
            return {
                users: filteredUsers.map((u) => ({
                    uid: u.uid,
                    photoURL: u.photoURL,
                    displayName: u.displayName,
                    enabled: u.enabled,
                    metadata: u.metadata,
                })),
            };
        } catch (error) {
            console.error('Error in listMyGroupEditors function:', error);
            throw new functions.https.HttpsError(
                'internal',
                'Something went wrong. Please try again later.',
            );
        }
    },
);

exports.listAdminGroupsUsers = functions.https.onCall(
    async (_data, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User is not authenticated',
            );
        }

        try {
            // Get the groups where the user is group admin
            const groupsWhereAdmin = util.getGroupsWhereAdmin(context);

            if (groupsWhereAdmin.length === 0) {
                throw new functions.https.HttpsError(
                    'permission-denied',
                    'User is not an admin or a group admin',
                );
            }

            // Get all the users in the groups
            const allUsers = await _fetchAllUsers();
            const filteredUsers = allUsers.users.filter(
                (u) =>
                    u.customClaims &&
                    u.customClaims.privileges &&
                    groupsWhereAdmin.some((g) => u.customClaims.privileges[g]),
            );

            // Delete duplicate users
            // const usersNoDuplicates = filteredUsers.reduce((acc, val) => acc.includes(val) ? acc : [...acc, val], []);

            // Make sure that we don't return sensitive data
            return {
                users: filteredUsers.map((u) => ({
                    uid: u.uid,
                    photoURL: u.photoURL,
                    displayName: u.displayName,
                    enabled: u.enabled,
                    customClaims: u.customClaims,
                    metadata: u.metadata,
                })),
            };
        } catch (error) {
            console.error('Error in listAdminGroupsUsers function:', error);
            throw new functions.https.HttpsError(
                'internal',
                'Something went wrong. Please try again later.',
            );
        }
    },
);

// Set a user's privileges by updating their custom claims. Also sets the admin claim.
// Only admins can call this function for now.
// Group admins should be able to set the privileges of users in their group.
exports.setUserPrivileges = functions.https.onCall(
    async ({ email, privileges, admin: _admin }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User is not authenticated',
            );
        }
        if (!util.isSuperAdmin(context)) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'Only admins can change user privileges (for now)',
            );
        }

        if (!privileges) privileges = {};

        if (typeof _admin === 'undefined') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'admin is undefined',
            );
        }

        // Check if the roles are valid
        const roles = Object.values(privileges);
        const invalidRole = roles.find((r) => !util.GROUP_ROLES.includes(r));
        if (invalidRole) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Role ${invalidRole} doesn't exist`,
            );
        }

        // Check if the groups are valid
        const groups = Object.keys(privileges);

        const invalidGroup = await util.findAsync(
            groups,
            async (g) => !(await util.isValidGroup(g)),
        );
        if (invalidGroup) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                `Group ${invalidGroup} doesn't exist`,
            );
        }

        // Set the user's custom claims
        const user = await admin.auth().getUserByEmail(email);
        const newCustomClaims = { privileges, admin: !!_admin };

        await admin.auth().setCustomUserClaims(user.uid, newCustomClaims);

        // update the custom claims in the user collection
        await util.usersCollection
            .doc(user.uid)
            .set({ customClaims: newCustomClaims }, { merge: true });

        return { message: 'Success! Privileges assigned' };
    },
);

exports.setUserPrivilegesGroupAdmin = functions.https.onCall(
    async ({ uid, privileges }, context) => {
        validateInputs(uid, context);

        privileges = privileges || {};

        await checkValidGroups(privileges);
        checkValidRoles(privileges);
        await checkAdminOfAllGroups(privileges, context);
        // await checkUserMemberOfAllGroups(context.auth.uid, privileges);

        return await setPrivileges(uid, privileges, context);
    },
);

async function validateInputs(uid, context) {
    if (!context.auth) {
        throw new functions.https.HttpsError(
            'unauthenticated',
            'User is not authenticated',
        );
    }

    if (!uid) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            'uid is undefined',
        );
    }
}

async function checkValidGroups(privileges) {
    const invalidAssignedGroup = await util.checkValidGroups(privileges);
    if (invalidAssignedGroup) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            `Invalid group id ${invalidAssignedGroup}`,
        );
    }
}

function checkValidRoles(privileges) {
    const roles = Object.values(privileges);
    const invalidRole = roles.find((r) => !util.GROUP_ROLES.includes(r));
    if (invalidRole) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            `Role ${invalidRole} doesn't exist`,
        );
    }
}

async function checkAdminOfAllGroups(privileges, context) {
    const groupsWhereAdmin = util.getGroupsWhereAdmin(context);
    const groupsIds = Object.keys(privileges);
    const invalidGroup = groupsIds.find((g) => !groupsWhereAdmin.includes(g));
    if (invalidGroup) {
        throw new functions.https.HttpsError(
            'permission-denied',
            `Requestin user is not admin of group ${invalidGroup}`,
        );
    }
}

// async function checkUserMemberOfAllGroups(uid, privileges) {
//     const userGroups = await getUserGroupIds(uid);
//     const groupsIds = Object.keys(privileges);
//     const invalidGroup2 = groupsIds.find(g => !userGroups.includes(g));
//     if (invalidGroup2) {
//         throw new functions.https.HttpsError("permission-denied", `Requesting user is not a member of group ${invalidGroup2}`);
//     }
// }

async function setPrivileges(uid, privileges, context) {
    console.log('Setting privileges for user', uid, 'to', privileges);

    const currentCustomClaims =
        (await admin.auth().getUser(uid)).customClaims || {};

    // build a new privileges object by merging the current privileges with the new ones, from the old privileges remove the ones
    // that are not in the new privileges and where the user is admin
    const mergedPrivileges = {
        ...currentCustomClaims.privileges,
        ...privileges,
    };
    const groupsWhereAdmin = util.getGroupsWhereAdmin(context);
    const newPrivileges = Object.keys(mergedPrivileges).reduce((acc, p) => {
        if (groupsWhereAdmin.includes(p) && !privileges[p]) {
            return acc;
        }
        return { ...acc, [p]: mergedPrivileges[p] };
    }, {});

    const newCustomClaims = {
        ...currentCustomClaims,
        privileges: newPrivileges,
    };

    try {
        await admin.auth().setCustomUserClaims(uid, newCustomClaims);
        console.log(
            'New custom claims:',
            JSON.stringify(newCustomClaims, null, 2),
        );
        return { message: 'Success! Privileges assigned' };
    } finally {
        try {
            await util.usersCollection
                .doc(uid)
                .set({ customClaims: newCustomClaims }, { merge: true });
        } catch (error) {
            console.error(
                'Error updating user custom claims in the user collection:',
                error,
            );
        }
    }
}

// exports.setUserPrivilegesGroupAdmin_ = functions.https.onCall(async ({ uid, privileges }, context) => {
//     if (!context.auth) {
//         throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
//     }

//     // check the parameters
//     if (!uid) {
//         throw new functions.https.HttpsError("invalid-argument", "uid is undefined");
//     }

//     if (!privileges) privileges = {};

//     // check if the groups are valid
//     const invalidAssignedGroup = await util.checkValidGroups(privileges);
//     if (invalidAssignedGroup) {
//         throw new functions.https.HttpsError("invalid-argument", `Invalid group id ${invalidAssignedGroup}`);
//     }

//     // check if the roles are valid
//     const roles = Object.values(privileges);
//     const invalidRole = roles.find(r => !util.GROUP_ROLES.includes(r));
//     if (invalidRole) {
//         throw new functions.https.HttpsError("invalid-argument", `Role ${invalidRole} doesn't exist`);
//     }

//     // check if the current user is admin of all the groups in privileges
//     const groupsWhereAdmin = util.getGroupsWhereAdmin(context);
//     const groupsIds = Object.keys(privileges);
//     const invalidGroup = groupsIds.find(g => !groupsWhereAdmin.includes(g));
//     if (invalidGroup) {
//         throw new functions.https.HttpsError("permission-denied", `User is not admin of group ${invalidGroup}`);
//     }

//     // throw error if the user is not a member of all the groups in privileges
//     const userGroups = await getUserGroupIds(uid);
//     const invalidGroup2 = groupsIds.find(g => !userGroups.includes(g));
//     if (invalidGroup2) {
//         throw new functions.https.HttpsError("permission-denied", `User is not a member of group ${invalidGroup2}`);
//     }

//     console.log("Setting privileges for user", uid, "to", privileges);

//     const currentCustomClaims = (await admin.auth().getUser(uid)).customClaims || {};
//     const newCustomClaims = {
//         admin: !!currentCustomClaims.admin,
//         privileges: { ...currentCustomClaims.privileges, ...privileges }
//     };

//     try {
//         await admin.auth().setCustomUserClaims(uid, newCustomClaims);
//         console.log("New custom claims:", JSON.stringify(newCustomClaims, null, 2));
//         return { message: "Success! Privileges assigned" };
//     } finally {
//         try {
//             await util.usersCollection.doc(uid).set({ customClaims: newCustomClaims }, { merge: true });
//         } catch (error) {
//             console.error("Error updating user custom claims in the user collection:", error);
//         }
//     }
// });

// Scheduled Firestore Export every 24 hours
// This is used to export the data from the firestore database
const client = new firestore.v1.FirestoreAdminClient();
// TODO: move this to env variables
const backupBucket = 'gs://fao-ferm-firebase-backup';

exports.scheduledFirestoreExport = functions.pubsub
    .schedule('every 24 hours')
    .onRun((_context) => {
        const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
        const databaseName = client.databasePath(projectId, '(default)');

        return client
            .exportDocuments({
                name: databaseName,
                outputUriPrefix: backupBucket,
                // collectionIds: ['users']
                collectionIds: [],
            })
            .then((responses) => {
                const response = responses[0];
                console.log(`Operation Name: ${response['name']}`);
            })
            .catch((err) => {
                console.error(err);
                throw new Error('Export operation failed');
            });
    });

// Update the user's name in the auth system when the user's name is updated in the database
exports.updateAuthDisplayName = functions.firestore
    .document('users/{userId}')
    .onUpdate(async (change, context) => {
        const { userId } = context.params;
        const {
            registrationData: { name },
        } = change.after.data();

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

    return Object.keys(userPrivileges);
}

// Create documents in the mail collection when a user requests to be assigned to a group
exports.sendAssignmentRequestEmail = functions.firestore
    .document('assignementRequests/{requestId}')
    .onCreate(async (snap, _context) => {
        const data = snap.data();
        const { userId, groupId, status, reasons } = data;

        // check if status is 'pending'
        if (status !== 'pending') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Status must be "pending"',
            );
        }

        // TODO check if group exists - already checked in rules

        // Get all group admins
        // Get user's name from the auth system
        const { displayName, email } = await admin.auth().getUser(userId);

        // Get group name from the database
        const groupDoc = await util.groupsCollection.doc(groupId).get();

        let mailDoc;
        const groupAdminEmails = await util.getGroupAdminEmails(groupId);
        const groupName = groupDoc.data().name;
        console.log(groupAdminEmails);
        if (groupAdminEmails.length > 0) {
            // create mail document
            mailDoc = {
                to: groupAdminEmails,
                message: {
                    subject: `New assignment request for group ${groupName}`,
                    html: `
                <p>Hi,</p>
                <p>User ${displayName || '<i>anonymous</i>'} (${email}) has requested to be assigned to your institution ${groupName}:</p>

                <p style="font-style: italic;">${reasons}</p>

                <p>As an administrator of the group, please go to <a href="https://ferm.fao.org/admin/groupAssignments">https://ferm.fao.org/admin/groupAssignments</a> to accept or reject the request.</p>

                <p>Best regards,</p>
                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `,
                },
            };
        } else {
            mailDoc = {
                to: await util.getSuperAdminEmails(),
                message: {
                    subject: `New assignment request for group ${groupName}`,
                    html: `
                <p>Hi,</p>
                <p>User ${displayName || '<i>anonymous</i>'} (${email}) has requested to be assigned to the institution ${groupName}:</p>

                <p style="font-style: italic;">${reasons}</p>

                <p>This institution has no administators - as a superadmin please go to <a href="https://ferm.fao.org/admin/groupAssignments">https://ferm.fao.org/admin/groupAssignments</a> to accept or reject the request.</p>

                <p>Best regards,</p>
                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `,
                },
            };
        }

        // add mail documents to mail collection
        await util.mailCollection.add(mailDoc);
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
            ...currentCustomClaims,
        });
    } catch (err) {
        console.error('Error setting custom claims:', err);
    }

    // Try to create user record, just log error if it fails
    const newUserRecord = { bpConsentAccepted: false };
    try {
        await util.usersCollection.doc(uid).set(newUserRecord, { merge: true });
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
            `,
        },
    };

    // <p>If you have any questions or need assistance, we will be launching a dedicated support email and an FAQ section soon. In the meantime, please feel free to reply to this email if you need any help.</p>

    // add mail document to mail collection
    await util.mailCollection.add(mailDoc);
}

// Delete a user record in Firestore when a user is deleted
exports.deleteUserRecord = functions.auth.user().onDelete(async ({ uid }) => {
    await util.usersCollection.doc(uid).delete();
});

// Deploy this function and configure it as a blocking function in the Firebase console
// Blocks password sign in attempts. Only password-less and social sign in are allowed
exports.beforeSignIn = functions.auth.user().beforeSignIn((user, context) => {
    if (context.eventType.endsWith('password')) {
        throw new functions.auth.HttpsError(
            'permission-denied',
            'Password sign in is not allowed',
        );
    }

    util.usersCollection.doc(user.uid).update({
        lastSignInTime: Firestore.FieldValue.serverTimestamp(),
    });
});

// // This blocking function updates the lastLogin field in the user record when a user logs in
// exports.afterSignIn = functions.auth.user().beforeSignIn((user, _context) => {
// });

// New user signup. Everyone can sign up.
// This function is not used anymore. We now use the client SDK to send the email sign in link.
// It might be useful in the future if we want to allow users to sign up with a password and email them a verification link.
// Initialize client SDK - for sending emails
// const apiKey = 'AIzaSyAt432GRajoVZg2gNtdyQnZyICbhq66H0M';
// firebase.initializeApp({
//     apiKey,
//     credential: admin.credential.applicationDefault()
// });
// exports.signUp = functions.https.onCall(async (data, _context) => {
//     try {
//         // Create the user - do not set the password as we will only allow login via email link
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

exports.getMyGroupsAssigmentRequests = functions.https.onCall(
    async (_, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User is not authenticated',
            );
        }

        const groupsWhereAdmin = util.getGroupsWhereAdmin(context);

        if (groupsWhereAdmin.length === 0 && !util.isSuperAdmin(context)) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'User is not a superadmin nor a group admin',
            );
        }

        // Get the requests
        let requests;
        if (util.isSuperAdmin(context)) {
            // if superadmin, get all requests
            requests = await util.assignmentRequestsCollection.get();
        } else {
            // if group admin, get only requests for the groups where the user is admin
            requests = await util.assignmentRequestsCollection
                .where('groupId', 'in', groupsWhereAdmin)
                .get();
        }

        const requestDocs = requests.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        // add user display name to each request
        const requestsWithUserDisplayName = (
            await Promise.all(
                requestDocs.map(async (request) => {
                    try {
                        const { displayName } = await admin
                            .auth()
                            .getUser(request.userId);
                        return { ...request, userName: displayName };
                    } catch (error) {
                        // if the user doesn't exist anymore, skip the request
                        console.log(
                            'User',
                            request.userId,
                            'does no longer exist. Skipping request',
                        );
                        return null;
                    }
                }),
            )
        ).filter((r) => r !== null);

        // add group name and format date to each request
        return await Promise.all(
            requestsWithUserDisplayName.map(async (request) => {
                const groupDoc = await util.groupsCollection
                    .doc(request.groupId)
                    .get();
                const dateFormatted = request.createTime
                    .toDate()
                    .toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                if (!groupDoc.exists) {
                    return {
                        ...request,
                        createTime: dateFormatted,
                        groupNotExisting: true,
                        groupName: 'Group not existing',
                    };
                }
                const groupName = groupDoc.data().name;
                return { ...request, groupName, createTime: dateFormatted };
            }),
        );
    },
);

// Accept or reject an assignment request
exports.handleGroupAssignmentRequest = functions.https.onCall(
    async ({ requestId, status: newStatus }, context) => {
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User is not authenticated',
            );
        }

        // Check if the user is a group admin of the group the user wants to join
        const groupsWhereAdmin = util.getGroupsWhereAdmin(context);
        const requestDoc = await util.assignmentRequestsCollection
            .doc(requestId)
            .get();
        const request = requestDoc.data();
        if (
            !groupsWhereAdmin.includes(request.groupId) &&
            !util.isSuperAdmin(context)
        ) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'User is not an admin of the group',
            );
        }

        // Check if the status is valid
        if (!['accepted', 'rejected'].includes(newStatus)) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Status must be "accepted" or "rejected"',
            );
        }

        // Get the request
        // const requestDoc = await admin.firestore().collection('assignementRequests').doc(requestId).get();
        // const request = requestDoc.data();

        // Check if the request exists
        if (!request) {
            throw new functions.https.HttpsError(
                'not-found',
                'Request not found',
            );
        }

        const { status, userId, groupId } = request;

        console.log(
            'Handling request',
            requestId,
            'with userId',
            userId,
            'and groupId',
            groupId,
            'and old status',
            status,
            'and new status',
            newStatus,
        );

        // Check if the request is pending
        if (status !== 'pending') {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Request is not pending',
            );
        }

        // Check if the group exists
        const groupDoc = await util.groupsCollection.doc(request.groupId).get();
        const group = groupDoc.data();
        if (!group) {
            throw new functions.https.HttpsError(
                'not-found',
                'Group not found',
            );
        }

        // Check if the user exists in the auth service
        const user = await admin.auth().getUser(userId);
        if (!user) {
            throw new functions.https.HttpsError('not-found', 'User not found');
        }

        // Update the request
        await util.assignmentRequestsCollection
            .doc(requestId)
            .update({ status: newStatus });

        // Add the user to the group by modifying the privileges in the user's token
        if (newStatus === 'accepted') {
            try {
                const user = await admin.auth().getUser(userId);

                // Custom claims should already be there as they are set when the user signs up. Old users might not have them though.
                let customClaims;

                if (!user.customClaims) {
                    customClaims = { privileges: {}, admin: false };
                } else {
                    customClaims = {
                        ...user.customClaims,
                        privileges: user.customClaims.privileges || {},
                    };
                }

                customClaims.privileges[groupId] = 'editor';

                console.log(
                    'New custom claims:',
                    JSON.stringify(customClaims, null, 2),
                );
                await admin.auth().setCustomUserClaims(userId, customClaims);

                // update the custom claims in the user collection - set the whole custom claims object
                await util.usersCollection
                    .doc(userId)
                    .set({ customClaims }, { merge: true });
            } catch (error) {
                // revert the request status - TODO use a transaction
                await util.assignmentRequestsCollection
                    .doc(requestId)
                    .update({ status });
                console.log(error);
                throw new functions.https.HttpsError(
                    'internal',
                    'Could not add user to group',
                );
            }
        }

        // Send email to user
        const { email } = await admin.auth().getUser(userId);
        const groupName = groupDoc.data().name;
        const mailDoc = {
            to: [email],
            message: {
                subject: `${groupName} - Membership Request Status`,
                html:
                    newStatus === 'rejected'
                        ? `
                <p>Dear ${user.displayName || user.email || 'User'},</p>

                <p>Your request to join ${groupName ? 'the institution, <strong>' + groupName + '</strong>,' : 'our institution'} has been reviewed.</p>

                <p>At this time, we are unable to accept your request. This decision does not reflect on your commitment to environmental restoration, and we encourage continued participation in related activities.</p>

                <p>More information about your qualifications or interest in the institution could assist in future decisions. Therefore, you are welcome to provide additional details and resubmit your request if you wish.</p>

                <p>For any inquiries, or to resubmit your request, please contact <a href="mailto:ferm-support@fao.org">ferm-support@fao.org</a>.</p>

                <p>Thank you for your understanding.</p>

                <p>Best regards,</p>

                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `
                        : `
                <p>Dear ${user.displayName || user.email || 'User'},</p>

                <p>Your request to join ${groupName ? 'the institution, <strong>' + groupName + '</strong>,' : 'our institution'} has been reviewed.</p>

                <p>We are pleased to inform you that your request has been accepted. You are now a member and can participate in related activities.</p>

                <p>For any inquiries, please contact <a href="mailto:ferm-support@fao.org">ferm-support@fao.org</a>.</p>

                <p>Thank you.</p>

                <p>Best regards,</p>

                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `,

                //     <p>Hi,</p>
                //     <p>This email is to inform you about the status of your membership request to ${groupName}. Your request has been ${newStatus}.</p>
                //     <p>Sincerely,</p>
                //     <p>the FERM team</p>
                // `
            },
        };

        const bcc = await util.getGroupAdminEmails(groupId);
        if (bcc.length > 0) {
            mailDoc.bcc = bcc;
        }

        // add mail document to mail collection
        await admin.firestore().collection('mail').add(mailDoc);
    },
);

// exports.deleteProject = functions.https.onCall(async ({ projectId }, context) => {
//     // Check arguments
//     if (!projectId) {
//         throw new functions.https.HttpsError('invalid-argument', 'Missing arguments');
//     }
//
//     // get the project document from Firestore
//     const projectRef = await util.registryCollection.doc(projectId).get();
//     // check that the project exists
//     if (!projectRef.exists) {
//         throw new functions.https.HttpsError("not-found", "Project not found");
//     }
//
//
//     const isGroupAdmin = util.isGroupAdmin(context, project);
//     const authorized = util.isSuperAdmin(context) || isGroupAdmin;
//     if (!authorized) {
//         throw new functions.https.HttpsError("permission-denied", "User is not a super admin nor a group admin");
//     }
//
//
//     // Check if the project exists
//     const projectDoc = await util.projectsCollection.doc(projectId).get();
//     const project = projectDoc.data();
//     if (!project) {
//         throw new functions.https.HttpsError('not-found', 'Project not found');
//     }
//
//     // Delete the project and the areas subcollection in batch
//     const batch = admin.firestore().batch();
//     batch.delete(util.projectsCollection.doc(projectId));
//     const areasQuery = await util.projectsCollection.doc(projectId).collection('areas').get();
//     areasQuery.forEach(areaDoc => batch.delete(areaDoc.ref));
//
//     await batch.commit();
// });

exports.handleSupportRequest = functions.https.onCall(
    async ({ firstName, lastName, email, message }, _context) => {
        if (!firstName || !lastName || !email || !message) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing arguments',
            );
        }

        // create mail document
        const mailDoc = {
            to: ['FERM-Support@fao.org', ...(await util.getSuperAdminEmails())],
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
                <p>The FERM Team<br>
                <a href="http://ferm.fao.org">Framework for Ecosystem Restoration Monitoring portal</a></p>
            `,
            },
        };

        // add mail document to mail collection
        await util.mailCollection.add(mailDoc);

        return { message: 'Success! Contact request sent.' };
    },
);

// functions.firestore.document('newGroupRequests/{requestId}').onCreate

// Cloud functions that updates the number of good practices in the registry document when a good practice is created or deleted
exports.updateBestPracticesCount = functions.firestore
    .document('registry/{projectId}/bestPractices/{goodPracticeId}')
    .onWrite(async (_change, context) => {
        const projectId = context.params.projectId;

        // count the number of good practices for the project
        const bestPracticesRef = admin
            .firestore()
            .collection('registry')
            .doc(projectId)
            .collection('bestPractices');
        const snapshot = await bestPracticesRef.get();
        const bestPracticesCount = snapshot.docs.length;

        console.log(
            'Updating best practices count for project',
            projectId,
            'to',
            bestPracticesCount,
        );

        // update the good practices count in the registry document
        await admin
            .firestore()
            .collection('registry')
            .doc(projectId)
            .update({ bestPracticesCount });

        // // get the project id from the good practice document
        // const { projectId } = change.after.data();

        // // count the number of good practices for the project
        // const bestPractices = await util.bestPracticesCollection.where("projectId", "==", projectId).count().get();
        // const bestPracticesCount = bestPractices.data().count;

        // console.log("Updating best practices count for project", projectId, "to", bestPracticesCount);

        // // update the good practices count in the registry document
        // await util.registryCollection.doc(projectId).update({ bestPracticesCount });
    });

// async function updatedCreatedByName(createdBy, projectId, snapshot) {
//     try {
//         // get the user's name from the auth system
//         const { displayName } = await admin.auth().getUser(createdBy);
//         functions.logger.info("Updating created_by_name for project", projectId, "to", displayName);

//         // update the created_by_name field in the project document
//         if (displayName) {
//             await util.registryCollection.doc(snapshot.id).update({ created_by_name: displayName });
//         } else {
//             functions.logger.warn("No displayName found for user:", createdBy);
//         }
//     } catch (error) {
//         functions.logger.error("Error getting user:", createdBy, error);
//     }
// }

// exports.addProjectCreatedByName = functions.firestore.document("registry/{projectId}").onCreate(async (snapshot, context) => {
//     const { created_by: createdBy } = snapshot.data();
//     await updatedCreatedByName(createdBy, context.params.projectId, snapshot);
// });

// exports.updateProjectCreatedByName = functions.firestore.document("registry/{projectId}").onUpdate(async (change, context) => {
//     const { created_by: oldCreatedBy } = change.before.data();
//     const { created_by: newCreatedBy } = change.after.data();

//     if (oldCreatedBy === newCreatedBy) {
//         functions.logger.info("created_by didn't change, not updating created_by_name");
//     } else {
//         await updatedCreatedByName(newCreatedBy, context.params.projectId, change.after);
//     }
// });

exports.getPublicProject = functions.https.onCall(
    async ({ projectId }, _context) => {
        if (!projectId) {
            throw new functions.https.HttpsError(
                'invalid-argument',
                'Missing arguments',
            );
        }

        const publicProjectsCollection = admin
            .firestore()
            .collection('publicProjects');
        const publicProjectDoc = await publicProjectsCollection
            .doc(projectId)
            .get();

        if (!publicProjectDoc.exists) {
            throw new functions.https.HttpsError(
                'not-found',
                'Project not found',
            );
        }

        // get the areas in the publicAreas subcollection
        const publicAreasRef = publicProjectDoc.ref.collection('publicAreas');
        const publicAreas = await publicAreasRef.get();

        const publicProject = publicProjectDoc.data();

        // delete sensitive infocmation
        delete publicProject.created_by;
        delete publicProject.created_by_name;
        delete publicProject.group;
        delete publicProject.collaborators;
        delete publicProject.bestPracticesCount;
        delete publicProject.createTime;
        delete publicProject.publishedVersion;
        delete publicProject.termsAndConditionsAccepted;
        delete publicProject.updateTime;
        delete publicProject.pointsOfContact;

        publicProject.areas = publicAreas.docs.map((doc) => doc.data());

        return publicProject;
    },
);

const cors = require('cors')({ origin: true });

exports.getPublicProjectThumbnail = functions
    .region('europe-west3')
    .https.onRequest(async (req, res) => {
        cors(req, res, async () => {
            const projectId = req.query.projectId;

            if (!projectId) {
                return res.status(400).send('Missing projectId');
            }

            const version = await util.getLastProjectVersion(projectId);
            if (!version) {
                return res.status(404).send('Project not found');
            }

            const bucketName = 'fao-ferm-project-versions';

            // get the cover, the url is '${projectId}/${version}/project/images/cover_photo/cover.extension' but the extension can be any
            const prefix = `${projectId}/${version}/project/images/cover_photo/cover.`;
            const [files] = await admin
                .storage()
                .bucket(bucketName)
                .getFiles({ prefix });

            if (files.length === 0) {
                return res.status(404).send('Cover photo not found');
            }

            const coverPhoto = files[0];

            const thumbnail = await coverPhoto.download();

            res.setHeader('Content-Type', 'image/png');
            return res.status(200).send(thumbnail[0]);
        });
    });

/************************************************
 *
 * PROJECT PUBLISHING WORKFLOW
 *
 * **********************************************/

const projectPublishWorkflow = require('./projectPublishWorkflow');
exports.submitProject = projectPublishWorkflow.submitProject;
exports.publishAndVersionProject =
    projectPublishWorkflow.publishAndVersionProject;
exports.rejectProject = projectPublishWorkflow.rejectProject;
exports.resetPublicProjects = projectPublishWorkflow.resetPublicProjectsHttp;

/************************************************
 *
 * GROUP REQUESTS WORKFLOW
 *
 * **********************************************/

const groupRequestsWorkflow = require('./groupRequestsWorkflow');
exports.sendNewGroupRequestEmail =
    groupRequestsWorkflow.sendNewGroupRequestEmail;
exports.getMyNewGroupRequests = groupRequestsWorkflow.getMyNewGroupRequests;
exports.approveNewGroupRequest = groupRequestsWorkflow.approveNewGroupRequest;
exports.rejectNewGroupRequest = groupRequestsWorkflow.rejectNewGroupRequest;
exports.submitNewGroup = groupRequestsWorkflow.submitNewGroup;

/************************************************
 *
 * AREAS AND ZONAL STATISTICS
 *
 * **********************************************/

const areas = require('./areas');
exports.getPolygonZonalStats = areas.getPolygonZonalStats;
// exports.getAllAreaPolygons = areas.getAllAreaPolygons;
exports.deleteDanglingAreaRecords = areas.deleteDanglingAreaRecords;
// exports.deleteAllProjectAreas = areas.deleteAllProjectAreas;
exports.getIntersectingCountries = areas.getIntersectingCountries;
exports.getProjectAreas = areas.getProjectAreas;
exports.getAllProjectAreasGeoJson = areas.getAllProjectAreasGeoJson;
exports.getSavedProjectAreasGeoJson = areas.getSavedProjectAreasGeoJson;
exports.getSavedProjectAdminAreasGeoJson =
    areas.getSavedProjectAdminAreasGeoJson;

/************************************************
 *
 * GOOD PRACTICES
 *
 * **********************************************/
const goodPractices = require('./goodPractices');
exports.updateBpIdFieldOnWrite = goodPractices.updateBpIdFieldOnWrite;
exports.getProjectPublicBestPractices =
    goodPractices.getProjectPublicBestPractices;

/************************************************
 *
 * APPLICATION STATUS
 *
 * **********************************************/
const applicationStatus = require('./applicationStatus');
exports.checkEmailSend = applicationStatus.checkEmailSend;

/************************************************
 *
 * COLLABORATORS
 *
 * **********************************************/
const collaborators = require('./collaborators');
exports.saveProjectCollaborators = collaborators.saveProjectCollaborators;

/************************************************
 *
 * EMAILS
 *
 * **********************************************/
const emails = require('./emails');
exports.resendEmails = emails.resendEmails;

/************************************************
 *
 * PROJECT VERSIONS
 *
 * **********************************************/

const projectVersions = require('./projectVersions');
exports.createNewProjectVersion = projectVersions.createNewProjectVersion;
exports.reviseProject = projectPublishWorkflow.reviseProject;
exports.copyProjectToPublicProjects =
    projectPublishWorkflow.copyProjectToPublicProjects;
exports.updatePublicProject = projectPublishWorkflow.updatePublicProject;

/************************************************
 *
 * STORAGE
 *
 * **********************************************/

const storage = require('./storage');
exports.makeCoverPhoto = storage.makeCoverPhoto;

/************************************************
 *
 * QUALITY CONTROL
 *
 * **********************************************/
const qc = require('./qc');
exports.qcGef = qc.qcGef;

/************************************************
 *
 * REPORTING
 *
 * **********************************************/
// const reporting = require("./reporting");
// exports.generateInitiativeReport = reporting.generateInitiativeReport;

/************************************************
 *
 * EXPORT PUBLIC POLYGONS
 *
 * **********************************************/
const exportPublicPolygons = require('./exportPublicPolygons');
exports.exportPublicPolygons = exportPublicPolygons.exportPublicPolygons;
