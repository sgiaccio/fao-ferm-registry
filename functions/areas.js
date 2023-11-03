const functions = require("firebase-functions");
const { Pool } = require("pg");
const axios = require("axios");

const { db } = require("./util");
const { defineString } = require("firebase-functions/params");


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
 * @param {number} id The ID of the polygon.
 * @param {PoolClient} client The database client to use.
 * @returns {Object} The GeoJSON representation of the polygon.
 */
async function fetchPolygonFromDatabase(client, id) {
    const query = "SELECT ST_AsGeoJSON(geom) AS geojson FROM project_areas WHERE area_uuid = $1";

    try {
        const result = await client.query(query, [id]);
        if (result.rows.length === 0) {
            return null;
        }

        return JSON.parse(result.rows[0].geojson);
    } catch (error) {
        throw new Error("Database query failed: " + error.message);
    }
}

/**
 * Fetches data from EarthMap API.
 * @param {string} earthMapApiKey The EarthMap API key.
 * @param {Object} polygon The polygon to fetch data for.
 * @param {string} stats The statistics to fetch.
 * @returns {Promise<any>}
 */
async function fetchData(earthMapApiKey, polygon, stats) {
    try {
        const response = await axios.post("https://dev.earthmap.org/api/statistics", {
            id: stats,
            feature: {
                type: "Feature",
                geometry: polygon
            }
        }, {
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
    .onCall(async ({ polygonId, stats }, context) => {
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
            const result = await fetchData(earthMapApiKey.value(), polygon, stats);
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
//             .filter(uuid => uuid && validUUIDPattern.test(uuid)); // Ensure truthy and valid UUIDs

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

// Periodically delete dangling project_areas records from the PostgreSQL database
exports.deleteDanglingAreaRecords = functions
    // .runWith({ secrets: [dbUser, dbHost, dbDatabase, dbPassword] })
    .pubsub.schedule("0 0 * * *")
    .onRun(async (context) => {
        functions.logger.info("Deleting dangling areas from postgres db...");

        // get all the area uuids from the areas collection in firestore
        const areasSnapshot = await db.collection("areas").get();
        const validUUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/;
        const areaUuids = areasSnapshot.docs
            .flatMap(doc => doc.data().areas) // Use flatMap to flatten the array while mapping
            .filter(area => ["upload", "draw"].includes(Object.keys(area)[0])) // Only keep objects with "upload" or "draw" keys
            .map(area => (Object.values(area)[0] || {}).uuid) // Extract the UUID from the object value
            .filter(uuid => uuid && validUUIDPattern.test(uuid)); // Ensure truthy and valid UUIDs

        const client = await getDatabaseClient({
            user: dbUser.value(),
            host: dbHost.value(),
            database: dbDatabase.value(),
            password: dbPassword.value()
        });

        try {
            // Delete all project_areas records that are not in the areaUuids array
            const deleteQuery = `
            DELETE FROM project_areas
            WHERE area_uuid != ALL($1::uuid[])
            AND created_at < NOW() - INTERVAL '14 days';`;
            const deleteResult = await client.query(deleteQuery, [areaUuids]);

            const deletedRowCount = deleteResult.rowCount;
            if (deletedRowCount === 0) {
                functions.logger.info("No areas to delete from postgres db.");
            } else {
                functions.logger.info(`Deleted ${deletedRowCount} areas from postgres db.`);
            }
        } catch (error) {
            functions.logger.error("Error deleting areas from postgres:", error);
            throw new Error("Error deleting areas from postgres: " + error.message);
        } finally {
            client.release();
        }
    });

