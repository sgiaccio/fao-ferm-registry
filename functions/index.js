const functions = require("firebase-functions");
const admin = require("firebase-admin");


admin.initializeApp();

const groupRoles = ['admin', 'editor', 'guest'];

function isAdmin(context) {
    return context.auth.token.admin === true;
}

function getGroupRole(privileges, groupName) {
    const group = privileges.find((p => p.group === groupName));
    return group.role;
}

exports.listAllUsers = functions.https.onCall(async (_data, _context) => {
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

exports.assignToGroup = functions.https.onCall(async ({email, group, role}, context) => {
    // TODO check privileges
    if (!groupRoles.includes(role)) {
        throw new functions.https.HttpsError('invalid-argument', `Invalid role: ${role}`);
    }
    // check if I am the a global admin or admin of the group
    if (!(isAdmin(context) || getGroupRole(context.auth.token.privileges, 'group') === 'admin')) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can add other admins');
    }

    try {
        const user = await admin.auth().getUserByEmail(email);

        const privileges = user.customClaims['privileges'];
        const previousGroupRoleIdx = privileges.findIndex(p => p.group === group);
        if (previousGroupRoleIdx !== -1) {
            privileges.splice(previousGroupRoleIdx, 1);
        }
        const newPrivileges = [...privileges, { group, role }]
        await admin.auth().setCustomUserClaims(user.uid, { privileges: newPrivileges });
        
        return { message: `Success! ${email} has been made assigned to group ${group} with ${role} privileges` };
    } catch (err) {
        throw new functions.https.HttpsError('internal', err);
    }
});




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

