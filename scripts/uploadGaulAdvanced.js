const { db } = require("./firebaseAdmin");

const gaul = require("./gaul.json");
const iso2 = require("./countries_iso2_gaul0.json");


// // Load the service account key JSON file:
// // const serviceAccount = require("./fao-ferm-firebase-adminsdk-h89r3-6ce07901c9");

// // This is for local testing
// process.env["FIRESTORE_EMULATOR_HOST"] = "localhost:8080";
// admin.initializeApp({
//     projectId: "fao-ferm"
// });

// admin.initializeApp({
//     // credential: admin.credential.cert(serviceAccount)
// });

async function uploadData(coll, data, root = true) {
    for (let i = 0; i < data.length; i++) {
        const adminArea = data[i]

        let jsonDoc = { name: adminArea.name };

        // console.log(adminArea)

        if (root) {
            // assign an arbitrary GAUL code to Palestine
            if (adminArea.code === "91267") {
                jsonDoc = {
                    ...jsonDoc,
                    iso2: "PS",
                    country_name_iso2: "Palestine",
                    country_name_en: "Palestine",
                    country_name_ar: "فلسطين",
                    country_name_es: "Palestina",
                    country_name_fr: "Palestine",
                    country_name_ru: "Палестина",
                    country_name_zh: "巴勒斯坦"
                };
            } else {
                // find the iso2 entry for this gaul0 code
                const iso2Entry = iso2.find(iso2 => iso2.gaul0_code == adminArea.code);
                console.log('adminArea.code', adminArea.code);
                console.log('iso2Entry', iso2Entry);
                if (iso2Entry) {
                    jsonDoc = {
                        ...jsonDoc,
                        iso2: iso2Entry.iso2,
                        country_name_iso2: iso2Entry.country_name_iso2,
                        country_name_en: iso2Entry.country_name_en,
                        country_name_ar: iso2Entry.country_name_ar,
                        country_name_es: iso2Entry.country_name_es,
                        country_name_fr: iso2Entry.country_name_fr,
                        country_name_ru: iso2Entry.country_name_ru,
                        country_name_zh: iso2Entry.country_name_zh
                    };
                } else {
                    // skip this entry if there is no iso2 entry for this gaul0 code as it means it's not a country but a lower level admin area
                    continue;
                }
            }
        }

        await coll.doc(adminArea.code).set(jsonDoc);
        console.log(`Uploaded ${adminArea.name} (${adminArea.code})`);

        if (adminArea.children && adminArea.children.length) {
            await uploadData(coll.doc(adminArea.code).collection('children'), adminArea.children, false);
        }
    }
}

// Get first 10 entries of the gaul data
// const gaulSliced = gaul.slice(0, 10);

function prepareGaulData(data) {
    // 267 and 91 are the codes for West Bank and Gaza Strip. They are not in the iso2_advanced.json file. Assign them to Palestine. Palestine will have the made up gaul code 999999
    const westBankLevel1 = data.find(area => area.code === "267").children;
    const gazaStripLevel1 = data.find(area => area.code === "91").children;
    const palestine = { code: "91267", name: "Palestine", children: [...westBankLevel1, ...gazaStripLevel1] };
    // console.log(westBankLevel1);
    // console.log(gazaStripLevel1);
    // console.log('----------------');
    // console.log(JSON.stringify(palestine, null, 2));

    // take out gazastrip and westbank from the original data
    const newData = data.filter(area => area.code !== "267" && area.code !== "91");

    return [...newData, palestine];
}

const preparedData = prepareGaulData(gaul);
(async () => await uploadData(db.collection('adminAreas'), preparedData))();
