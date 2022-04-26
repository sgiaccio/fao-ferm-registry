const functions = require("firebase-functions");
const admin = require("firebase-admin");
const auth = require("firebase-auth")
// import { getAuth, onAuthStateChanged } from "firebase/auth";


admin.initializeApp();

const GROUP_ROLES = ['admin', 'editor', 'guest'];


async function findAsync(array, predicate) {
    for (const t of array) {
        if (await predicate(t)) {
            return t
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

function getGroupRole(privileges, groupName) {
    const group = privileges.find((p => p.group === groupName));
    return group.role;
}

// exports.createUser = functions.https.onCall(async ({name, email, displayName}, context) => {
//     console.log(auth());
//     auth.getAuth().createUser({
//         name: 'ciccioformaggio@mac.com',
//         emailVerified: false,
//         password: 'secretPassword',
//         displayName: 'Ciccio Formaggio',
//         disabled: false
//     }).then((userRecord) => {
//         // See the UserRecord reference doc for the contents of userRecord.
//         console.log('Successfully created new user:', userRecord.uid);
//     }).catch((error) => {
//         console.log('Error creating new user:', error);
//     });
// });

exports.newUserSignup = functions.auth.user().onCreate(async user => {
    admin.auth().setCustomUserClaims(user.uid, { privileges: {}, admin: false })
})

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

exports.addAdminRole = functions.https.onCall(async (data, context) => {
    // check privileges
    if (!isAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can add other admins');
    }

    // get user and add custom claim (admin)
    try {
        const user = await admin.auth().getUserByEmail(data.email);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        return { message: `Success! ${data.email} has been made an admin` };
    } catch (err) {
        throw new functions.https.HttpsError('internal', err);
    }
});

exports.setUserPrivileges = functions.https.onCall(async ({email, privileges, admin: _admin}, context) => {
    // if (!GROUP_ROLES.includes(role)) {
    //     throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${role}`);
    // }

    if (typeof _admin === 'undefined') {
        throw new functions.https.HttpsError('invalid-argument', 'admin is undefined');
    }

    if (!isAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can add assign users to groups (for now)');
    }

    // Check if the group exists in the db
    // const validGroup = await isValidGroup(group);
    // if (!validGroup) {
    //     throw new functions.https.HttpsError('invalid-argument', `Group ${group} doesn't exist`);
    // }

    const roles = Object.values(privileges);
    const invalidRole = roles.find(r => !GROUP_ROLES.includes(r));
    if (invalidRole) {
        throw new functions.https.HttpsError('invalid-argument', `Role ${invalidRole} doesn't exist`);
    }

    const groups = Object.keys(privileges);
    const invalidGroup = await findAsync(groups, async g => !(await isValidGroup(g))); 
    if (invalidGroup) {
        throw new functions.https.HttpsError('invalid-argument', `Group ${invalidGroup} doesn't exist`);
    }

    const user = await admin.auth().getUserByEmail(email);
    await admin.auth().setCustomUserClaims(user.uid, { privileges, admin: !!_admin });
 
    return { message: 'Success! Privileges assigned' }
    // try {
    //     const user = await admin.auth().getUserByEmail(email);

    //     let privileges = user.customClaims ? user.customClaims['privileges'] || [] : [];

    //     const previousGroupRoleIdx = privileges.findIndex(p => p.group === group);
    //     if (previousGroupRoleIdx !== -1) {
    //         privileges.splice(previousGroupRoleIdx, 1);
    //     }
    //     const newPrivileges = [...privileges, { group, role }]
    //     await admin.auth().setCustomUserClaims(user.uid, { privileges: newPrivileges });
        
    //     return { message: `Success! ${email} has been made assigned ${role} privileges to group ${group}` };
    // } catch (err) {
    //     throw new functions.https.HttpsError('internal', err);
    // }

});

// exports.setGroupRole = functions.https.onCall(async ({email, group, role}, context) => {
//     // TODO check privileges
//     if (!GROUP_ROLES.includes(role)) {
//         throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${role}`);
//     }
//     // // check if I am the a global admin or admin of the group
//     if (!(isAdmin(context) || getGroupRole(context.auth.token.privileges, 'group') === 'admin')) {
//         throw new functions.https.HttpsError('permission-denied', 'Only admins can add other admins');
//     }
//     const validGroup = await isValidGroup(group);
//     if (!validGroup) {
//         throw new functions.https.HttpsError('invalid-argument', `Group ${group} doesn't exist`);
//     }

//     try {
//         const user = await admin.auth().getUserByEmail(email);

//         let privileges = user.customClaims ? user.customClaims['privileges'] || [] : [];

//         const previousGroupRoleIdx = privileges.findIndex(p => p.group === group);
//         if (previousGroupRoleIdx !== -1) {
//             privileges.splice(previousGroupRoleIdx, 1);
//         }
//         const newPrivileges = [...privileges, { group, role }]
//         await admin.auth().setCustomUserClaims(user.uid, { privileges: newPrivileges });
        
//         return { message: `Success! ${email} has been made assigned ${role} privileges to group ${group}` };
//     } catch (err) {
//         throw new functions.https.HttpsError('internal', err);
//     }
// });




// const listAllUsers = (nextPageToken) => {
//     // List batch of users, 1000 at a time.
//     auth().listUsers(1000, nextPageToken).then((listUsersResult) => {
//         listUsersResult.users.forEach((userRecord) => {
//             console.log('user', userRecord.toJSON());
//         });
//         if (listUsersResult.pageToken) {
//             // List next batch of users.
//             listAllUsers(listUsersResult.pageToken);
//         }
//     }).catch((error) => {
//         console.log('Error listing users:', error);
//     });
// };

