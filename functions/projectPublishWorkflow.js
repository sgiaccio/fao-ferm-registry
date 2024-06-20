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
    getNextVersionNumber
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
exports.publishAndVersionProject = functions.https.onCall(async ({ projectId }, context) => {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check arguments
    if (!projectId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing arguments");
    }

    const { projectData, version } = await db.runTransaction(async (transaction) => {
        // get the project document from Firestore
        const projectSnapshot = await util.registryCollection.doc(projectId).get();
        // check that the project exists
        if (!projectSnapshot.exists) {
            throw new functions.https.HttpsError("not-found", "Project not found");
        }
        // get the project document data
        const projectData = projectSnapshot.data();

        // check that the project status is 'submitted' - only submitted projects can be published
        if (projectData.status && projectData.status !== "submitted") {
            throw new functions.https.HttpsError("invalid-argument", "Project status must be \"submitted\"");
        }

        const isAdmin = util.isGroupAdmin(context, projectData);
        const isAuthorAndEditor = util.isGroupEditor(context, projectData) && projectData.created_by === context.auth.uid;
        const authorized = util.isSuperAdmin(context) || isAdmin || isAuthorAndEditor;
        if (!authorized) {
            throw new functions.https.HttpsError("permission-denied", "User is not a super admin, nor a group admin, nor a group editor and owner of the project");
        }

        let newVersionNumber;

        try {
            newVersionNumber = await getNextVersionNumber(projectId, transaction);

            const bestPracticesSnapshot = await util.registryCollection.doc(projectId).collection("bestPractices").get();
            const bestPracticeIds = bestPracticesSnapshot.docs.map(doc => doc.id);

            // copy the related files - do this first as there might be triggered actions on the db that we couldn't roll back
            await createBucketVersion(newVersionNumber, projectId, bestPracticeIds);

            // set the project status to public and update the publishedTime
            console.log("Updating project status to public");
            transaction.update(util.registryCollection.doc(projectId), {
                status: "public",
                publishedTime: FieldValue.serverTimestamp(),
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

            return { projectData, version: newVersionNumber };
        } catch (error) {
            // delete the files that were copied if any error occurs
            console.error("Error publishing project", error);
            if (newVersionNumber) {
                console.log("Deleting all files for version", newVersionNumber);
                await deleteFiles(projectId, newVersionNumber);
            }
            throw error;
        }

        // return newVersionNumber;
    });

    try {
        // send an email to the project author
        console.log("Sending email to the project author");
        const ownerId = projectData.created_by;

        // get displayName from the user in the authentication service
        const ownerEmail = await util.getUserEmail(ownerId);
        if (ownerEmail) {
            const ownerName = await util.getUserDisplayName(ownerId) || ownerEmail;
            const groupName = await util.getGroupName(projectData.group);
            const mailDoc = emailTemplates.initiativePublished([ownerEmail], groupName,
                projectId, projectData.project.title, ownerName, new Date());
            await util.mailCollection.add(mailDoc);
            console.log("Email sent to the project author");
        } else {
            console.log("User email not found");
        }
    } catch (error) {
        console.log("Error sending email to the project author", error);
    }

    return { message: "Success! Project published.", version };
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
    await _unpublish(projectId, context);
});

// exports.unpublishProject = functions.https.onCall(async ({ projectId }, context) => {
//     await _unpublish(projectId, context);
// });

const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { onRequest } = require("firebase-functions/v2/https");
const {onSchedule} = require("firebase-functions/v2/scheduler");

/**
 * Copies the project and related areas to the publicProjects collection.
 * @param {string} projectId - The project ID.
 * @param {Object} newData - The data of the project.
 * @param {string} versionId - The version ID.
 * @param {Object} transaction - The Firestore transaction object.
 */
async function _copyProjectAndAreasToPublicProjects(projectId, newData, versionId, transaction = null) {
    const performCopy = async (_transaction) => {
        console.log(`Copying project ${projectId} to publicProjects collection`);

        const areasSnapshot = await db.collection("projectVersions").doc(projectId).collection("versions").doc(versionId).collection("areas").get();

        _transaction.set(db.collection("publicProjects").doc(projectId), newData);

        // delete the previous areas in the publicAreas subcollection
        const oldAreasSnapshot = await db.collection("publicProjects").doc(projectId).collection("publicAreas").get();
        oldAreasSnapshot.forEach(areaDoc => {
            _transaction.delete(areaDoc.ref);
        });

        console.log("Copying the related areas to the publicProjects collection");
        console.log(`Found ${areasSnapshot.size} areas`);
        areasSnapshot.forEach(areaDoc => {
            _transaction.set(db.collection("publicProjects").doc(projectId).collection("publicAreas").doc(areaDoc.id), areaDoc.data());
        });
    };

    if (transaction) {
        await performCopy(transaction);
    } else {
        await db.runTransaction(performCopy);
    }
}

/**
 * Processes items in batches.
 * @param {Array} items - The items to process.
 * @param {number} batchSize - The number of items to process in each batch.
 * @param {Function} processItem - The function to process each item.
 */
async function processInBatch(items, batchSize, processItem) {
    let index = 0;

    while (index < items.length) {
        const batch = items.slice(index, index + batchSize);
        await Promise.all(batch.map(processItem));
        index += batchSize;
    }
}

/**
 * This function is triggered when a new project version is created. It copies the project and related areas to the publicProjects collection.
 * @param {functions.EventContext} event The event context
 */
exports.copyProjectToPublicProjects = onDocumentCreated({ region: 'europe-west3', document: "projectVersions/{projectId}/versions/{versionId}" }, async event => {
    const { projectId, versionId } = event.params;
    console.log(`New project version created: ${projectId}, ${versionId} - copying project to publicProjects collection`);

    const snapshot = event.data;
    if (!snapshot) {
        console.log("No data associated with the event");
        return;
    }
    const data = snapshot.data();

    try {
        await _copyProjectAndAreasToPublicProjects(projectId, data, versionId);
    } catch (error) {
        console.error("Error copying project to publicProjects", error);
    }
});

exports.updatePublicProject = onDocumentUpdated({ region: 'europe-west3', document: "projectVersions/{projectId}" }, async (event) => {
    const previousData = event.data.before.data();
    const newData = event.data.after.data();

    const oldVersionNumber = previousData.versionNumber;
    const newVersionNumber = newData.versionNumber;

    console.log(`Project updated: ${event.params.projectId}, ${oldVersionNumber} -> ${newVersionNumber}`);

    if (newVersionNumber && oldVersionNumber !== newVersionNumber) {
        console.log(`Project version updated: ${event.params.projectId}, ${oldVersionNumber} -> ${newVersionNumber} - copying new project version to publicProjects collection`);
        try {
            await _copyProjectAndAreasToPublicProjects(event.params.projectId, newData, newVersionNumber);
        } catch (error) {
            console.error("Error copying project to publicProjects", error);
        }
    } else if (!newVersionNumber) {
        console.log(`The project was unpublished: ${event.params.projectId} - deleting project from publicProjects collection`);
        try {
            await db.recursiveDelete(db.collection("publicProjects").doc(event.params.projectId));
        } catch (error) {
            console.error("Error removing project from publicProjects", error);
        }
    }
    // the other case (newVersion === oldVersion) will never happen, or if it does, it will not be handled
});

/**
 * Copies all latest project versions to the publicProjects collection.
 * @param {Array} projects - Array of project IDs to copy.
 * @returns {Promise<void>}
 */
async function copyProjectsToPublicProjects(projects) {
    await processInBatch(projects, 10, async (projectId) => {
        // Get all versions of the project and find the latest one
        const versionsSnapshot = await db.collection("projectVersions").doc(projectId).collection("versions").orderBy(util.gcFirestore.FieldPath.documentId(), "desc").limit(1).get();
        if (versionsSnapshot.empty) {
            console.log(`No versions found for project ${projectId}`);
            return;
        }

        const latestVersionDoc = versionsSnapshot.docs[0];
        const versionId = latestVersionDoc.id;
        const data = latestVersionDoc.data();

        await db.runTransaction(async transaction => {
            await _copyProjectAndAreasToPublicProjects(projectId, data, versionId, transaction);
        });
    });
}

/**
 * Resets the publicProjects collection by deleting all documents and copying the latest versions.
 * @returns {Promise<void>}
 */
async function resetPublicProjects() {
    // Initialize BulkWriter
    const bulkWriter = db.bulkWriter();
    bulkWriter.onWriteError((error) => {
        console.log(`Error deleting document: ${error.documentRef.path}, Attempts: ${error.failedAttempts}`);
        return error.failedAttempts < 5;
    });

    // Recursively delete the publicProjects collection
    await db.recursiveDelete(db.collection('publicProjects'), bulkWriter);

    // Get all project IDs
    const projectsSnapshot = await db.collection('projectVersions').get();
    const projectIds = projectsSnapshot.docs.map(doc => doc.id);

    // Copy all latest versions to publicProjects
    await copyProjectsToPublicProjects(projectIds);
}

/**
 * HTTP function to reset the publicProjects collection.
 */
exports.resetPublicProjectsHttp = onRequest(async (req, res) => {
    try {
        await resetPublicProjects();
        res.status(200).send('publicProjects collection reset successfully.');
    } catch (error) {
        console.error("Error resetting publicProjects collection", error);
        res.status(500).send('Error resetting publicProjects collection.');
    }
});

/**
 * Scheduled function to reset the publicProjects collection.
 */
exports.scheduledResetPublicProjects = onSchedule('every 24 hours', async () => {
    try {
        await resetPublicProjects();
        console.log('publicProjects collection reset successfully.');
    } catch (error) {
        console.error("Error resetting publicProjects collection", error);
    }
});
