const { Timestamp } = require('@google-cloud/firestore');
const admin = require('firebase-admin');


process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';

// Load the service account key JSON file:
let serviceAccount = require('./fao-ferm-firebase-adminsdk-h89r3-6ce07901c9');


admin.initializeApp({
    // projectId: 'fao-ferm'
    credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

db.collection('registry').orderBy('updateTime', 'desc').get().then(snapshot => {
    console.log(snapshot.size);
    snapshot.forEach(doc => {
        console.log(doc.id, doc.data().project.title);
    });
});
