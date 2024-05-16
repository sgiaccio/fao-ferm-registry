// const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { FieldValue } = require("firebase-admin/firestore");
const { defineString } = require("firebase-functions/params");

const db = admin.firestore();

// const util = require("./util");

const { getDatabaseClient } = require("./dbPool");

const { getStorage } = require('firebase-admin/storage');
// const { version } = require("os");

const dbUser = defineString("DB_USER");
const dbHost = defineString("DB_HOST");
const dbDatabase = defineString("DB_DATABASE");
const dbPassword = defineString("DB_PASSWORD");

// const dbUser = 'ferm'
// const dbHost = 'localhost'
// const dbDatabase = 'ferm_dump'
// const dbPassword = 'ferm'

const goodPracticesBucket = 'fao-ferm-goodpractices';
const versionsBucket = 'fao-ferm-project-versions';

// This function returns the subcollection of versions for a project
function getVersionsSubcollection(projectId) {
    return db.collection("projectVersions").doc(projectId).collection("versions");
}

// This function returns the next version id for a project
exports. getNewVersionNumber = async function(projectId, transaction) {
    const versionsCollectionRef = getVersionsSubcollection(projectId);
    const projectVersionsSnapshot = await transaction.get(versionsCollectionRef);
    let versionId = 1;
    if (!projectVersionsSnapshot.empty) {
        versionId = projectVersionsSnapshot.docs.map(doc => +doc.id).reduce((a, b) => Math.max(a, b)) + 1;
    }
    return versionId;
}

// This function creates a new version of a project in Firestore
exports.createFirestoreVersion = async function (projectSnapshot, bestPracticesSnapshot, newVersionNumber, transaction) {
    // set the project version in the project version document -  I didn't find a better way to do this, it's a duplicate from publishProject
    const projectData = {
        ...projectSnapshot.data(),
        status: "public",
        publishedTime:  FieldValue.serverTimestamp(),
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
}

// This functions performs a SQL query to copy all the polygons with the given projectId and uuids into a the versions table (which has the same structure as the main table)
exports.createGeoDbVersion = async function (projectId, uuids, versionId) {
    const client = await getDatabaseClient(dbUser.value(), dbHost.value(), dbDatabase.value(), dbPassword.value());

    try {
        // copy the polygons with the given uuids
        const copyQuery = `
            INSERT INTO project_areas_versions (id,  source,  project_id,  area_uuid,  created_at,  confirmed,  bucket_path,  orig_filename,  geom, version)
            SELECT  id,  source,  project_id,  area_uuid,  created_at,  confirmed,  bucket_path,  orig_filename,  geom, $3
            FROM project_areas
            WHERE project_id = $1 AND area_uuid = ANY($2)
        `;
        await client.query(copyQuery, [projectId, uuids, versionId]);

        await client.query("COMMIT");
    } catch (e) {
        await client.query("ROLLBACK");
        console.error(e);
        throw e;
    } finally {
        client.release();
    }
}

// This function copies files from the project bucket to the versions bucket
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
                    });
            })
        );
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to copy files: ${err.message}`);
        // files will be deleted in the catch block of the caller
    }
}

// This function deletes all files in the project bucket with the given projectId and versionId
exports.deleteFiles = async function(projectId, versionId) {
    const [files] = await getStorage().bucket(versionsBucket).getFiles({
        prefix: `${projectId}/${versionId}`
    });

    await Promise.all(
        files.map(async file => {
            await file.delete();
            console.log(`gs://${file.bucket.name}/${file.name} deleted`);
        })
    );
}

exports.createBucketVersion = async function (versionId, projectId, bestPracticeIds) {
    try {
        const [projectFiles] = await getStorage().bucket().getFiles({
            prefix: `${projectId}/`
        });

        const dstBucket = getStorage().bucket(versionsBucket);

        await _copyFiles(projectFiles, projectId, `${projectId}/${versionId}/project`, dstBucket);

        const bestPracticeFiles = [];
        for (const bestPracticeId of bestPracticeIds) {
            const [files] = await getStorage().bucket(goodPracticesBucket).getFiles({
                prefix: `${bestPracticeId}/`
            });

            bestPracticeFiles.push(...files);
        }

        await _copyFiles(bestPracticeFiles, '', `${projectId}/${versionId}/goodPractices`, dstBucket);
    } catch (e) {
        console.error(e);
        throw e;
    }
}
