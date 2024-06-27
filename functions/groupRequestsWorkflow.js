const functions = require("firebase-functions");
const { onCall, HttpsError } = require("firebase-functions/v2/https");

const admin = require("firebase-admin");
const { Firestore } = require("firebase-admin/firestore");
const { newGroupApproval, newGroupRequest, newGroupRejection } = require('./emailTemplates');

const util = require('./util');


// Create documents in the mail collection when a user requests for a new group to be created
exports.sendNewGroupRequestEmail = functions.firestore.document('newGroupRequests/{requestId}').onCreate(async (snap, _context) => {
    const data = snap.data();

    const { userId, name, type, otherType, isa: { partner, actor, flagship }, description, website } = data;

    // Get user's name from the auth system
    const { displayName, email } = await admin.auth().getUser(userId);

    // create mail document
    const mailDoc = newGroupRequest(await util.getSuperAdminEmails(), name, displayName || email, type, otherType, partner, actor, flagship, description, website);

    // add mail document to mail collection
    await util.mailCollection.add(mailDoc);
});

exports.submitNewGroup = onCall(async (request) => {
    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const userId = request.auth.uid;
    const formData = request.data;

    try {
        // Check if a document with the same name already exists
        const newGroupRequestsSnapshot = await util.newGroupRequestsCollection.where('name', '==', formData.name).get();
        if (!newGroupRequestsSnapshot.empty) {
            throw new functions.https.HttpsError('already-exists', 'A group with the same name already exists.');
        }

        // check if a group with the same name exists in the groups collection
        const existingGroupSnapshot = await util.groupsCollection.where('name', '==', formData.name).get();
        if (!existingGroupSnapshot.empty) {
            throw new functions.https.HttpsError('already-exists', 'A group with the same name already exists.');
        }

        const docRef = util.newGroupRequestsCollection.doc();
        await docRef.set({
            ...formData,
            userId: userId,
            status: 'pending',
            private: false,
            createTime: Firestore.FieldValue.serverTimestamp()
        });

        return { message: 'Group submitted successfully.' };
    } catch (error) {
        console.error('Error submitting group:', error);
        if (error instanceof functions.https.HttpsError) {
            throw error; // Re-throw if it's already an HttpsError
        }
        throw new functions.https.HttpsError('internal', 'Unable to submit group.');
    }
});

exports.getMyNewGroupRequests = functions.https.onCall(async (_, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    if (!util.isSuperAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'User is not a superadmin');
    }

    // Get all the requests - order by creation time
    // const requests = await util.newGroupRequestsCollection.get();
    const requests = await util.newGroupRequestsCollection.orderBy('createTime', 'desc').get();

    const requestDocs = requests.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // add user display name to each request
    const requestsWithUserDisplayName = (await Promise.all(requestDocs.map(async request => {
        try {
            const { displayName } = await admin.auth().getUser(request.userId);
            return { ...request, userName: displayName };
        } catch (error) {
            // if the user doesn't exist anymore, skip the request
            console.log('User', request.userId, 'does no longer exist. Skipping request');
            return null;
        }
    }))).filter(r => r !== null);

    // format date in each request
    return await Promise.all(requestsWithUserDisplayName.map(async request => {
        const dateFormatted = request.createTime ? request.createTime.toDate().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }) : null;
        return { ...request, createTime: dateFormatted };
    }));
});

exports.approveNewGroupRequest = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    if (!util.isSuperAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'User is not a superadmin');
    }

    const { requestId } = data;

    // Transaction to add the group to the user's privileges and update the status of the request
    await admin.firestore().runTransaction(async (transaction) => {
        // get the request
        const requestDoc = await transaction.get(util.newGroupRequestsCollection.doc(requestId));

        // check if the request exists
        if (!requestDoc.exists) {
            throw new functions.https.HttpsError('not-found', 'Request not found');
        }

        const request = requestDoc.data();

        // Create the group
        // set values to null if undefined to avoid Firestore errors
        const groupDoc = await util.groupsCollection.add({
            name: request.name || null,
            type: request.type || null,
            otherType: request.otherType || null,
            partner: !!request.isa.partner || null,
            actor: !!request.isa.actor || null,
            flagship: !!request.isa.flagship || null,
            description: request.description || null,
            website: request.website || null,
            createdAt: Firestore.FieldValue.serverTimestamp(),
            private: false
        });

        // Make the user admin of the new group
        try {
            // get current custom claims
            const user = await admin.auth().getUser(request.userId);
            const customClaims = user.customClaims || { privileges: {} };
            await admin.auth().setCustomUserClaims(request.userId, { ...customClaims, privileges: { ...customClaims.privileges, [groupDoc.id]: 'admin' } });
        } catch (err) {
            console.error('Error setting custom claims:', err);
            throw new functions.https.HttpsError('internal', 'Error setting custom claims');
        }

        // Mark the request as approved
        transaction.update(util.newGroupRequestsCollection.doc(requestId), {
            status: 'approved'
        });

        // Send email to the user
        try {
            const { displayName, email } = await admin.auth().getUser(request.userId);

            const mailDoc = newGroupApproval(email, displayName, request.name);
            await util.mailCollection.add(mailDoc);
        } catch (error) {
            console.error('Error sending email to user:', error);
        }
        
        return groupDoc;

    });
});

exports.rejectNewGroupRequest = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User is not authenticated');
    }

    if (!util.isSuperAdmin(context)) {
        throw new functions.https.HttpsError('permission-denied', 'User is not a superadmin');
    }

    const { requestId } = data;

    // Mark the request as rejected
    await util.newGroupRequestsCollection.doc(requestId).update({
        status: 'rejected'
    });

    // send email to the user
    try {
        const requestDoc = await util.newGroupRequestsCollection.doc(requestId).get();
        const request = requestDoc.data();
        const { displayName, email } = await admin.auth().getUser(request.userId);
        const mailDoc = newGroupRejection(email, displayName, request.name);
        await util.mailCollection.add(mailDoc);
    } catch (error) {
        console.error('Error sending email to user:', error);
    }
});
