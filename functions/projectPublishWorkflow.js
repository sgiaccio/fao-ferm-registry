const functions = require("firebase-functions");
const util = require("./util");
const admin = require("firebase-admin");

const { Timestamp, FieldValue } = require("firebase-admin/firestore");

const emailTemplates = require("./emailTemplates");

const db = admin.firestore();
const registryCollection = db.collection("registry");


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
    const projectRef = await registryCollection.doc(projectId).get();
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
        registryCollection.doc(projectId).update({
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

exports.publishProject = functions.https.onCall(async ({ projectId }, context) => {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check arguments
    if (!projectId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing arguments");
    }

    // get the project document from Firestore
    const projectRef = await registryCollection.doc(projectId).get();
    // check that the project exists
    if (!projectRef.exists) {
        throw new functions.https.HttpsError("not-found", "Project not found");
    }

    const project = projectRef.data();

    // check that the project status is 'submitted' - only submitted projects can be published
    if (project.status && project.status !== "submitted") {
        throw new functions.https.HttpsError("invalid-argument", "Project status must be \"submitted\"");
    }

    const isGroupAdmin = util.isGroupAdmin(context, project);
    const authorized = util.isSuperAdmin(context) || isGroupAdmin;
    if (!authorized) {
        throw new functions.https.HttpsError("permission-denied", "User is not a super admin nor a group admin");
    }

    console.log("Updating project status to public");
    const publicationTime = new Date();
    try {
        registryCollection.doc(projectId).update({
            status: "public",
            publishedTime: Timestamp.fromDate(publicationTime),
            // delete rejectedTime and rejectedReason if it exists
            rejectedReason: FieldValue.delete()
        });
        console.log("Project status updated to published");

        // send email to the project author
        console.log("Sending email to the project author");
        const ownerId = project.created_by;

        // get displayName from the user in the authentication service
        const ownerEmail = await util.getUserEmail(ownerId);
        if (ownerEmail) {
            const ownerName = await util.getUserDisplayName(ownerId) || ownerEmail;
            const groupName = await util.getGroupName(project.group);
            const mailDoc = emailTemplates.initiativePublished([ownerEmail], groupName, projectId, project.project.title, ownerName, publicationTime);
            await util.mailCollection.add(mailDoc);
        } else {
            console.log("User email not found");
        }

        return { message: "Success! Project published." };
    } catch (error) {
        console.log("Error updating project status to published", error);
        throw new functions.https.HttpsError("internal", "Error updating project status to published");
    }
});

exports.rejectProject = functions.https.onCall(async ({ projectId, reason }, context) => {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check arguments
    if (!projectId || !reason) {
        throw new functions.https.HttpsError("invalid-argument", "Missing arguments");
    }

    // get the project document from Firestore
    const projectRef = await registryCollection.doc(projectId).get();
    // check that the project exists
    if (!projectRef.exists) {
        throw new functions.https.HttpsError("not-found", "Project not found");
    }

    const project = projectRef.data();

    // check that the project status is 'submitted' - only draft projects can be rejected
    if (project.status && project.status !== "submitted") {
        throw new functions.https.HttpsError("invalid-argument", "Project status must be \"submitted\"");
    }

    const isGroupAdmin = util.isGroupAdmin(context, project);
    const authorized = util.isSuperAdmin(context) || isGroupAdmin;
    if (!authorized) {
        throw new functions.https.HttpsError("permission-denied", "User is not a super admin nor a group admin");
    }

    console.log("Updating project status to public");
    const rejectedTime = new Date();
    try {
        registryCollection.doc(projectId).update({
            status: "draft",
            rejectedTime: Timestamp.fromDate(rejectedTime),
            // delete publishedTime
            publishedTime: FieldValue.delete(),
            rejectedReason: reason
        });
        console.log("Project status updated to draft");

        // send email to the project author
        console.log("Sending email to the project author");
        const ownerId = project.created_by;

        // get displayName from the user in the authentication service
        const ownerEmail = await util.getUserEmail(ownerId);
        if (ownerEmail) {
            const ownerName = await util.getUserDisplayName(ownerId) || ownerEmail;
            const groupName = await util.getGroupName(project.group);
            const mailDoc = emailTemplates.initiativeRejected([ownerEmail], groupName, projectId, project.project.title, ownerName, reason);
            await util.mailCollection.add(mailDoc);
        } else {
            console.log("User email not found");
        }

        return { message: "Success! Project rejected." };
    } catch (error) {
        console.log("Error updating project status to draft", error);
        throw new functions.https.HttpsError("internal", "Error updating project status to draft");
    }
});
