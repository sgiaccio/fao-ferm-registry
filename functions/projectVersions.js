const admin = require("firebase-admin");

const { FieldValue } = require("firebase-admin/firestore");
const { defineString } = require("firebase-functions/params");

const db = admin.firestore();

const { getDatabaseClient } = require("./dbPool");

const { getStorage } = require('firebase-admin/storage');


const dbUser = defineString("DB_USER");
const dbHost = defineString("DB_HOST");
const dbDatabase = defineString("DB_DATABASE");
const dbPassword = defineString("DB_PASSWORD");

const goodPracticesBucket = 'fao-ferm-goodpractices';
const versionsBucket = 'fao-ferm-project-versions';

// This function returns the subcollection of versions for a project
function getVersionsSubcollection(projectId) {
    return db.collection("projectVersions").doc(projectId).collection("versions");
}

/**
 * This function returns the next version id for a project
 * @param {String} projectId - the id of the project
 * @param {Transaction} transaction - the Firestore transaction
 * @returns the next version id for the project
 */
exports.getNewVersionNumber = async function (projectId, transaction) {
    const versionsCollectionRef = getVersionsSubcollection(projectId);
    const projectVersionsSnapshot = await transaction.get(versionsCollectionRef);
    let versionId = 1;
    if (!projectVersionsSnapshot.empty) {
        versionId = projectVersionsSnapshot.docs.map(doc => +doc.id).reduce((a, b) => Math.max(a, b)) + 1;
    }
    return versionId;
}

/**
 * This function creates a new version of a project in Firestore.
 * @param {Object} projectSnapshot - The Firestore document snapshot of the project.
 * @param {Object} bestPracticesSnapshot - The Firestore query snapshot of the best practices subcollection.
 * @param {number} newVersionNumber - The new version number to be assigned to the project.
 * @param {Object} transaction - The Firestore transaction object.
 * @returns {Object} An object containing the versionId, areaUuids, and bestPracticeIds.
 */
exports.createFirestoreVersion = async function (projectSnapshot, bestPracticesSnapshot, newVersionNumber, transaction) {
    try {
        // set the project version in the project version document -  I didn't find a better way to do this, it's a duplicate from publishProject
        const projectData = {
            ...projectSnapshot.data(),
            status: "public",
            publishedTime: FieldValue.serverTimestamp(),
            publishedVersion: newVersionNumber
        };
        const projectId = projectSnapshot.id;

        // copy the project document to the projectVersions collection in a document with the new version id
        const newProjectVersionRef = getVersionsSubcollection(projectId, transaction).doc(newVersionNumber.toString());
        transaction.set(newProjectVersionRef, projectData);

        // set the current project version in the current element of the project version document
        const projectVersionsCollection = db.collection("projectVersions");
        const projectVersionDoc = await projectVersionsCollection.doc(projectId).get();
        let projectVersionData = projectVersionDoc.data();
        projectVersionData = {
            ...projectVersionData,
            versionNumber: newVersionNumber,
            versionDate: FieldValue.serverTimestamp()
        };
        transaction.set(projectVersionsCollection.doc(projectId), projectVersionData);

        // copy bestPractices subcollection from the original project document to the versionId document in the projectVersions collection
        // Best practices are published independently from projects, but it's goot to have a snapshot of the best practices at the time of the project version
        bestPracticesSnapshot.forEach(doc => {
            transaction.set(newProjectVersionRef.collection("bestPractices").doc(doc.id), doc.data());
        });

        // copy the related areas (they are in the areas collection with the same id as the project id) - there's only one area document per project - we are storing the areas in a subcollection of the project document instead of a separate collection as we do for the current version
        // get the area document from the areas collection
        const areaSnapshot = await db.collection("areas").doc(projectId).get();
        const areas = areaSnapshot.data().areas || [];
        areas.forEach(area => transaction.set(newProjectVersionRef.collection("areas").doc(), area));

        // now let's copy the related db areas
        // get the uuids from the areas
        const areaUuids = areas.map(area => {
            const areaData = Object.values(area)[0];
            if (areaData && areaData.uuid) {
                return areaData.uuid;
            }
        }).filter(uuid => !!uuid);

        // get all the good practices ids
        const bestPracticeIds = bestPracticesSnapshot.docs.map(doc => doc.id);

        return { versionId: newVersionNumber, areaUuids, bestPracticeIds };
    } catch (error) {
        console.error('Error creating Firestore version:', error);
        throw error; // Rethrow the error to ensure the transaction fails and rolls back
    }
}

/**
 * This function performs a SQL query to copy all the polygons with the given projectId and uuids into the versions table, which has the same structure as the main table.
 * @param {String} projectId - The ID of the project.
 * @param {Array<String>} uuids - An array of area UUIDs to be copied.
 * @param {Number} versionId - The new version ID to be assigned.
 * @returns {void}
 */
exports.createGeoDbVersion = async function (projectId, uuids, versionId) {
    const client = await getDatabaseClient(dbUser.value(), dbHost.value(), dbDatabase.value(), dbPassword.value());

    try {
        console.log(`Starting to copy polygons for project ${projectId} with version ${versionId}`);

        // Start a transaction
        await client.query('BEGIN');

        // copy the polygons with the given uuids
        const copyQuery = `
            INSERT INTO project_areas_versions (id,  source,  project_id,  area_uuid,  created_at,  confirmed,  bucket_path,  orig_filename,  geom, version)
            SELECT  id,  source,  project_id,  area_uuid,  created_at,  confirmed,  bucket_path,  orig_filename,  geom, $3
            FROM project_areas
            WHERE project_id = $1 AND area_uuid = ANY($2)
        `;
        await client.query(copyQuery, [projectId, uuids, versionId]);

        await client.query("COMMIT");

        console.log(`Successfully copied polygons for project ${projectId} with version ${versionId}`);
    } catch (e) {
        await client.query("ROLLBACK");
        console.error(`Error copying polygons for project ${projectId} with version ${versionId}:`, e);
        throw e;
    } finally {
        client.release();
    }
}

/**
 * This function copies files from the project bucket to the versions bucket.
 * @param {Array} files - Array of files to copy.
 * @param {String} srcPrefix - Source prefix to remove from file names.
 * @param {String} dstPrefix - Destination prefix to add to file names.
 * @param {Object} dstBucket - Destination bucket instance.
 * @returns {Promise<void>} A promise that resolves when all files have been copied.
 */
async function _copyFiles(files, srcPrefix, dstPrefix, dstBucket) {
    try {
        await Promise.all(
            files.map(file => {
                const srcFilename = file.name.replace(`${srcPrefix}/`, '');
                const dstFilename = `${dstPrefix}/${srcFilename}`;
                const dstFile = dstBucket.file(dstFilename);

                return file.copy(dstFile)
                    .then(() => {
                        console.log(`gs://${file.bucket.name}/${file.name} copied to gs://${dstFile.bucket.name}/${dstFile.name}`);
                    })
                    .catch(err => {
                        console.error(`Failed to copy gs://${file.bucket.name}/${file.name} to gs://${dstFile.bucket.name}/${dstFile.name}: ${err.message}`);
                        throw err;
                    });
            })
        );

        console.log(`Successfully copied all files from ${srcPrefix} to ${dstPrefix} in bucket ${dstBucket.name}`);
    } catch (err) {
        console.error(`Failed to copy files from ${srcPrefix} to ${dstPrefix} in bucket ${dstBucket.name}: ${err.message}`);
        throw new Error(`Failed to copy files: ${err.message}`);
    }
}

/**
 * This function deletes all files in the project bucket with the given projectId and versionId.
 * @param {String} projectId - The ID of the project.
 * @param {String} versionId - The version ID of the project.
 * @returns {Promise<void>} A promise that resolves when all files have been deleted.
 */
exports.deleteFiles = async function (projectId, versionId) {
    try {
        const [files] = await getStorage().bucket(versionsBucket).getFiles({
            prefix: `${projectId}/${versionId}`
        });

        await Promise.all(
            files.map(async file => {
                try {
                    await file.delete();
                    console.log(`gs://${file.bucket.name}/${file.name} deleted`);
                } catch (err) {
                    console.error(`Failed to delete gs://${file.bucket.name}/${file.name}: ${err.message}`);
                }
            })
        );
    } catch (err) {
        console.error(`Failed to delete files for project ${projectId} with version ${versionId} in bucket ${versionsBucketName}: ${err.message}`);
        throw new Error(`Failed to delete files: ${err.message}`);
    }
}

/**
* This function creates a new bucket version by copying project and best practice files.
* @param {Number} versionId - The version ID to be created.
* @param {String} projectId - The ID of the project.
* @param {Array} bestPracticeIds - An array of best practice IDs.
*/
exports.createBucketVersion = async function (versionId, projectId, bestPracticeIds) {
    try {
        console.log(`Starting to create bucket version for project ${projectId} with version ${versionId}`);

        const [projectFiles] = await getStorage().bucket().getFiles({
            prefix: `${projectId}/`
        });

        const dstBucket = getStorage().bucket(versionsBucket);

        console.log(`Copying project files for project ${projectId} to version ${versionId}`);
        await _copyFiles(projectFiles, projectId, `${projectId}/${versionId}/project`, dstBucket);

        const bestPracticeFiles = [];
        for (const bestPracticeId of bestPracticeIds) {
            const [files] = await getStorage().bucket(goodPracticesBucket).getFiles({
                prefix: `${bestPracticeId}/`
            });

            bestPracticeFiles.push(...files);
        }

        console.log(`Copying best practice files for project ${projectId} to version ${versionId}`);
        await _copyFiles(bestPracticeFiles, '', `${projectId}/${versionId}/goodPractices`, dstBucket);

        console.log(`Successfully created bucket version for project ${projectId} with version ${versionId}`);
    } catch (e) {
        console.error(`Error creating bucket version for project ${projectId} with version ${versionId}:`, e);
        throw new Error(`Failed to create bucket version: ${e.message}`);
    }
}
