const functions = require("firebase-functions");

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
