const functions = require("firebase-functions");
const { getStorage } = require('firebase-admin/storage');


exports.makeCoverPhoto = functions.https.onCall(async ({ projectId, filePath }, context) => {
    // copy the photo from the path in a subfolder called thumbnail - rename the file to 'thumbnail' with the same extension
    const bucket = getStorage().bucket();
    const file = bucket.file(filePath);

    const metadata = await file.getMetadata();
    const contentType = metadata[0].contentType;

    const destination = bucket.file(`${projectId}/images/cover_photo/cover.${file.name.split('.').pop()}`);
    await file.copy(destination, {
        contentType,
        metadata: {
            originalName: file.name
        }
    });

    // await destination.makePublic();
    return { success: true };
});
