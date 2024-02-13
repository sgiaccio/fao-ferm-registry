const admin = require("firebase-admin");

// Load the service account key JSON file:
const menus = require("./menus");


// process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
// admin.initializeApp({
//     projectId: "fao-ferm"
// });

const serviceAccount = require("../private_scripts/fao-ferm-firebase-adminsdk-h89r3-6ce07901c9.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadData(collectionName, data) {
    try {
        const batch = db.batch();

        const docRef = db.collection("menus").doc(`${collectionName}`);
        batch.set(docRef, { items: data });

        await batch.commit();
    } catch (error) {
        console.error(error);
        // throw error;
    }
}


Object.keys(menus).forEach(async (key) => {
    await uploadData(key, menus[key]);
});
