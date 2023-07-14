const { db } = require('./firebaseAdmin');


const moveAreasToSubcollection = async () => {
    // get all documents from 'registry' collection
    const registrySnapshot = await db.collection('registry').get();
    const registryDocs = registrySnapshot.docs;

    for (const doc of registryDocs) {
        const projectId = doc.id;

        // get the related area from 'areas' collection
        const areaSnapshot = await db.collection('areas').doc(projectId).get();
        const areaData = areaSnapshot.data();

        if (areaData && Array.isArray(areaData.areas)) {
            // loop through all areas and create a new document for each one in the subcollection
            for (const area of areaData.areas) {
                // Let Firebase generate a unique document ID.
                await db.collection(`registry/${projectId}/areas`).doc().set(area);
            }

            // delete the document from the 'areas' collection
            // await db.collection('areas').doc(projectId).delete();
        }
    }
}

moveAreasToSubcollection().catch(console.error);
