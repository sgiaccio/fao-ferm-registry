const functions = require("firebase-functions");
const { FieldValue } = require("firebase-admin/firestore");

const util = require("./util");


exports.addProjectCollaborator = functions.https.onCall(async ({ projectId, uid }, context) => {
    const projectRef = util.registryCollection.doc(projectId);
    await checkPrivileges(context, uid, projectRef);

    // If the user doesn't exist, create it, assign it to the group and send an email
    const user = await util.getUser(uid);
    if (!user.exists) {
        // Create a new user
        // Assign the user to the group
        // Send an email to the user
    }

    try {
        // add the user to the collaborators array
        await projectRef.update({
            collaborators: FieldValue.arrayUnion(uid)
        });
    } catch (error) {
        console.log(error);
        throw new functions.https.HttpsError("internal", "Failed to add collaborator", error);
    }

    return { message: "Success! Collaborator added" };
});

exports.deleteProjectCollaborator = functions.https.onCall(async ({ projectId, uid }, context) => {
    const projectRef = util.db.collection("projects").doc(projectId);
    await checkPrivileges(context, uid, projectRef);

    try {
        // remove the user from the collaborators array
        await projectRef.update({
            collaborators: FieldValue.arrayRemove(uid)
        });
    } catch (error) {
        throw new functions.https.HttpsError("internal", "Failed to remove collaborator", error);
    }

    return { message: "Success! Collaborator removed" };
});

async function checkPrivileges(context, uid, projectRef) {
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check the parameters
    if (!uid) {
        throw new functions.https.HttpsError("invalid-argument", "uid is undefined");
    }

    // check that the project exists
    let project;
    try {
        project = await projectRef.get();
    } catch (error) {
        throw new functions.https.HttpsError("internal", "Failed to get project", error);
    }

    // check if the current user is superadmin or admin of the group or editor of the initiative
    const isSuperAdmin = util.isSuperAdmin(context);
    const isGroupAdmin = util.isGroupAdmin(context, project);
    const isAuthorAndEditor = util.isGroupEditor(context, project) && project.created_by === context.auth.uid;

    if (!isSuperAdmin && !isGroupAdmin && !isAuthorAndEditor) {
        throw new functions.https.HttpsError("permission-denied", "User is not a superadmin, nor a group admin, nor a group editor and owner of the project");
    }

    return project;
}
