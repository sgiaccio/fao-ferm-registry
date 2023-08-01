const admin = require('firebase-admin');

// process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';

// Load the service account key JSON file:
let serviceAccount = require('./fao-ferm-firebase-adminsdk-h89r3-6ce07901c9');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

// Fetch documents from the 'registry' collection where project.targetArea.units != "ha"
db.collection('registry').where("project.targetArea.units", "!=", "ha").get().then(snapshot => {
    snapshot.forEach(doc => {
        console.log(`${doc.id}\t${doc.data().project.title}\t${doc.data().project.targetArea.units}`);
    });
}).catch(err => {
    console.error('Error fetching documents:', err);
});
