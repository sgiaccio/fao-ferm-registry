const functions = require("firebase-functions");
const { FieldValue } = require("firebase-admin/firestore");

const { newCollaborator: newCollaboratorTemplate, newCollaborator } = require("./emailTemplates");

const util = require("./util");


function validateInputs(projectId, collaboratorsUids) {
    if (!projectId) {
        throw new functions.https.HttpsError('invalid-argument', 'Project id is empty');
    }
    if (!collaboratorsUids.every(uid => uid)) {
        throw new functions.https.HttpsError('invalid-argument', 'Invalid collaboratorsUids');
    }
}


async function getNewCollaborators(project, collaboratorsUids) {
    // get the new collaborators uids
    const oldCollaboratorsUids = project.collaborators || [];
    const newCollaboratorsUids = collaboratorsUids.filter(uid => !oldCollaboratorsUids.includes(uid));

    // check that the new collaborators are editors of the project
    return await Promise.all(newCollaboratorsUids.map(uid => util.getUser(uid)));
}

function checkNewCollaborators(newCollaborators, project) {
    // This function checks that the new collaborators are editors of the project
    const areEditors = newCollaborators.map(user => {
        const privileges = user.customClaims?.privileges || {};
        return privileges[project.group] === "editor";

    });

    // throw an exception if any of the new collaborators is not an editor
    if (!areEditors.every(isEditor => isEditor)) {
        console.error("Some of the new collaborators are not editors");
        throw new functions.https.HttpsError("permission-denied", "Some of the new collaborators are not editors");
    }
}

async function saveNewCollaborators(projectRef, collaboratorsUids) {
    try {
        await projectRef.update({
            collaborators: collaboratorsUids
        });
    } catch (error) {
        console.error("Failed to save collaborators", error);
        throw new functions.https.HttpsError("internal", "Failed to save collaborators", error);
    }
}

async function notifyNewCollaborators(newCollaborators, project) {
    const projectId = project.id;
    console.log("projectId", projectId);
    if (newCollaborators.length > 0) {
        const mailPromises = newCollaborators.map(collaborator => {
            // email, displayName, projectName, projectId
            const mailDoc = newCollaboratorTemplate(collaborator.email, collaborator.displayName, project.project.title, projectId);
            return util.mailCollection.add(mailDoc);
        });
        try {
            await Promise.all(mailPromises);
        } catch (e) {
            console.error("Failed to send emails to new collaborators", e);
            throw new functions.https.HttpsError("internal", "Failed to send emails to new collaborators", e);
        }
    }
}

exports.saveProjectCollaborators = functions.https.onCall(async ({ projectId, collaboratorsUids = [] }, context) => {
    console.log("saveProjectCollaborators", projectId, collaboratorsUids);

    validateInputs(projectId, collaboratorsUids);

    const projectRef = util.db.collection("registry").doc(projectId);

    const project = await checkSaveCollaboratorPrivileges(context, projectRef);

    const newCollaborators = await getNewCollaborators(project, collaboratorsUids);
    checkNewCollaborators(newCollaborators, project);
    const newCollaboratosUuids = newCollaborators.map(collaborator => collaborator.uid);

    await saveNewCollaborators(projectRef, newCollaboratosUuids);

    // Email the new collaborators
    await notifyNewCollaborators(newCollaborators, project);

    return { message: "Collaborators saved" };
});

async function checkSaveCollaboratorPrivileges(context, projectRef) {
    if (!context.auth) {
        console.error("User is not authenticated");
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check that the project exists
    let project;
    try {
        project = await projectRef.get();
    } catch (error) {
        console.error("Failed to get project", error);
        throw new functions.https.HttpsError("internal", "Failed to get project", error);
    }

    // check if the current user is superadmin or admin of the group or editor of the initiative
    const projectData = project.data();
    const isSuperAdmin = util.isSuperAdmin(context);
    const isGroupAdmin = util.isGroupAdmin(context, projectData);
    const isAuthorAndEditor = util.isGroupEditor(context, projectData) && projectData.created_by === context.auth.uid;

    if (!isSuperAdmin && !isGroupAdmin && !isAuthorAndEditor) {
        console.error("User is not a superadmin, nor a group admin, nor a group editor and owner of the project");
        throw new functions.https.HttpsError("permission-denied", "User is not a superadmin, nor a group admin, nor a group editor and owner of the project");
    }

    return projectData;
}
