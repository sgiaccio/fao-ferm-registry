const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { firestore } = require('firebase-admin');
const { defineString } = require('firebase-functions/params');
const { getStorage } = require('firebase-admin/storage');
const { logger } = require('firebase-functions');
const { validate } = require('uuid');
const { getDatabaseClient } = require('./dbPool');
const { isSuperAdmin } = require('./util');
const axios = require('axios');
const { Readable } = require('stream');

// Config params instead of secrets
const dbUser = defineString('DB_USER');
const dbHost = defineString('DB_HOST');
const dbDatabase = defineString('DB_DATABASE');
const dbPassword = defineString('DB_PASSWORD');

/**
 * Fetches translations from Tolgee API
 * @param {string} key Translation key
 * @param {string} locale Locale code (default: 'en')
 * @returns {Promise<Object>} Translations object
 */
async function getTranslationsFromTolgee(key, locale = 'en') {
    try {
        const response = await axios.get(
            `https://cdn.tolg.ee/fa9930d246d28584262908e4edbb5568/${locale}.json`,
        );
        return response.data;
    } catch (error) {
        throw error;
    }
}

/**
 *
 * @param {Object} translations
 * @param {string} menu
 * @param {string | number} id
 * @returns
 */
function getTranslation(translations, menu, id) {
    if (!id) {
        return null;
    }
    const pattern = new RegExp(`^${menu}.*${id}$`);
    const translation = Object.entries(translations).find(([key]) =>
        pattern.test(key),
    )?.[1];

    if (translation) {
        return translation;
    } else {
        return id;
    }
}

/**
 *
 * @param {Object} translations
 * @param {string} menu
 * @param {string | number} id
 * @returns
 */
function getTranslatedList(translations, menu, keys) {
    return keys?.map((key) => getTranslation(translations, menu, key)) ?? [];
}

// function checkLeadEntity(project) {
//     const organizations = project.project.organizations;
//     return (
//         organizations?.length > 0 &&
//         organizations.some((o) => {
//             const v = Object.values(o)[0];
//             if (!v) return false;
//             // check that the object is not empty
//             return Object.keys(v).length > 0;
//         })
//     );
// }

function getLeadEntities(project) {
    const organizations = project.projec?.organizations ?? [];
    return organizations
        .map((o) => Object.values(o)[0])
        .filter((o) => +o.role === 1) // lead entities
        .map((o) => `${o.acronym} ${o.name}`)
        .join('; ');
}

/**
 * Creates a GeoJSON feature for a given row and streams it
 * @param {Object} row Database query result row
 * @param {Map<string, Object>} uuidToProject Map of UUIDs to project data
 * @param {Map<string, Object>} uuidToArea Map of UUIDs to area data
 * @param {Object} translations Translations object
 * @returns {Object} GeoJSON Feature
 */
function createFeature(row, uuidToProject, uuidToArea, translations) {
    const uuid = row.area_uuid;
    const project = uuidToProject.get(uuid);
    const area = uuidToArea.get(uuid);

    const properties = {
        uuid,
        projectId: row.project_id,
        status: project.status,
        projectTitle: project.project.title,
        initiativeUrl: `https://ferm.fao.org/search/initiatives/${row.project_id}`,
        targetArea: project.project?.targetArea
            ? project.project?.targetArea + ' ' + project.project?.areaUnits ||
              ''
            : 'N/A',
        areaUnderRestoration: project.project?.areaUnderRestoration
            ? project.project?.areaUnderRestoration +
              ' ' +
              project.project?.areaUnits
            : 'N/A',
        ecosystems: getTranslatedList(
            translations,
            'iucnEcosystems',
            area.ecosystems,
        ).join(';'),
        restorationStatus: getTranslation(
            translations,
            'restorationStatuses',
            project.project?.restorationStatus,
        ),
        restorationTypes: getTranslatedList(
            translations,
            'restorationTypes',
            project.project?.restorationTypes,
        ).join(';'),
        projectObjectives: getTranslatedList(
            translations,
            'projectObjectives',
            project.project?.objectives,
        ).join(';'),
        biophysicalActivities:
            getTranslatedList(
                translations,
                'activities.Biophysical',
                area.activities,
            )
                // filter out activities that have not been resolved
                .filter((a) => !Number.isFinite(Number(a)))
                .join(';') || null,
        enablingActivities:
            getTranslatedList(
                translations,
                'activities.Enabling',
                area.activities,
            )
                // filter out activities that have not been resolved
                .filter((a) => !Number.isFinite(Number(a)))
                .join(';') || null,
        tenureStatus:
            getTranslatedList(
                translations,
                'tenureStatuses',
                project.project?.tenureStatuses,
            ).join(';') || null,
        startYear: project.project.startingYear,
        endYear: project.project.endingYear,
        countries: project.project.countries?.join(', ') || null,
        targetAreaCI1: null,
        targetAreaCI2: null,
        targetAreaCI3: null,
        targetAreaCI4: null,
        targetAreaCI5: null,
        targetAreaCI2LDCF: null,
        leadEntities: getLeadEntities(project.project),
    };

    if (project.reportingLine === 'GEF') {
        properties.targetArea = project.project.targetAreaCoreIndicator3;
        properties.targetAreaCI1 = project.project.targetAreaCoreIndicator1;
        properties.targetAreaCI2 = project.project.targetAreaCoreIndicator2;
        properties.targetAreaCI3 = project.project.targetAreaCoreIndicator3;
        properties.targetAreaCI4 = project.project.targetAreaCoreIndicator4;
        properties.targetAreaCI5 = project.project.targetAreaCoreIndicator5;
        properties.targetAreaCI2LDCF =
            project.project.targetAreaCoreIndicator2LDCF;
    }

    return {
        type: 'Feature',
        geometry: JSON.parse(row.geojson),
        properties,
    };
}

/**
 * Stream GeoJSON directly to Cloud Storage
 */
async function streamGeoJSONToStorage(
    rows,
    uuidToProject,
    uuidToArea,
    bucketName,
    filename,
) {
    // Get the translations once before streaming
    const translations = await getTranslationsFromTolgee('public_polygons');

    return new Promise((resolve, reject) => {
        // Get reference to the Cloud Storage bucket and file
        const bucket = getStorage().bucket(bucketName);
        const file = bucket.file(filename);

        // Create a write stream to the file
        const uploadStream = file.createWriteStream({
            metadata: {
                contentType: 'application/geo+json',
                contentDisposition: `attachment; filename="${filename}"`,
            },
            resumable: true,
        });

        // Handle errors
        uploadStream.on('error', (error) => {
            logger.error('Error uploading to Cloud Storage:', error);
            reject(error);
        });

        // Handle completion
        uploadStream.on('finish', async () => {
            logger.info(`Successfully uploaded ${filename} to Cloud Storage`);

            // Use public URL for public bucket
            const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

            resolve({
                success: true,
                filename: filename,
                downloadUrl: publicUrl,
                features: rows.length,
            });
        });

        // Start the JSON object
        uploadStream.write('{\n');
        uploadStream.write('  "type": "FeatureCollection",\n');
        uploadStream.write('  "features": [\n');

        // Process rows and write features
        let isFirst = true;

        // Function to process rows in batches
        const processRowsBatch = async (startIdx, batchSize) => {
            // Process a batch of rows
            for (
                let i = startIdx;
                i < Math.min(startIdx + batchSize, rows.length);
                i++
            ) {
                const row = rows[i];
                const feature = createFeature(
                    row,
                    uuidToProject,
                    uuidToArea,
                    translations,
                );

                // Add comma before all features except the first one
                if (!isFirst) {
                    uploadStream.write(',\n');
                } else {
                    isFirst = false;
                }

                // Write the feature as JSON
                uploadStream.write(JSON.stringify(feature, null, 2));
            }

            // If we've processed all rows, finish the JSON and end the stream
            if (startIdx + batchSize >= rows.length) {
                uploadStream.write('\n  ]\n}');
                uploadStream.end();
                logger.info('Completed writing all features to Cloud Storage');
            } else {
                // Process the next batch
                setTimeout(() => {
                    processRowsBatch(startIdx + batchSize, batchSize);
                }, 0); // Using setTimeout to avoid call stack issues with large datasets
            }
        };

        // Start processing with the first batch
        processRowsBatch(0, 100); // Process 100 rows at a time
    });
}

/**
 * Export all public polygons from PostGIS to a GeoJSON file
 */
exports.exportPublicPolygons = onCall(
    {
        region: 'europe-west3',
        timeoutSeconds: 540,
        memory: '512MiB',
        // memory: '2GiB',
    },
    async (request) => {
        const { auth } = request;
        let client = null;

        // Check if the user is authenticated
        if (!auth) {
            throw new HttpsError(
                'unauthenticated',
                'User is not authenticated',
            );
        }

        // Check if the user is a superadmin - only superadmins can export public polygons
        if (!isSuperAdmin({ auth })) {
            throw new HttpsError(
                'permission-denied',
                'User is not a superadmin',
            );
        }

        try {
            logger.info('Starting polygon export process');

            // Get all document IDs from the registry collection
            const { areaUuids, uuidToProject, uuidToArea } = await getAreas();

            // Check if running in emulator
            // const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

            const user = String(dbUser.value());
            const host = String(dbHost.value());
            const database = String(dbDatabase.value());
            const password = String(dbPassword.value());

            // Connect to the database with appropriate credentials
            logger.info(
                `Connecting to database: ${host}/${database} as ${user}`,
            );
            client = await getDatabaseClient(user, host, database, password);

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
                    return (
                        typeof uuid === 'string' &&
                        validate(uuid) &&
                        uuid !== '3d16eef6-6fbd-11ed-8ae5-ed450f029898'
                    );
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
                throw new HttpsError(
                    'not-found',
                    'No polygons found for the specified UUIDs',
                );
            }

            // Stream the GeoJSON directly to Cloud Storage
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = `public_polygons_${timestamp}.geojson`;
            const bucketName = 'fao-ferm-earthmap-export';

            // Stream the GeoJSON directly to Cloud Storage
            return await streamGeoJSONToStorage(
                allResults,
                uuidToProject,
                uuidToArea,
                bucketName,
                filename,
            );
        } catch (error) {
            logger.error('Error exporting polygons:', error);
            throw new HttpsError(
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
    },
);

/**
 * Retrieves areas from the Firestore database.
 * @returns {Promise<{areaUuids: string[], uuidToProject: Map<string, Object>, uuidToArea: Map<string, Object>}>}
 */
async function getAreas() {
    const projectSnapshot = await firestore()
        .collection('registry')
        // .limit(100)
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
            logger.info(`No area document found for project ${projectId}`);
            continue;
        }

        const areaData = areaDoc.data();
        if (!areaData) {
            logger.info(`No area data found for project ${projectId}`);
            continue;
        }

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
        throw new HttpsError('not-found', 'No area UUIDs found');
    }

    logger.info(`Found ${areaUuids.length} area UUIDs`);
    return { areaUuids, uuidToProject, uuidToArea };
}
