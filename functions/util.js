const admin = require("firebase-admin");
const firestore = require("@google-cloud/firestore");
// const functions = require("firebase-functions");

// Initialize admin SDK
admin.initializeApp();

const db = admin.firestore();
const usersCollection = db.collection("users");
const groupsCollection = db.collection("groups");
const registryCollection = db.collection("registry");
const publicProjectsCollection = db.collection("publicProjects");
// const bestPracticesCollection = db.collection("bestPractices");
const assignmentRequestsCollection = db.collection("assignementRequests"); // Typo in the name
const newGroupRequestsCollection = db.collection("newGroupRequests");
const mailCollection = db.collection("mail");
const areasCollection = db.collection("areas");
const applicationStateCollection = db.collection("applicationState");

db.settings({ ignoreUndefinedProperties: true });

// These are the roles that can be assigned to users in a group.
// Possibly add 'restricted'? Restricted users could only edit and view their own data
const GROUP_ROLES = ["admin", "editor", "guest"];
// These are the statuses that a project and a best practice can have
const STATUSES = ["draft", "submitted", "published"];


// Private functions

async function _getSuperAdmins() {
    // TODO store custom claims in a collection in firestore for performance
    const users = await admin.auth().listUsers();
    return users.users.filter(u => u.customClaims && u.customClaims.admin).map(u => ({ uid: u.uid, email: u.email }));
}

function _getGroupsWhereRole(context, role) {
    const privileges = context.auth.token && context.auth.token.privileges || {};
    return Object.keys(privileges).filter(group => privileges[group] === role);
}

function getGroupsWhereEditor(context) {
    return _getGroupsWhereRole(context, "editor");
}

// Find the administrators of a group
async function _getGroupAdmins(groupId) {
    // get all users
    const users = await admin.auth().listUsers();
    // filter the users that have the admin role for the group
    return users.users.filter(u => u.customClaims && u.customClaims.privileges && u.customClaims.privileges[groupId] === "admin");
}

// Public functions

// Finds the first element in the array for which the async predicate returns true
// Highly inefficient, for now it's ok
async function findAsync(array, predicate) {
    for (const t of array) {
        if (await predicate(t)) {
            return t;
        }
    }
}

async function getUser(uid) {
    return await admin.auth().getUser(uid);
}

async function getUserEmail(uid) {
    try {
        const user = await getUser(uid);
        return user.email;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

async function getUserDisplayName(uid) {
    try {
        const user = await getUser(uid);
        return user.displayName;
    } catch (error) {
        console.error("Error fetching user:", error);
        return null;
    }
}

async function getGroupName(groupId) {
    try {
        const groupDoc = await groupsCollection.doc(groupId).get();
        return groupDoc.data().name;
    } catch (error) {
        console.error("Error fetching group:", error);
        return null;
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
    const groupsSnapshot = await groupsCollection.where(firestore.FieldPath.documentId(), "in", groupIds).get();
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
    return context.auth && context.auth.token && context.auth.token.admin;
}

function getGroupsWhereAdmin(context) {
    return _getGroupsWhereRole(context, "admin");
}

function isGroupAdmin(context, project) {
    const groupsWhereAdmin = getGroupsWhereAdmin(context);
    return groupsWhereAdmin.includes(project.group);
}


// Checks if the user has a role in a group
// function hasGroupRoles(context, groupId, [roles]) {
//     // check if the roles are valid
//     if (roles.find(r => !GROUP_ROLES.includes(r))) {
//         throw new Error(`Invalid role: ${r}`);
//     }
//
//     return !!context.auth.token.privileges[groupId] && roles.includes(context.auth.token.privileges[groupId]);
// }

async function getSuperAdminEmails() {
    const superAdmins = await _getSuperAdmins();
    return superAdmins.map(a => a.email);
}

async function getGroupAdminEmails(groupId) {
    const groupAdmins = await _getGroupAdmins(groupId);
    return groupAdmins.map(a => a.email);
}

// function getGroupRole(privileges, groupName) {
//     const group = privileges.find((p => p.group === groupName));
//     return group.role;
// }

function isGroupEditor(context, project) {
    const groupsWhereEditor = getGroupsWhereEditor(context);
    return groupsWhereEditor.includes(project.group);
}

function isCollaborator(context, project) {
    const collaboratorIds = project.collaborators || [];
    return collaboratorIds.includes(context.auth.uid) && isGroupEditor(context, project);
}

async function isProjectPublic(projectId) {
    const projectSnapshot = await registryCollection.doc(projectId).get();
    if (!projectSnapshot.exists) {
        throw new Error("Project does not exist");
    }
    const project = projectSnapshot.data();

    return !!project.status && project.status === "public";
}

// exports.createUser = async function (email, displayName, privileges, isAdmin, context) {
//     // check if the user is an admin
//     if (!isSuperAdmin(context)) {
//         throw new functions.https.HttpsError("permission-denied", "Only admins can create new users");
//     }

//     // Validate the input
//     if (typeof isAdmin === "undefined") {
//         throw new functions.https.HttpsError("invalid-argument", "admin is undefined");
//     }

//     if (!email) {
//         throw new functions.https.HttpsError("invalid-argument", "The function must be called with one argument \"email\" containing the email for the user.");
//     }

//     const invalidGroup = await checkValidGroups(privileges);
//     if (invalidGroup) {
//         throw new functions.https.HttpsError("invalid-argument", `Invalid group id ${invalidGroup}`);
//     }

//     const invalidLevelGroup = await checkValidLevels(privileges);
//     if (invalidLevelGroup) {
//         throw new functions.https.HttpsError("invalid-argument", `Invalid privilege ${privileges[invalidLevelGroup]} level for group ${invalidLevelGroup}`);
//     }

//     try {
//         // Create the user
//         const user = {
//             email,
//         };
//         if (displayName) {
//             user.displayName = displayName;
//         }
//         const userRecord = await admin.auth().createUser(user);

//         // Set the custom claims on the newly created user. Just print the error to the console for now.
//         const uid = userRecord.uid;
//         try {
//             await admin.auth().setCustomUserClaims(uid, { privileges, admin: isAdmin });
//         } catch (err) {
//             console.error("Error setting custom claims:", JSON.stringify(err, null, 2));
//         }
//         return userRecord;
//     } catch (err) {
//         console.error("Error creating new user:", JSON.stringify(err, null, 2));
//         throw new Error("Error creating new user");
//     }
// };

async function getLastProjectVersion(projectId) {
    const publicProjectDoc = publicProjectsCollection.doc(projectId);
    const doc = await publicProjectDoc.get();
    if (!doc.exists) {
        return null;
    }
    return doc.data().publishedVersion;
}

exports = module.exports = {
    db,
    usersCollection,
    groupsCollection,
    registryCollection,
    // bestPracticesCollection,
    assignmentRequestsCollection,
    newGroupRequestsCollection,
    mailCollection,
    areasCollection,
    applicationStateCollection,
    firestore: admin.firestore,
    gcFirestore: firestore,
    
    findAsync,

    GROUP_ROLES,
    STATUSES,

    getUser,
    getUserEmail,
    getUserDisplayName,
    getGroupName,
    isSuperAdmin,
    getGroupsWhereAdmin,
    getGroupsWhereEditor,
    isGroupAdmin,
    isCollaborator,
    getGroupAdminEmails,
    getSuperAdminEmails,
    isGroupEditor,
    isValidGroup,
    checkValidGroups,
    checkValidLevels,

    isProjectPublic,
    getLastProjectVersion
};
