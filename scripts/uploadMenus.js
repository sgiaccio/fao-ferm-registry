const admin = require("firebase-admin");

// Load the service account key JSON file:
const menus = require("./menus");


process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
admin.initializeApp({
    projectId: "fao-ferm"
});

// const serviceAccount = require("./fao-ferm-firebase-adminsdk-h89r3-6ce07901c9");
// admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount)
// });

const db = admin.firestore();

async function uploadData(collectionName, data) {
    try {
        const batch = db.batch();

        const docRef = db.collection("menus").doc(`${collectionName}`);
        batch.set(docRef, { items: data });

        await batch.commit();
        console.log(`Data uploaded to ${collectionName} collection successfully.`);
    } catch (error) {
        console.log("error uploading data:");
        console.log(data);
        console.error(error);
        // throw error;
    }
}


Object.keys(menus).forEach(async (key) => {
    console.log(JSON.parse(JSON.stringify(menus[key])));
    await uploadData(key, menus[key]);
});
