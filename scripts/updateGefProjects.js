const admin = require('firebase-admin');


// process.env['FIRESTORE_EMULATOR_HOST'] = 'localhost:8080';

// Load the service account key JSON file:
let serviceAccount = require('./fao-ferm-firebase-adminsdk-h89r3-6ce07901c9');


admin.initializeApp({
    // projectId: 'fao-ferm'
    credential: admin.credential.cert(serviceAccount)
});

let db = admin.firestore();

// get all the projects in the gef group
db.collection('registry').where('group', '==', 'mrrzmcKjPQQOqB8uZBKU').get().then(snapshot => {
    snapshot.forEach(doc => {
        const id = doc.id;
        db.collection('areas').doc(id).get().then(areaDoc => {
            const areasData = areaDoc.data();
            const areas = areasData['areas'];
            areas.forEach(area => {
                const areaObject = Object.values(area)[0];
                if (areaObject.gefIndicators) {
                    console.log('------------------------------------');
                    console.log(id);
                    console.log(areaObject.gefIndicators);
                    if (areaObject.gefIndicators.length > 1) {
                        console.log('More than one gef indicator - skipping');
                        return;
                    }
                    const gefIndicator = areaObject.gefIndicators[0];
                    console.log(gefIndicator);
                    // TODO: update the area document
                    delete areaObject.gefIndicators;
                    areaObject.gefIndicator = gefIndicator;
                }
            });
            console.log(JSON.stringify(areasData, null, 2));
            
            // update the area document
            db.collection('areas').doc(id).update(areasData);
        });
    });
});
