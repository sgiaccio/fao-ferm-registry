const functions = require("firebase-functions/v1");

const { db } = require("./util");


exports.updateBpIdFieldOnWrite = functions.firestore
    .document('registry/{document}/bestPractices/{bestPracticeId}')
    .onWrite((change, context) => {
        // Check if the document still exists after the event
        if (!change.after.exists) {
            return null;  // Exit gracefully if the document was deleted
        }

        // If the 'id' field is already correctly set, exit without making changes
        const currentId = change.after.data().id;
        const docId = context.params.bestPracticeId;
        if (currentId === docId) {
            return null; // Exit gracefully, no changes needed
        }

        // Get the document reference
        const docRef = change.after.ref;

        // Update the 'id' field with the document ID
        return docRef.update({ id: docId });
    });


exports.getProjectPublicBestPractices = functions
    .region('europe-west3')
    .https
    .onCall(async ({ projectId }, _context) => {
        const bestPracticeRef = db.collection('registry').doc(projectId).collection('bestPractices');
        // look for the best practices that have status == 'published'
        const query = bestPracticeRef.where('status', '==', 'published');
        const snapshot = await query.get();

        return snapshot.docs.map(doc => ({
            id: doc.id,
            title: doc.data().title
        }));
    });
