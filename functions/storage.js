const functions = require("firebase-functions");
const { getStorage } = require('firebase-admin/storage');
const util = require("./util");


exports.makeCoverPhoto = functions.https.onCall(async ({ projectId, filePath }, context) => {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check arguments
    if (!projectId || !filePath) {
        throw new functions.https.HttpsError("invalid-argument", "Missing arguments");
    }

    // get the project document from Firestore
    const projectRef = await util.registryCollection.doc(projectId).get();
    // check that the project exists
    if (!projectRef.exists) {
        throw new functions.https.HttpsError("not-found", "Project not found");
    }

    const project = projectRef.data();

    // check that the project status is 'draft'
    if (project.status && project.status !== "draft") {
        throw new functions.https.HttpsError("invalid-argument", "Project status must be \"draft\"");
    }

    const isAdmin = util.isGroupAdmin(context, project);
    const isAuthorAndEditor = util.isGroupEditor(context, project) && project.created_by === context.auth.uid;
    const isCollaborator = project.collaborators?.includes(context.auth.uid);
    const authorized = util.isSuperAdmin(context) || isAdmin || isAuthorAndEditor || isCollaborator;
    if (!authorized) {
        throw new functions.https.HttpsError("permission-denied", "User is not a super admin, nor a group admin, nor a group editor and owner of the project, nor a collaborator of the project");
    }

    // copy the photo from the path in a subfolder called thumbnail - rename the file to 'thumbnail' with the same extension
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);

    const metadata = await file.getMetadata();
    const contentType = metadata[0].contentType;

    const destination = bucket.file(`${projectId}/images/cover_photo/cover.${file.name.split('.').pop()}`);
    await file.copy(destination, {
        contentType,
        metadata: {
            originalName: file.name
        }
    });

    // await destination.makePublic();
    return {
        original: file.name,
        thumbnail: destination.name
    };
});
