const admin = require("firebase-admin");

// Load the service account key JSON file:
const serviceAccount = require("./fao-ferm-firebase-adminsdk-h89r3-6ce07901c9");

const gaul = require("../src/components/project/gaul.json");
const iso2 = require("./iso2.json");


// process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
// admin.initializeApp({
//     projectId: "fao-ferm"
// });

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();


async function uploadData(coll, data, depth = 0) {
    for (let i = 0; i < data.length; i++) {
        const adminArea = data[i]

        const jsonDoc = { name: adminArea.name };
        if (depth === 0) {
            const iso2Entry = iso2.find(iso2 => iso2.code == adminArea.code);
            if (iso2Entry) {
                jsonDoc.iso2 = iso2Entry.iso2;
            }
        }
    
        await coll.doc(adminArea.code).set(jsonDoc);
        console.log(`Uploaded ${adminArea.name} (${adminArea.code})`);

        if (adminArea.children && adminArea.children.length) {
            await uploadData(coll.doc(adminArea.code).collection('children') , adminArea.children, depth + 1);
        }
    }
}

// Get first 10 entries of the gaul data
const gaulSliced = gaul.slice(0, 2);

(async () => await uploadData(db.collection('gaul'), gaul))();
