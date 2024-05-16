const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { Timestamp, FieldValue } = require("firebase-admin/firestore");

const emailTemplates = require("./emailTemplates");

const db = admin.firestore();

const util = require("./util");
// const registryCollection = db.collection("registry");

const {
    createFirestoreVersion,
    createGeoDbVersion,
    createBucketVersion,
    deleteFiles,
    getNewVersionNumber
} = require("./projectVersions");


exports.submitProject = functions.https.onCall(async ({ projectId }, context) => {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check arguments
    if (!projectId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing arguments");
    }

    // get the project document from Firestore
    const projectRef = await util.registryCollection.doc(projectId).get();
    // check that the project exists
    if (!projectRef.exists) {
        throw new functions.https.HttpsError("not-found", "Project not found");
    }

    const project = projectRef.data();

    // check that the project status is 'draft' - only draft projects can be submitted
    if (project.status && project.status !== "draft") {
        throw new functions.https.HttpsError("invalid-argument", "Project status must be \"draft\"");
    }

    const isAdmin = util.isGroupAdmin(context, project);
    const isAuthorAndEditor = util.isGroupEditor(context, project) && project.created_by === context.auth.uid;
    const authorized = util.isSuperAdmin(context) || isAdmin || isAuthorAndEditor;
    if (!authorized) {
        throw new functions.https.HttpsError("permission-denied", "User is not a super admin, nor a group admin, nor a group editor and owner of the project");
    }

    // updateProjectStatus also checks if the user is authorized to update the project status
    // updateStatus(projectRef, 'submitted');
    console.log("Updating project status to submitted");
    try {
        util.registryCollection.doc(projectId).update({
            status: "submitted",
            submittedTime: Timestamp.fromDate(new Date())
        });
        console.log("Project status updated to submitted");

        // send email to group admins
        const groupAdminEmails = await util.getGroupAdminEmails(project.group);
        const groupDoc = await util.groupsCollection.doc(project.group).get();
        const groupName = groupDoc.data().name;

        let mailDoc;
        if (groupAdminEmails.length > 0) {
            console.log("Sending email to group admins");
            mailDoc = emailTemplates.initiativeSubmittedForReview(groupAdminEmails, groupName, projectId, project.project.title);
        } else {
            console.log("Sending email to super admins");
            const superAdminEmails = await util.getSuperAdminEmails();
            mailDoc = emailTemplates.initiativeSubmittedForReviewSuperAdmins(superAdminEmails, groupName, projectId, project.project.title);
        }
        await util.mailCollection.add(mailDoc);

        return { message: "Success! Project submitted." };
    } catch (error) {
        console.log("Error updating project status to submitted", error);
        throw new functions.https.HttpsError("internal", "Error updating project status to submitted");
    }
});

// When a project is published, a new version of the project is created in Firestore, in the storage bucket and in the geodatabase
// The project status is set to 'public' and the publishedTime is updated
exports.publishProjectTemp = functions.https.onCall(async ({ projectId }, context) => {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check arguments
    if (!projectId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing arguments");
    }

    return db.runTransaction(async (transaction) => {
        // get the project document from Firestore
        const projectSnapshot = await util.registryCollection.doc(projectId).get();
        // check that the project exists
        if (!projectSnapshot.exists) {
            throw new functions.https.HttpsError("not-found", "Project not found");
        }
        // get the project document data
        const projectData = projectSnapshot.data();

        ///////////////////////////////////////////////////////
        //
        // TODO - UNCOMMENT THE FOLLOWING CODE BLOCK
        //
        ///////////////////////////////////////////////////////
        // // check that the project status is 'submitted' - only submitted projects can be published
        // if (project.status && project.status !== "submitted") {
        //     throw new functions.https.HttpsError("invalid-argument", "Project status must be \"submitted\"");
        // }

        const isAdmin = util.isGroupAdmin(context, projectData);
        const isAuthorAndEditor = util.isGroupEditor(context, projectData) && projectData.created_by === context.auth.uid;
        const authorized = util.isSuperAdmin(context) || isAdmin || isAuthorAndEditor;
        if (!authorized) {
            throw new functions.https.HttpsError("permission-denied", "User is not a super admin, nor a group admin, nor a group editor and owner of the project");
        }

        let newVersionNumber;

        try {
            newVersionNumber = await getNewVersionNumber(projectId, transaction);

            const bestPracticesSnapshot = await util.registryCollection.doc(projectId).collection("bestPractices").get();
            const bestPracticeIds = bestPracticesSnapshot.docs.map(doc => doc.id);

            // copy the related files - do this first as there might be triggered actions on the db that we couldn't roll back
            await createBucketVersion(newVersionNumber, projectId, bestPracticeIds);

            // set the project status to public and update the publishedTime
            console.log("Updating project status to public");
            transaction.update(util.registryCollection.doc(projectId), {
                status: "public",
                publishedTime:  FieldValue.serverTimestamp(),
                // delete rejectedTime and rejectedReason if they exists
                rejectedReason: FieldValue.delete(),
                rejectedTime: FieldValue.delete(),
                publishedVersion: newVersionNumber
            });

            // create a new version of the project in Firestore
            console.log("Creating a new version of the project in Firestore");
            const { areaUuids } = await createFirestoreVersion(projectSnapshot, bestPracticesSnapshot, newVersionNumber, transaction);

            // copy the related db areas
            console.log("Copying the related db areas");
            await createGeoDbVersion(projectId, areaUuids, newVersionNumber);

            return { version: newVersionNumber };
        } catch (error) {
            // delete the files that were copied if any error occurs
            console.error("Error publishing project", error);
            if (newVersionNumber) {
                console.log("Deleting all files for version", newVersionNumber);
                await deleteFiles(projectId, newVersionNumber);
            }
            throw error;
        }
    });

    // try {
    //     util.registryCollection.doc(projectId).update({
    //         status: "public",
    //         publishedTime: Timestamp.fromDate(publicationTime),
    //         // delete rejectedTime and rejectedReason if it exists
    //         rejectedReason: FieldValue.delete()
    //     });
    //     console.log("Project status updated to published");

    //     // send email to the project author
    //     console.log("Sending email to the project author");
    //     const ownerId = project.created_by;

    //     // get displayName from the user in the authentication service
    //     const ownerEmail = await util.getUserEmail(ownerId);
    //     if (ownerEmail) {
    //         const ownerName = await util.getUserDisplayName(ownerId) || ownerEmail;
    //         const groupName = await util.getGroupName(project.group);
    //         const mailDoc = emailTemplates.initiativePublished([ownerEmail], groupName, projectId, project.project.title, ownerName, publicationTime);
    //         await util.mailCollection.add(mailDoc);
    //     } else {
    //         console.log("User email not found");
    //     }

    //     return { message: "Success! Project published." };
    // } catch (error) {
    //     console.log("Error updating project status to published", error);
    //     throw new functions.https.HttpsError("internal", "Error updating project status to published");
    // }
});

async function _unpublish(projectId, context) {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check arguments
    if (!projectId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing arguments");
    }

    return db.runTransaction(async (transaction) => {
        // get the project document from Firestore
        const projectRef = await util.registryCollection.doc(projectId).get();
        // check that the project exists
        if (!projectRef.exists) {
            throw new functions.https.HttpsError("not-found", "Project not found");
        }
        // get the project document data
        const project = projectRef.data();

        // check that the project status is 'public' - only public projects can be versioned
        if (project.status && project.status !== "public") {
            throw new functions.https.HttpsError("invalid-argument", "Project status must be \"public\"");
        }

        const isAdmin = util.isGroupAdmin(context, project);
        const isAuthorAndEditor = util.isGroupEditor(context, project) && project.created_by === context.auth.uid;
        const authorized = util.isSuperAdmin(context) || isAdmin || isAuthorAndEditor;
        if (!authorized) {
            throw new functions.https.HttpsError("permission-denied", "User is not a super admin, nor a group admin, nor a group editor and owner of the project");
        }

        try {
            // set the project status to draft
            console.log("Updating project status to draft");
            transaction.update(util.registryCollection.doc(projectId), {
                status: "draft",
                // delete publishedTime
                publishedTime: FieldValue.delete()
            });
            console.log("Project status updated to draft");

        } catch (error) {
            console.log("Error updating project status to draft", error);
            throw new functions.https.HttpsError("internal", "Error updating project status to draft");
        }
    });
}

exports.reviseProject = functions.https.onCall(async ({ projectId }, context) => {
    return _unpublish(projectId, context);
});

exports.unpublishProject = functions.https.onCall(async ({ projectId }, context) => {
    return _unpublish(projectId, context);
});
