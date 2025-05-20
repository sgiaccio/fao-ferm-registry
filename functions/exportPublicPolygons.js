const functions = require('firebase-functions');
const { firestore } = require('firebase-admin');
const { getStorage } = require('firebase-admin/storage');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { logger } = require('firebase-functions');
const { getDatabaseClient } = require('./dbPool');
const { defineString } = require('firebase-functions/params');
const { isSuperAdmin } = require('./util');

// Config params instead of secrets
const dbUser = defineString('DB_USER');
const dbHost = defineString('DB_HOST');
const dbDatabase = defineString('DB_DATABASE');
const dbPassword = defineString('DB_PASSWORD');

const { validate: isUuid } = require('uuid');

/**
 * Merge polygons with the same UUID
 * @param {Array<Object>} rows Database query results
 * @param {Map<string, string>} uuidToProject Map of UUIDs to project names
 * @param {Map<string, string>} uuidToArea Map of UUIDs to area names
 * @returns {Object} GeoJSON FeatureCollection
 */
function createGeoJSON(rows, uuidToProject, uuidToArea) {
    logger.info('-------------------------');
    logger.info(uuidToProject);

    // Create a GeoJSON feature collection
    const featureCollection = {
        type: 'FeatureCollection',
        features: [],
    };

    // Add each polygon as a feature
    rows.forEach((row) => {
        const uuid = row.area_uuid;
        const project = uuidToProject.get(uuid);

        const feature = {
            type: 'Feature',
            geometry: JSON.parse(row.geojson),
            properties: {
                uuid,
                projectId: row.project_id,
                projectTitle: project.project.title,
                status: project.status,
                startYear: project.project.startingYear,
                endYear: project.project.endingYear,
                targetArea: project.project.targetArea,
                countries: project.project.countries?.join(', ') || null,
                restorationTypes:
                    project.project.restorationTypes?.join(', ') || null,

                // project: uuidToProject.get(row.area_uuid),
                // area: uuidToArea.get(row.area_uuid)
            },
        };
        featureCollection.features.push(feature);
    });

    return featureCollection;
}

/**
 * Export all public polygons from PostGIS to a GeoJSON file
 */
exports.exportPublicPolygons = functions
    .region('europe-west3')
    .runWith({
        timeoutSeconds: 540, // 9 minutes
        memory: '2GB',
    })
    .https.onCall(async (data, context) => {
        let client = null;

        // Check if the user is authenticated
        if (!context.auth) {
            throw new functions.https.HttpsError(
                'unauthenticated',
                'User is not authenticated',
            );
        }

        // Check if the user is a superadmin - only superadmins can export public polygons
        if (!isSuperAdmin(context)) {
            throw new functions.https.HttpsError(
                'permission-denied',
                'User is not a superadmin',
            );
        }

        try {
            logger.info('Starting polygon export process');

            const user = String(dbUser.value());
            const host = String(dbHost.value());
            const database = String(dbDatabase.value());
            const password = String(dbPassword.value());

            client = await getDatabaseClient(user, host, database, password);

            // Get all document IDs from the registry collection
            const projectSnapshot = await firestore()
                .collection('registry')
                .get();
            // const projectIds = projectSnapshot.docs.map(doc => doc.id);
            const projects = projectSnapshot.docs;

            logger.info(`Found ${projects.length} projects in registry`);

            const uuidToProject = new Map();
            const uuidToArea = new Map();

            // Collect UUIDs from the areas collection
            const areaUuids = [];

            for (const project of projectSnapshot.docs) {
                const projectDoc = project.data();
                const projectId = project.id;

                const areaDoc = await firestore()
                    .collection('areas')
                    .doc(projectId)
                    .get();

                if (!areaDoc.exists) {
                    logger.info(
                        `No area document found for project ${projectId}`,
                    );
                    continue;
                }

                const areaData = areaDoc.data();

                if (!areaData.areas || !Array.isArray(areaData.areas)) {
                    logger.info(
                        `No areas array in area document for project ${projectId}`,
                    );
                    continue;
                }

                // Extract UUIDs from the areas
                for (const areaObj of areaData.areas) {
                    const area = Object.values(areaObj)[0]; // Get the first value from the area object

                    if (area && area.uuid) {
                        uuidToArea.set(area.uuid, area);
                        uuidToProject.set(area.uuid, projectDoc);
                        areaUuids.push(area.uuid);
                    }
                }
            }

            if (areaUuids.length === 0) {
                logger.info('No area UUIDs found');
                throw new functions.https.HttpsError(
                    'not-found',
                    'No area UUIDs found',
                );
            }

            logger.info(`Found ${areaUuids.length} area UUIDs`);

            // Check if running in emulator
            const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

            // Connect to the database with appropriate credentials
            // Get database parameters - ensure all values are strings
            logger.info(
                `Connecting to database: ${host}/${database} as ${user}`,
            );

            // Process UUIDs in chunks to avoid query size limitations
            const CHUNK_SIZE = 1000; // Process 1000 UUIDs at a time
            let allResults = [];

            // Split UUIDs into chunks
            for (let i = 0; i < areaUuids.length; i += CHUNK_SIZE) {
                logger.info(
                    `Processing UUID chunk ${Math.floor(i / CHUNK_SIZE) + 1} of ${Math.ceil(areaUuids.length / CHUNK_SIZE)}`,
                );

                const uuidChunk = areaUuids.slice(i, i + CHUNK_SIZE);

                // Validate UUIDs before sending to database
                const validUuids = uuidChunk.filter((uuid) => {
                    return typeof uuid === 'string' && isUuid(uuid);
                });
                if (validUuids.length === 0) {
                    logger.info(
                        `No valid UUIDs found in chunk of ${uuidChunk.length}, skipping`,
                    );
                    continue;
                }

                logger.info(
                    `Found ${validUuids.length} valid UUIDs out of ${uuidChunk.length} in this chunk`,
                );

                // Create VALUES array for CTE
                const valuesArray = validUuids.map(
                    (uuid) => `('${uuid.toString()}'::uuid)`,
                );
                const valuesClause = valuesArray.join(', ');

                // Use CTE for better performance with large datasets
                const query = `
            WITH uuid_list(uuid) AS (
                VALUES ${valuesClause}
            )
            SELECT
                pa.area_uuid,
                pa.project_id,
                ST_AsGeoJSON(ST_CollectionExtract(ST_Collect(ST_CollectionExtract(pa.geom::geometry)))) AS geojson
            FROM
                project_areas pa
            JOIN
                uuid_list ul ON pa.area_uuid = ul.uuid
            GROUP BY
                pa.area_uuid,
                pa.project_id
            `;

                const chunkResult = await client.query(query);
                logger.info(
                    `Found ${chunkResult.rows.length} rows in database from chunk of ${uuidChunk.length} UUIDs`,
                );

                // Add results from this chunk to our collection
                allResults = allResults.concat(chunkResult.rows);
            }

            logger.info(
                `Total: found ${allResults.length} rows in database from ${areaUuids.length} unique UUIDs`,
            );

            if (allResults.length === 0) {
                throw new functions.https.HttpsError(
                    'not-found',
                    'No polygons found for the specified UUIDs',
                );
            }

            // Create GeoJSON from the results
            const geoJson = createGeoJSON(
                allResults,
                uuidToProject,
                uuidToArea,
            );

            // Generate timestamp for the filename
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `public_polygons_${timestamp}.geojson`;

            // Create a temp file
            const tempFilePath = path.join(os.tmpdir(), filename);

            // Write the GeoJSON to the temp file
            fs.writeFileSync(tempFilePath, JSON.stringify(geoJson, null, 2));

            // Get a reference to the storage bucket
            const bucket = getStorage().bucket('fao-ferm-polygon-exports');

            // Upload the file to Cloud Storage
            await bucket.upload(tempFilePath, {
                destination: filename,
                metadata: {
                    contentType: 'application/geo+json',
                },
            });

            // Get a signed URL that expires in 1 hour (3600 seconds)
            const [url] = await bucket.file(filename).getSignedUrl({
                action: 'read',
                expires: Date.now() + 3600 * 1000, // 1 hour
            });

            // Clean up the temp file
            fs.unlinkSync(tempFilePath);

            // Return a download URL instead of the full GeoJSON object
            return {
                success: true,
                filename: filename,
                downloadUrl: url,
                features: geoJson.features.length,
            };
        } catch (error) {
            logger.error('Error exporting polygons:', error);
            throw new functions.https.HttpsError(
                'internal',
                `Error exporting polygons: ${error.message}`,
                error,
            );
        } finally {
            // Release the database client
            if (client) {
                client.release();
            }
        }
    });
