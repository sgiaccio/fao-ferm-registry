const { Timestamp } = require('@google-cloud/firestore');
const admin = require('firebase-admin');


process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';

// Load the service account key JSON file:
// let serviceAccount = require('./fao-ferm-firebase-adminsdk-h89r3-6ce07901c9');


admin.initializeApp({
    projectId: 'fao-ferm'
    // credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

// Renames 'update-time' to 'updateTime' in all documents in the 'registry' collection. Deletes the 'update-time' field.
db.collection('registry').get().then(snapshot => {
    snapshot.forEach(doc => {
        // if the 'updateTime' field already exists or the 'update-time' field doesn't exist, skip this document
        if (doc.data().updateTime || !doc.data()['update-time']) {
            return;
        }
        
        doc.ref.update({
            // updates the 'update-time' field to 'updateTime'
            updateTime: new Timestamp(doc.data()['update-time'].seconds, doc.data()['update-time'].nanoseconds),
            // deletes the 'update-time' field
            'update-time': admin.firestore.FieldValue.delete()
        });
    });
});
