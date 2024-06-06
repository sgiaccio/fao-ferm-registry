const functions = require("firebase-functions");
const { getStorage } = require('firebase-admin/storage');

const { Pool } = require("pg");
const axios = require("axios");

// const { areasCollection, registryCollection } = require("./util");
const { areasCollection } = require("./util");

const { defineString } = require("firebase-functions/params");

const { gaul2iso } = require("./gaul2iso");

const serviceAccount = require('./fao-ferm2-review-ad0074f38f58.json'); // Your path to the service account key
const ee = require('@google/earthengine'); // ee is required to find intersecting countries

const { isSuperAdmin, isGroupAdmin, isGroupEditor, isCollaborator, registryCollection } = require("./util");

// Secrets api is not working, so we are using config instead for now
// const earthMapApiKey = defineSecret("EARTHMAP_API_KEY");
// const dbUser = defineSecret("DB_USER");
// const dbHost = defineSecret("DB_HOST");
// const dbDatabase = defineSecret("DB_DATABASE");
// const dbPassword = defineSecret("DB_PASSWORD");
const earthMapApiKey = defineString("EARTHMAP_API_KEY");
const dbUser = defineString("DB_USER");
const dbHost = defineString("DB_HOST");
const dbDatabase = defineString("DB_DATABASE");
const dbPassword = defineString("DB_PASSWORD");

let pool;

/**
 * Returns a PostgreSQL connection pool based on the provided secrets.
 * Note: This function is designed to work with a consistent set of secrets.
 * If called with different secrets, the pool from the initial call will be reused.
 *
 * @param {Object} secrets - Contains user, host, database, and password properties for the database connection.
 * @returns {Pool} A connection pool for PostgreSQL.
 */
function getDatabasePool(secrets) {
    if (!pool) {
        pool = new Pool({
            user: secrets.user,
            host: secrets.host,
            database: secrets.database,
            password: secrets.password
        });
    }
    return pool;
}

function getDatabaseClient(secrets) {
    return getDatabasePool(secrets).connect().catch(error => {
        functions.logger.error("Database connection error:", error);
        throw new functions.https.HttpsError("internal", "Failed to connect to the database.");
    });
}

/**
 * Fetches a polygon from the database as GeoJSON based on its ID.
 *
 * @param {number} uuid The ID of the polygon.
 * @param {PoolClient} client The database client to use.
 * @returns {Object} The GeoJSON representation of the polygon.
 */
async function fetchPolygonFromDatabase(client, uuid) {
    if (!isValidUuid(uuid)) {
        throw new Error("Invalid UUID");
    }

    const query = "SELECT ST_AsGeoJSON(geom) AS geojson FROM project_areas WHERE area_uuid = $1";

    try {
        const result = await client.query(query, [uuid]);
        if (result.rows.length === 0) {
            return null;
        }

        return JSON.parse(result.rows[0].geojson);
    } catch (error) {
        throw new Error("Database query failed: " + error.message);
    }
}

async function fetchPolygonsFromDatabase(client, uuids) {
    if (!uuids || !uuids.length || !uuids.every(isValidUuid)) {
        throw new Error("Invalid UUIDs: ", uuids.join(", "));
    }

    const query = "SELECT ST_AsGeoJSON(ST_Union(geom::geometry)) AS geojson FROM project_areas WHERE area_uuid = ANY($1::uuid[])";

    try {
        const result = await client.query(query, [uuids]);
        if (result.rows.length === 0) {
            return null;
        }

        return JSON.parse(result.rows[0].geojson);
    } catch (error) {
        throw new Error("Could not fetch polygons from database: " + error.message);
    }
}

/**
 * Fetches data from EarthMap API.
 * @param {string} earthMapApiKey The EarthMap API key.
 * @param {Object} polygon The polygon to fetch data for.
 * @param {string} stats The statistics to fetch.
 * @returns {Promise<any>}
 */
async function fetchData(earthMapApiKey, polygon, stats, options) {
    const payload = {
        id: stats,
        feature: {
            type: "Feature",
            geometry: polygon
        }
    };
    if (options) {
        payload.options = options;
    }

    try {
        const response = await axios.post("https://earthmap.org/api/statistics", payload, {
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${earthMapApiKey}`,
                "Content-Type": "application/json"
            }
        });

        return response.data;
    } catch (error) {
        functions.logger.error("Error fetching data:", error);
        throw new Error(`API responded with error: ${error.message}`);
    }
}

exports.getPolygonZonalStats = functions
    // .runWith({ secrets: [dbUser, dbHost, dbDatabase, dbPassword, earthMapApiKey] })
    .https
    .onCall(async ({ polygonId, stats, options }, context) => {
        // Check if the user is logged in
        if (!context.auth) {
            throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to fetch polygon data.");
        }

        const client = await getDatabaseClient({
            user: dbUser.value(),
            host: dbHost.value(),
            database: dbDatabase.value(),
            password: dbPassword.value()
        });

        try {
            // Fetch the polygon from the database. If it doesn't exist, throw an error.
            functions.logger.log("Fetching polygon for ID:", polygonId, "...");
            const polygon = await fetchPolygonFromDatabase(client, polygonId);
            if (!polygon) {
                throw new functions.https.HttpsError("not-found", "Polygon not found");
            }

            // Fetch the data from the EarthMap API.
            functions.logger.log("Fetching data from EarthMap API...");
            const result = await fetchData(earthMapApiKey.value(), polygon, stats, options);
            if (!result) {
                throw new functions.https.HttpsError("unknown", "No data returned from external API.");
            }

            return result;
        } catch (error) {
            if (error instanceof functions.https.HttpsError) {
                throw error; // Re-throw if it's already an HttpsError
            }
            functions.logger.error("Error:", error);
            throw new functions.https.HttpsError("internal", error.message);
        } finally {
            client.release();
        }
    });

// Periodically create a shapefile with public records from the registry collection
// exports.updateBpIdFieldOnWrite = functions.firestore
// Don't know what I did here.
//     .document('registry/{document}/bestPractices/{bestPracticeId}')
//     .onUpdate(async (change, context) => {
//         functions.logger.info("Creating a shapefile of public project polygons...");

//         // Get only records where the status is "public"
//         const registrySnapshot = await db.collection("registry")
//             .where("status", "==", "public")
//             .get();

//         // Get all the polygon areas from the areas collection in firestore
//         const areasSnapshot = await db.collection("areas").get();

//         // get all the area uuids from the areas collection in firestore
//         const areasSnapshot = await db.collection("areas").get();
//         const validUUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;
//         const areaUuids = areasSnapshot.docs
//             .flatMap(doc => doc.data().areas) // Use flatMap to flatten the array while mapping
//             .filter(area => ["upload", "draw"].includes(Object.keys(area)[0])) // Only keep objects with "upload" or "draw" keys
//             .map(area => (Object.values(area)[0] || {}).uuid) // Extract the UUID from the object value
//             .filter(uuid => uuid && isValidUuid(uuid)); // Ensure truthy and valid UUIDs

//         const client = await getDatabaseClient({
//             user: dbUser.value(),
//             host: dbHost.value(),
//             database: dbDatabase.value(),
//             password: dbPassword.value()
//         });

//         try {
//             // Delete all project_areas records that are not in the areaUuids array
//             const deleteQuery = `
//             DELETE FROM project_areas
//             WHERE area_uuid != ALL($1::uuid[])
//             AND created_at < NOW() - INTERVAL '14 days';`;
//             const deleteResult = await client.query(deleteQuery, [areaUuids]);

//             const deletedRowCount = deleteResult.rowCount;
//             if (deletedRowCount === 0) {
//                 functions.logger.info("No areas to delete from postgres db.");
//             } else {
//                 functions.logger.info(`Deleted ${deletedRowCount} areas from postgres db.`);
//             }
//         } catch (error) {
//             functions.logger.error("Error deleting areas from postgres:", error);
//             throw new Error("Error deleting areas from postgres: " + error.message);
//         } finally {
//             client.release();
//         }
//     });

// exports.deleteAllProjectAreas = functions.https.onCall(async ({ projectId }, context) => {
//     if (!projectId) {
//         throw new functions.https.HttpsError("invalid-argument", "projectId is required.");
//     }
//
//     // Ensure the user is authenticated
//     if (!context.auth) {
//         throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to delete areas.");
//     }
//
//     // Ensure that the related project is not published
//     if (await isProjectPublic(projectId)) {
//         throw new functions.https.HttpsError("permission-denied", "Cannot delete areas of a published project.");
//     }
//
//     // Ensure the user is a superadmin, he is a group admin, or he is a group member and the author of the area
//     if (!isSuperAdmin(context) && !isGroupAdmin(context, projectId) && !isGroupEditor(context, projectId)) {
//         throw new functions.https.HttpsError("permission-denied", "User must be a superadmin, a group admin, or a group editor to delete areas.");
//     }
//
//     // Fetch the area with the ID matching projectId
//     const areaDoc = await db.collection("areas").doc(projectId).get();
//
//     if (!areaDoc.exists) {
//         return { message: "No areas to delete." };
//     }
//
//     // Delete the document
//     await areaDoc.ref.delete();
//
//     return { message: `Deleted area with ID: ${projectId}` };
// });

const validUUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;
function isValidUuid(uuid) {
    return uuid && validUUIDPattern.test(uuid);
}

/*
// ------------------------------------------------------------
// DO NOT DEPLOY THIS FUNCTION
// THIS FUNCTION NEEDS TO BE TESTED BEFORE DEPLOYING
// ------------------------------------------------------------
// Periodically delete dangling project_areas records from the
// PostgreSQL database
// ------------------------------------------------------------
// exports.deleteDanglingAreaRecords___DO_NOT_DEPLOY = functions
//     // .runWith({ secrets: [dbUser, dbHost, dbDatabase, dbPassword] })
//     .pubsub.schedule("0 0 * * *")
//     .onRun(async (context) => {
//         functions.logger.info("Deleting dangling areas from postgres db...");

//         // get all the area uuids from the areas collection in firestore
//         // const areasSnapshot = await db.collection("areas").get();
//         // const areaUuids = areasSnapshot.docs
//         //     .flatMap(doc => doc.data().areas || []) // Use flatMap to flatten the array while mapping
//         //     // .filter(area => ["upload", "draw"].includes(Object.keys(area)[0])) // Only keep objects with "upload" or "draw" keys
//         //     .map(area => (Object.values(area)[0] || {}).uuid) // Extract the UUID from the object value
//         //     .filter(uuid => isValidUuid(uuid)); // Ensure truthy and valid UUIDs

//         // Get all the area uuids from the 'areas' collection in Firestore.
//         const areasSnapshot = await admin.firestore().collection('areas').get();
//         const areaUuids = areasSnapshot.docs
//             .flatMap(doc => {
//                 // Get the 'areas' array from the document's data, or default to an empty array.
//                 // const areasArray = 
//                 const areas = doc.data().areas;
//                 return getUploadedAreasUuids(areas); // Filter out any undefined or invalid UUIDs.
//             });

//         const client = await getDatabaseClient({
//             user: dbUser.value(),
//             host: dbHost.value(),
//             database: dbDatabase.value(),
//             password: dbPassword.value()
//         });

//         try {
//             // Delete all project_areas records that are not in the areaUuids array
//             const deleteQuery = `
//             DELETE FROM project_areas
//             WHERE area_uuid != ALL($1::uuid[])
//             AND created_at < NOW() - INTERVAL '14 days';`;
//             const deleteResult = await client.query(deleteQuery, [areaUuids]);

//             const deletedRowCount = deleteResult.rowCount;
//             if (deletedRowCount === 0) {
//                 functions.logger.info("No areas to delete from postgres db.");
//             } else {
//                 functions.logger.info(`Deleted ${deletedRowCount} areas from postgres db.`);
//             }
//         } catch (error) {
//             functions.logger.error("Error deleting areas from postgres:", error);
//             throw new Error("Error deleting areas from postgres: " + error.message);
//         } finally {
//             client.release();
//         }
//     });
*/

// This function was meant to be run once to set the project.countries field in the registry collection
// DO NOT DEPLOY THIS FUNCTION
// exports.setProjectAreasSecret = functions.runWith({ timeoutSeconds: 540 }).https.onRequest(async (req, res) => {
//     return;
//     if (false) {
//         return;
//         functions.logger.info("getting list of countries");
//         const areasSnapshot = await areasCollection.get();
//         const allAreas = areasSnapshot.docs.map(doc => ({ id: doc.id, data: doc.data() }));

//         const client = await getDatabaseClient({
//             user: dbUser.value(),
//             host: dbHost.value(),
//             database: dbDatabase.value(),
//             password: dbPassword.value()
//         });

//         let i = 0;
//         for (const { id, data } of allAreas) {
//             // if (i++ > 10) continue;
//             // console.log(Object.values(data.areas || {}))
//             if (id === 'IcbmtEM4PWQw5mbvUJwm') continue; // this makes the thing crash
//             // bRweaO6vbmoubzlLjMQD, eDSF9xpF4sHj7aojdgji, eFtOMxINrMYSXcsqtWds, wrlRf4Zkp1MCruQsfjbU also causes an error - check
//             console.log(' -------------------------------------');
//             console.log('Processing area ' + id);
//             const uuids = data.areas.map(a => Object.values(a)).map(v => v[0].uuid).filter(uuid => uuid).filter(isValidUuid)
//             console.log('uuids', uuids)
//             const adminIso2Codes = data.areas.map(a => Object.values(a)).map(v => +v[0].admin0).filter(a0 => a0).map(gaul2iso).filter(iso => iso);

//             let uploadedIso2Codes = [];
//             try {
//                 if (uuids.length) {
//                     const polygonsData = await fetchPolygonsFromDatabase(client, uuids);
//                     // get list of intersecting countries
//                     const intersectingCountries = await getIntersectingCountriesFromGee(polygonsData);
//                     // get the list of intersecting countries iso2 codes
//                     uploadedIso2Codes = intersectingCountries?.length ? intersectingCountries.map(c => gaul2iso(c.code)).filter(c => c) : [];
//                 }
//             } catch (error) {
//                 console.error('Error getting intersecting countries:', error);
//             }

//             const allIso2Codes = [...new Set([...adminIso2Codes, ...uploadedIso2Codes])];
//             console.log('uploadedIso2Codes', uploadedIso2Codes);
//             console.log('adminIso2Codes', adminIso2Codes);
//             console.log('allIso2Codes', allIso2Codes);

//             // save in registry document
//             try {
//                 const docUpdate = {};
//                 docUpdate['project.countries'] = allIso2Codes;
//                 await registryCollection.doc(id).update(docUpdate);
//             } catch (error) {
//                 console.error('Error updating registry document:', error);
//             }

//             // const polygonsData = await fetchPolygonsFromDatabase(client, uuids);

//             // if (!polygonsData) {
//             //     return
//             // }

//             // const intersectingCountries = await getIntersectingCountriesFromGee(polygonsData);

//             // console.log('intersectingCountries', intersectingCountries);
//         }

//         client.release();
//         return res.send({ test: 'test' });
//     }
//     else {
//         return;
//     }
//     return;
// });



// exports.setProjectAreas_____d3fe = functions
//     .https
//     .onRequest(async (_req, _res) => {
//         return ({ test: 'test' });
//         functions.logger.info("getting list of countries");

//         const areasSnapshot = areasCollection.get();
//         return console.log(areasSnapshot.docs)

//         areasSnapshot.docs.forEach(async doc => {
//             const data = doc.data();
//             const uuids = data.map(a => Object.values(a)).map(v => v[0].uuid).filter(uuid => uuid)
//             const adminAreasIsoCodes = new Set(data.map(a => Object.values(a)).map(v => +v[0].admin0).filter(a0 => a0).map(gaul2iso).filter(iso => iso));

//             console.log('uuids', uuids);
//             console.log('adminAreasIsoCodes', adminAreasIsoCodes);

//             const polygonsData = await fetchPolygonsFromDatabase(client, uuids);

//             if (!polygonsData) {
//                 return
//             }

//             const intersectingCountries = await getIntersectingCountriesFromGee(polygonsData);

//             console.log('intersectingCountries', intersectingCountries);
//         });
//         // const areaUuids = areasSnapshot.docs
//         //     .flatMap(doc => {
//         //         // Get the 'areas' array from the document's data, or default to an empty array.
//         //         // const areasArray = 
//         //         const areas = doc.data().areas;
//         //         return getUploadedAreasUuids(areas); // Filter out any undefined or invalid UUIDs.
//         //     });

//         // const client = await getDatabaseClient({
//         //     user: dbUser.value(),
//         //     host: dbHost.value(),
//         //     database: dbDatabase.value(),
//         //     password: dbPassword.value()
//         // });

//         // try {
//         //     // Delete all project_areas records that are not in the areaUuids array
//         //     const deleteQuery = `
//         //     DELETE FROM project_areas
//         //     WHERE area_uuid != ALL($1::uuid[])
//         //     AND created_at < NOW() - INTERVAL '14 days';`;
//         //     const deleteResult = await client.query(deleteQuery, [areaUuids]);

//         //     const deletedRowCount = deleteResult.rowCount;
//         //     if (deletedRowCount === 0) {
//         //         functions.logger.info("No areas to delete from postgres db.");
//         //     } else {
//         //         functions.logger.info(`Deleted ${deletedRowCount} areas from postgres db.`);
//         //     }
//         // } catch (error) {
//         //     functions.logger.error("Error deleting areas from postgres:", error);
//         //     throw new Error("Error deleting areas from postgres: " + error.message);
//         // } finally {
//         //     client.release();
//         // }
//     });






function getUploadedAreasUuids(areas = []) {
    return areas
        .map(areaObject => {
            // Get all values (which are objects) from each area object, and find the one that has a 'uuid'.
            // using this instead of Object.values(areaObject)[0] here because it's more robust
            const areaData = Object.values(areaObject).find(value => value.hasOwnProperty('uuid'));
            return areaData?.uuid;
        })
        .filter(isValidUuid);
}

// exports.getPolygonsFromUuids = functions
//     // .runWith({ secrets: [dbUser, dbHost, dbDatabase, dbPassword, earthMapApiKey] })
//     .https
//     .onCall(async ({ uuids }, context) => {
//         // Check if the user is logged in
//         if (!context.auth) {
//             throw new functions.https.HttpsError("unauthenticated", "User must be authenticated to fetch polygon data.");
//         }

//         const client = await getDatabaseClient({
//             user: dbUser.value(),
//             host: dbHost.value(),
//             database: dbDatabase.value(),
//             password: dbPassword.value()
//         });

//         try {
//             // Fetch the polygon from the database. If it doesn't exist, throw an error.
//             // functions.logger.log("Fetching polygon for ID:", polygonId, "...");
//             // const polygon = await fetchPolygonFromDatabase(client, polygonId);
//             // if (!polygon) {
//             //     throw new functions.https.HttpsError("not-found", "Polygon not found");
//             // }

//             // get all the polygons from the areas collection in firestore
//             const areasSnapshot = await db.collection("areas").get();
//             const areaUuids = areasSnapshot.docs
//                 .flatMap(doc => doc.data().areas) // Use flatMap to flatten the array while mapping
//                 .filter(area => ["upload", "draw"].includes(Object.keys(area)[0])) // Only keep objects with "upload" or "draw" keys
//                 .map(area => (Object.values(area)[0] || {}).uuid) // Extract the UUID from the object value
//                 .filter(uuid => uuid && isValidUuid(uuid)); // Ensure truthy and valid UUIDs

//             return result;
//         } catch (error) {
//             if (error instanceof functions.https.HttpsError) {
//                 throw error; // Re-throw if it's already an HttpsError
//             }
//             functions.logger.error("Error:", error);
//             throw new functions.https.HttpsError("internal", error.message);
//         } finally {
//             client.release();
//         }
//     });



// async function getAreasUuids(projectId) {
//     const areaDoc = await areasCollection.doc(projectId).get();
//     if (!areaDoc.exists) {
//         throw new functions.https.HttpsError("not-found", "No areas found for document", projectId);
//     }

//     return getUploadedAreasUuids(areaDoc.data().areas);
// }


ee.data.authenticateViaPrivateKey(serviceAccount, () => {
    ee.initialize(null, null, () => {
        console.log('Authenticated and initialized GEE successfully.');
    }, (err) => {
        console.error('Failed to initialize GEE:', err);
    });
}, (err) => {
    console.error('Failed to authenticate GEE:', err);
});

// Function to use the fetched GeoJSON in GEE
function getIntersectingCountriesFromGee(polygons) {
    return new Promise((resolve, reject) => {
        // Convert GeoJSON to an Earth Engine Geometry
        // const tolerance = 10000; // Tolerance in meters
        const geometry = ee.Geometry(polygons); //.simplify(tolerance);

        const countries = ee.FeatureCollection('FAO/GAUL/2015/level0');

        // Filter the countries FeatureCollection to get those that intersect with the geometry
        const intersectingCountries = countries.filterBounds(geometry);

        intersectingCountries.evaluate(function (result, error) {
            if (error) {
                reject(error);
            } else {
                // Process the result to extract country names and codes
                const countryInfo = result.features.map(feature => ({
                    name: feature.properties.ADM0_NAME,
                    code: feature.properties.ADM0_CODE
                }));
                resolve(countryInfo);
            }
        });
    });
}

exports.getIntersectingCountries = functions.runWith({ timeoutSeconds: 120 }).https.onCall(async (data, context) => {
    // Check for user authentication
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    // Get the UUIDs from the data payload
    const { uuids } = data;
    if (!uuids) {
        throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a valid "projectId" argument.');
    }

    const client = await getDatabaseClient({
        user: dbUser.value(),
        host: dbHost.value(),
        database: dbDatabase.value(),
        password: dbPassword.value()
    });

    try {
        // const uuids = await getAreasUuids(projectId);
        const polygonsData = await fetchPolygonsFromDatabase(client, uuids);

        if (!polygonsData) {
            throw new functions.https.HttpsError('not-found', 'No polygons found for the given UUIDs.');
        }
        const analysisResults = await getIntersectingCountriesFromGee(polygonsData);

        // Return the ISO 2 codes array of intersecting countries
        return analysisResults.map(c => gaul2iso(c.code)).filter(c => c);
    } catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error; // Re-throw if it's already an HttpsError
        }
        functions.logger.error("Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    } finally {
        client.release();
    }
});

// This function returns a GeometryCollection of all the areas in a project
exports.getProjectAreas = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const projectId = data.projectId;

    // get the project document from Firestore
    const projectSnapshot = await registryCollection.doc(projectId).get();
    // check that the project exists
    if (!projectSnapshot.exists) {
        throw new functions.https.HttpsError("not-found", "Project not found");
    }
    // get the project document data
    const projectData = projectSnapshot.data();

    if (!isSuperAdmin(context) && !isGroupAdmin(context, projectData) && !isGroupEditor(context, projectData) && !isCollaborator(context, projectData)) {
        throw new functions.https.HttpsError("permission-denied", "User must be a superadmin, a group admin, a group editor or a collaborator to get areas.");
    }

    // Fetch the area with the ID matching projectId
    const areaDoc = await areasCollection.doc(projectId).get();

    if (!areaDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'No areas found for document', projectId);
    }

    const areaUuids = getUploadedAreasUuids(areaDoc.data().areas);

    // execute this query but also on areauuids: "SELECT ST_AsGeoJSON(ST_Collect(ST_CollectionExtract(geom::geometry))) FROM project_areas WHERE project_id = %s"
    const client = await getDatabaseClient({
        user: dbUser.value(),
        host: dbHost.value(),
        database: dbDatabase.value(),
        password: dbPassword.value()
    });

    try {
        const query = "SELECT ST_AsGeoJSON(ST_Collect(ST_CollectionExtract(geom::geometry))) as geojson FROM project_areas WHERE project_id = $1 AND area_uuid = ANY($2::uuid[])";
        const result = await client.query(query, [projectId, areaUuids]);

        if (!result?.rows?.length) {
            throw new functions.https.HttpsError('not-found', 'No polygons found for the given project.');
        }

        return JSON.parse(result.rows[0].geojson)
    } catch (error) {
        if (error instanceof functions.https.HttpsError) {
            throw error; // Re-throw if it's already an HttpsError
        }
        functions.logger.error("Error:", error);
        throw new functions.https.HttpsError("internal", error.message);
    } finally {
        client.release();
    }

});


const earthMapBucket = getStorage().bucket('fao-ferm-earthmap-export');

// This function returns a FeatureCollection of all the areas in a project - for use in the EarthMap
exports.getAllProjectAreasGeoJson = functions.https.onCall(async (data, context) => {
    if (!context.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
    }

    const projectId = data.projectId;
    // get the project document from Firestore
    const projectSnapshot = await registryCollection.doc(projectId).get();
    // check that the project exists
    if (!projectSnapshot.exists) {
        throw new functions.https.HttpsError("not-found", "Project not found");
    }
    // get the project document data
    const projectData = projectSnapshot.data();

    if (!isSuperAdmin(context) && !isGroupAdmin(context, projectData) && !isGroupEditor(context, projectData) && !isCollaborator(context, projectData)) {
        throw new functions.https.HttpsError("permission-denied", "User must be a superadmin, a group admin, a group editor or a collaborator to get areas.");
    }

    // get all the areas document with id = projectId
    const areaDocRef = areasCollection.doc(projectId);
    const areaDocSnap = await areaDocRef.get();

    const uuids = data.uuids;
    if (!uuids || !uuids.length || !uuids.every(isValidUuid)) {
        throw new functions.https.HttpsError("invalid-argument", "Invalid UUIDs: ", uuids.join(", "));
    }

    if (areaDocSnap.exists) {
        const data = areaDocSnap.data();
        if (!data.areas) {
            throw new functions.https.HttpsError("not-found", "No areas found for the given project.");
        }

        const areasWithUuids = data.areas
            .filter(a => Object.values(a)[0].uuid && isValidUuid(Object.values(a)[0].uuid))
            .filter(a => uuids.includes(Object.values(a)[0].uuid));
        const areaUuids = areasWithUuids.map(a => Object.values(a)[0].uuid);
        const areaNames = areasWithUuids.map((a, i) => Object.values(a)[0].siteName || `Area ${i + 1}`);

        // delete the areasUuids and areaNames that are not in the uuids array
        const filteredAreaUuids = areaUuids.filter(uuid => uuids.includes(uuid));
        const filteredAreaNames = areaNames.filter((_, i) => uuids.includes(areaUuids[i]));

        if (!areaUuids.length) {
            // return an empty GeoJSON object
            return {
                type: 'FeatureCollection',
                features: []
            };
        }

        // now perform the database query
        const geoJson = await getAggregatedPolygons(projectId, filteredAreaUuids, filteredAreaNames);

        // if the size of the geoJson as a string is greater than 2kb, save it into a bucket and return the url, otherwise return the geoJson directly
        const geoJsonString = JSON.stringify(geoJson);
        if (geoJsonString.length > 2000) {
            // save the geoJson to a bucket
            // create a random filename for export
            const randomString = Math.random().toString(36).substring(2);
            const filename = `${projectId}-${randomString}-${Date.now()}.geojson`;

            const file = earthMapBucket.file(filename);
            await file.save(geoJsonString, { contentType: 'application/json' });

            return { url: file.publicUrl() };
        }

        return { geoJson };
    } else {
        console.error("No such document");
        return new functions.https.HttpsError("not-found", "No such document");
    }
});


// this function periodically (every hour) deletes all the areas in the `areas/` directory of the storage bucket that were created more than 1 hour ago
exports.deleteOldAreasGeoJson = functions.pubsub.schedule('every 1 hours').onRun(async () => {
    const now = Date.now();
    const oneHourAgo = now - 3600000;

    const [files] = await earthMapBucket.getFiles({ prefix: 'areas/' });

    const filesToDelete = files.filter(file => file.metadata.timeCreated < oneHourAgo);

    await Promise.all(filesToDelete.map(file => file.delete()));

    return filesToDelete.length;
});

async function getAggregatedPolygons(projectId, areaUuids, areaNames) {
    const client = await getDatabaseClient({
        user: dbUser.value(),
        host: dbHost.value(),
        database: dbDatabase.value(),
        password: dbPassword.value()
    });

    try {
        const areaValues = areaUuids.map((_uuid, i) => `($${i + 2}::uuid, $${i + 2 + areaUuids.length}::text)`).join(", ");

        const query = `
            WITH area_names AS (
                SELECT *
                FROM (
                    VALUES ${areaValues}
                ) AS t (area_uuid, name)
            ),
            individual_geoms AS (
                SELECT 
                    pa.area_uuid,
                    an.name,
                    ST_AsGeoJSON(pa.geom::geometry) AS geojson
                FROM 
                    project_areas pa
                JOIN
                    area_names an
                ON
                    pa.area_uuid = an.area_uuid
                WHERE
                    pa.project_id = $1
            ),
            grouped_geoms AS (
                SELECT 
                    area_uuid,
                    name,
                    json_agg(geojson::json) AS geoms
                FROM 
                    individual_geoms
                GROUP BY 
                    area_uuid, name
            ),
            geometry_collections AS (
                SELECT 
                    area_uuid,
                    name,
                    json_build_object(
                        'type', 'GeometryCollection',
                        'geometries', geoms
                    ) AS geojson
                FROM 
                    grouped_geoms
            )
            SELECT 
                json_build_object(
                    'type', 'FeatureCollection',
                    'name', json_build_object(
                        'en', 'FERM Restoration sites',
		                'fr', 'Espaces de restauration FERM',
		                'pt', 'Áreas de Restauração FERM',
		                'es', 'Áreas de restauración FERM'
                    ),
                    'features', json_agg(
                        json_build_object(
                            'type', 'Feature',
                            'geometry', geojson,
                            'properties', json_build_object(
                                'uuid', area_uuid,
                                'name', name
                            )
                        )
                    )
                ) AS geojson
            FROM 
                geometry_collections;
        `;

        const values = [projectId, ...areaUuids, ...areaNames];
        const result = await client.query(query, values);

        if (!result?.rows?.length) {
            throw new Error("No polygons found for the given project.");
        }

        // console.log(JSON.stringify(result.rows[0].geojson, null, 2));
        return result.rows[0].geojson;
    } catch (error) {
        console.error("Error fetching polygons from database:", error);
        throw error;
    }
}

/*
WITH area_names AS (
    VALUES
        ('4ee3e540-19ac-11ef-95b9-07c01b311bea'::uuid, 'Area 1'),
        ('6da2508a-0ede-11ef-b4c3-8fff922eef8c'::uuid, 'Area 2')
),
individual_geoms AS (
    SELECT 
        pa.area_uuid,
        an.name,
        ST_AsGeoJSON(pa.geom::geometry) AS geojson
    FROM 
        project_areas pa
    JOIN
        (SELECT * FROM area_names) an(area_uuid, name)
    ON
        pa.area_uuid = an.area_uuid
    WHERE 
        pa.project_id = 'YJEHbBMIM7k3xMjPQvqJ'
),
grouped_geoms AS (
    SELECT 
        area_uuid,
        name,
        json_agg(geojson::json) AS geoms
    FROM 
        individual_geoms
    GROUP BY 
        area_uuid, name
),
geometry_collections AS (
    SELECT 
        area_uuid,
        name,
        json_build_object(
            'type', 'GeometryCollection',
            'geometries', geoms
        ) AS geojson
    FROM 
        grouped_geoms
)
SELECT 
    json_build_object(
        'type', 'FeatureCollection',
        'features', json_agg(
            json_build_object(
                'type', 'Feature',
                'geometry', geojson,
                'properties', json_build_object(
                    'area_uuid', area_uuid,
                    'name', name
                )
            )
        )
    ) AS geojson
FROM 
    geometry_collections;
*/
