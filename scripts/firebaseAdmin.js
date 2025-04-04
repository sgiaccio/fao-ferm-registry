const admin = require('firebase-admin');

// process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
// admin.initializeApp({
//     projectId: "fao-ferm"
// });

const serviceAccount = require("../private_scripts/fao-ferm-firebase-adminsdk-h89r3-6ce07901c9.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

exports.db = admin.firestore();
exports.admin = admin;