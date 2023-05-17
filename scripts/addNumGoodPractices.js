const admin = require('firebase-admin');

process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';

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
        console.log(doc.id);
        // count the number of related good practices
        // find the good practices that have projectId equal to doc.id
        db.collection('bestPractices').where('projectId', '==', doc.id).get().then(async snapshot2 => {
            const goodPracticesCount = snapshot2.size;
            console.log(doc.id, doc.data().project.title, goodPracticesCount);
            await doc.ref.update({
                goodPracticesCount: goodPracticesCount
            });
        });



        // doc.ref.update({
        //     // updates the 'update-time' field to 'updateTime'
        //     updateTime: new Timestamp(doc.data()['update-time'].seconds, doc.data()['update-time'].nanoseconds),
        //     // deletes the 'update-time' field
        //     'update-time': admin.firestore.FieldValue.delete()
        // });
    });
});
