const functions = require("firebase-functions");
const admin = require("firebase-admin");

const { Timestamp, FieldValue } = require("firebase-admin/firestore");
const { defineString } = require("firebase-functions/params");

const db = admin.firestore();

const util = require("./util");

// import { getDatabaseClient } from "./db";

const { getDatabaseClient } = require("./dbPool");

const { getStorage } = require('firebase-admin/storage');

// const dbUser = defineString("DB_USER");
// const dbHost = defineString("DB_HOST");
// const dbDatabase = defineString("DB_DATABASE");
// const dbPassword = defineString("DB_PASSWORD");

const dbUser = 'ferm'
const dbHost = 'localhost'
const dbDatabase = 'ferm_dump'
const dbPassword = 'ferm'


exports.createFirestoreVersion = async function (projectId, projectDoc, transaction) {
    // get the bestPractices subcollection from the project document
    const bestPracticesRef = await util.registryCollection.doc(projectId).collection("bestPractices").get();
    // get the area document from the areas collection
    const areaSnapshot = await db.collection("areas").doc(projectId).get();
    // get the current version number from the projectVersion/<projectId>/<version_id> biggest version_id
    const projectVersionsRef = db.collection("projectVersions").doc(projectId).collection("versions");

    const projectVersionsSnapshot = await transaction.get(projectVersionsRef);
    let versionId = 1;
    if (!projectVersionsSnapshot.empty) {
        versionId = projectVersionsSnapshot.docs.map(doc => +doc.id).reduce((a, b) => Math.max(a, b)) + 1;
    }

    // copy the project document to the projectVersions collection
    const projectVersionRef = db.collection("projectVersions").doc(projectId).collection("versions").doc(versionId.toString());
    transaction.set(projectVersionRef, projectDoc);

    // copy bestPractices subcollection from the original project document to the versionId document in the projectVersions collection
    bestPracticesRef.forEach((doc) => {
        transaction.set(projectVersionRef.collection("bestPractices").doc(doc.id), doc.data());
    });

    // copy the related areas (they are in the areas collection with the same id as the project id) - there's only one area document per project - we are storing the areas in a subcollection of the project document instead of a separate collection as we do for the current version
    const areas = areaSnapshot.data().areas || [];
    areas.forEach(area => transaction.set(projectVersionRef.collection("areas").doc(), area));

    // now let's copy the related db areas
    // get the uuids from the areas
    const areaUuids = areas.map(area => {
        const areaData = Object.values(area)[0];
        if (areaData && areaData.uuid) {
            return areaData.uuid;
        }
    }).filter(uuid => !!uuid);

    // get all the good practices ids
    const bestPracticeIds = bestPracticesRef.docs.map(doc => doc.id);

    return { versionId, areaUuids, bestPracticeIds };
}

// This functions performs a SQL query to copy all the polygons with the given projectId and uuids into a the versions table (which has the same structure as the main table)
exports.createGeoDbVersion = async function (projectId, uuids, versionId) {
    const client = await getDatabaseClient(dbUser, dbHost, dbDatabase, dbPassword);

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
        throw e;
    }
}

exports.createBucketVersion = async function (versionId, projectId, bestPracticeIds) {
    const [allFiles] = await getStorage().bucket().getFiles({
        prefix: `${projectId}/`
    });

    const dstBucket = getStorage().bucket('fao-ferm-project-versions');

    allFiles.forEach(file => {
        const srcFilename = file.name.replace(`${projectId}/`, '');
        const dstFilename = `${projectId}/${versionId}/project/${srcFilename}`;
        const dstFile = dstBucket.file(dstFilename);

        // If the file is already a versioned (it's in the versions folder) we skip it
        // if (file.name.startsWith(`${projectId}/versions/`)) {
        //     return;
        // }

        file.copy(dstFile).then(() => {
            console.log(`gs://${file.bucket.name}/${file.name} copied to gs://${dstFile.bucket.name}/${dstFile.name}`);
        });
    });

    bestPracticeIds.forEach(bestPracticeId => {
        const [files] = await getStorage().bucket('fao-ferm-good-practices').getFiles({
            prefix: `${bestPracticeId}/`
        });

        files.forEach(file => {
            const srcFilename = file.name.replace(`${bestPracticeId}/`, '');
            const dstFilename = `${projectId}/${versionId}/goodPractices/${bestPracticeId}/${srcFilename}`;
            const dstFile = dstBucket.file(dstFilename);

            file.copy(dstFile).then(() => {
                console.log(`gs://${file.bucket.name}/${file.name} copied to gs://${dstFile.bucket.name}/${dstFile.name}`);
            });
        });
    }


    // // list all the files from the source bucket folder
    // const bucket = getStorage().bucket();
    // console.log('projectId', projectId)
    // const sourceFolder = `${projectId}/`;
    // const [files] = await bucket.getFiles({ prefix: sourceFolder });
    // console.log("Files:");
    // files.forEach(file => {
    //     console.log(file.name);
    // });
}

exports.createNewProjectVersion = functions.https.onCall(async ({ projectId }, context) => {
    // check if the user is authenticated
    if (!context.auth) {
        throw new functions.https.HttpsError("unauthenticated", "User is not authenticated");
    }

    // check arguments
    if (!projectId) {
        throw new functions.https.HttpsError("invalid-argument", "Missing arguments");
    }

    return db.runTransaction(async (transaction) => {
        // get the project document from Firestore
        const projectRef = await util.registryCollection.doc(projectId).get();
        // check that the project exists
        if (!projectRef.exists) {
            throw new functions.https.HttpsError("not-found", "Project not found");
        }
        // get the project document data
        const project = projectRef.data();

        // check that the project status is 'public' - only public projects can be versioned
        if (project.status && project.status !== "public") {
            throw new functions.https.HttpsError("invalid-argument", "Project status must be \"public\"");
        }

        const isAdmin = util.isGroupAdmin(context, project);
        const isAuthorAndEditor = util.isGroupEditor(context, project) && project.created_by === context.auth.uid;
        const authorized = util.isSuperAdmin(context) || isAdmin || isAuthorAndEditor;
        if (!authorized) {
            throw new functions.https.HttpsError("permission-denied", "User is not a super admin, nor a group admin, nor a group editor and owner of the project");
        }

        const { areaUuids, versionId } = await createFirestoreVersion(projectId, project, transaction);

        // now let's copy the related db areas
        await createGeoDbVersion(projectId, areaUuids, versionId);

        // now let's copy the related files
        // await createBucketVersion(projectId, versionId);

        return { versionId };
    });
});