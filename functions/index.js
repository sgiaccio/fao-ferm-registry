const functions = require("firebase-functions");

const admin = require("firebase-admin");

// const auth = require("firebase-auth")
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


exports.signUp = functions.https.onCall(async ({email, password, fullName, institution, purpose}, context) => {
    try {
        const userRecord = await admin.auth().createUser({
            email: email,
            emailVerified: false,
            password: password,
            displayName: fullName,
            disabled: false
        })
        
        // See the UserRecord reference doc for the contents of userRecord.
        const userId = userRecord.uid
        console.log('Successfully created new user:', userId);

        // Set privileges
        const groupsRef = admin.firestore().collection("groups");
        const q = groupsRef.where("sandbox", "==", true).limit(1);
        const querySnapshot = await q.get();
        let privileges = {}
        if (querySnapshot.size > 0) {
            const sandboxGroupId = querySnapshot.docs[0].id;
            privileges[sandboxGroupId] = "editor";
        }
        await admin.auth().setCustomUserClaims(userId, { privileges, admin: false });
    
        // Try to store institution and purpose, doesn't matter much if it doesn't manage
        // Can do this client side to report an error to the user if needed
        try {
            const docRef = admin.firestore().collection('user-registration').doc(userId);

            await docRef.set({
                institution: institution || "",
                purpose: purpose || ""
            });
        }
        catch (err) {
            console.log(`Could't store organization and purpose for user ${userId}`, err)
        }

        // await admin.auth().setCustomUserClaims(userRecord.uid, { privileges: {}, admin: false });
        return { message: 'Success! User created' }
    } catch(err) {
      console.log('Error creating new user:', err);
      throw new functions.https.HttpsError('invalid-argument', err);
    }
});

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


// db.collection("cities").where("capital", "==", true)
//     .get()
//     .then((querySnapshot) => {
//         querySnapshot.forEach((doc) => {
//             // doc.data() is never undefined for query doc snapshots
//             console.log(doc.id, " => ", doc.data());
//         });
//     })
//     .catch((error) => {
//         console.log("Error getting documents: ", error);
//     });


exports.newUserSignup_temp = functions.auth.user().onCreate(async user => {
    // const groupsRef = admin.firestore().collection("groups");
    // const q = groupsRef.where("sandbox", "==", true).limit(1);

    // const querySnapshot = await q.get();
    let privileges = {}
    // if (querySnapshot.size > 0) {
        // console.log(querySnapshot.docs[0].id)
        const groupId = "UpKyI8JcTmwxeSyOQEQm"
        privileges[groupId] = "editor";
        // console.log(sandboxGroupId);
    // }
    admin.auth().setCustomUserClaims(user.uid, { privileges, admin: false });

    // admin.auth().generateEmailVerificationLink(user.email).then(link => {
    //     console.log(link);
    //     // Construct email verification template, embed the link and send
    //     // using custom SMTP server.
    //     return sendCustomVerificationEmail(user.email, user.displayName, link);
    // });
});


// THIS IS A TEST!
// const fetch = require('node-fetch');
// const apikey = "abcd"; // functions.config().project.apikey; // TODO
// const exchangeCustomTokenEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apikey}`;
// const sendEmailVerificationEndpoint = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apikey}`;
// exports.newUserSignup2 = functions.auth.user().onCreate(async (user) => {
//   if (!user.emailVerified) {
//     try {
//       const customToken = await admin.auth().createCustomToken(user.uid);

//       const { idToken } = await fetch(exchangeCustomTokenEndpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           token: customToken,
//           returnSecureToken: true,
//         }),
//       }).then((res) => res.json());

//       const response = await fetch(sendEmailVerificationEndpoint, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({
//           requestType: 'VERIFY_EMAIL',
//           idToken: idToken,
//         }),
//       }).then((res) => res.json());

//       // eslint-disable-next-line no-console
//       console.log(`Sent email verification to ${response.email}`);
//     } catch (error) {
//       // eslint-disable-next-line no-console
//       console.log(error);
//     }
//   }
// });


// exports.createNewUser = functions.https.onCall(async (data, context) => {
//     if (!isAdmin(context)) {
//         throw new functions.https.HttpsError('permission-denied', 'Only admins can create users');
//     }

//     admin.auth()
//     .createUser({
//       email: 'user@example.com',
//       emailVerified: false,
//       phoneNumber: '+11234567890',
//       password: 'secretPassword',
//       displayName: 'John Doe',
//       photoURL: 'http://www.example.com/12345678/photo.png',
//       disabled: false,
//     })
//     .then((userRecord) => {
//       // See the UserRecord reference doc for the contents of userRecord.
//       console.log('Successfully created new user:', userRecord.uid);
//       admin.auth().setCustomUserClaims(userRecord.uid, { privileges: {}, admin: false })      
//     })
//     .catch((error) => {
//       console.log('Error creating new user:', error);
//     });
// });



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

    if (!privileges) privileges = {}

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











const firestore = require('@google-cloud/firestore');
const client = new firestore.v1.FirestoreAdminClient();

const bucket = 'gs://fao-ferm-firebase-backup';

exports.scheduledFirestoreExport = functions.pubsub
                                            .schedule('every 24 hours')
                                            .onRun(context => {

  const projectId = process.env.GCP_PROJECT || process.env.GCLOUD_PROJECT;
  const databaseName = 
    client.databasePath(projectId, '(default)');

  return client.exportDocuments({
    name: databaseName,
    outputUriPrefix: bucket,
    // Leave collectionIds empty to export all collections
    // or set to a list of collection IDs to export,
    // collectionIds: ['users', 'posts']
    collectionIds: []
    })
  .then(responses => {
    const response = responses[0];
    console.log(`Operation Name: ${response['name']}`);
  })
  .catch(err => {
    console.error(err);
    throw new Error('Export operation failed');
  });
});
