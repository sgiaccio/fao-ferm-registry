const { db } = require('./firebaseAdmin');

async function updateDocuments() {
    const snapshot = await db.collection('registry').get();
    const updatePromises = [];

    snapshot.forEach((doc) => {
        const docData = doc.data();

        const docUpdate = {};

        const startingDate = docData.project.startingDate;
        const endingDate = docData.project.endingDate;
        if (startingDate) {
            const startingYear = startingDate.slice(0, 4);
            // Throw an exception if the starting year is not a 4 digits number
            if (isNaN(startingYear) || startingYear.length !== 4) {
                throw new Error(`Starting year is not a 4 digits number: ${startingYear} - doc id: ${doc.id}`);
            }
            docUpdate['project.startingYear'] = startingYear;
            // docUpdate['project.startingDate'] = db.FieldValue.delete();
        }
        if (endingDate) {
            const endingYear = endingDate.slice(0, 4);
            // Throw an exception if the ending year is not a 4 digits number
            if (isNaN(endingYear) || endingYear.length !== 4) {
                throw new Error(`Ending year is not a 4 digits number: ${endingYear} - doc id: ${doc.id}`);
            }
            docUpdate['project.endingYear'] = endingYear;
            // docUpdate['project.endingDate'] = db.FieldValue.delete();
        }

        if (Object.keys(docUpdate).length > 0) {
            const updatePromise = db.collection('registry').doc(doc.id).update(docUpdate);
            updatePromises.push(updatePromise);
        }
    });

    await Promise.all(updatePromises);

    console.log("All documents successfully updated!");
}

updateDocuments().catch(console.error);
