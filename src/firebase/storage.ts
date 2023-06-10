/**
 * @fileoverview storage.ts is a file that contains all the functions related to the storage of the firebase project.
 * @packageDocumentation
 * @module storage
 **/

import { storage } from "./index";

import { ref, uploadBytesResumable, listAll, getBlob, deleteObject } from "firebase/storage";

export async function uploadFiles(path: string, files: File[], onProgress: (progress: number) => void) {
    let totalBytesTransferred = 0;
    let totalBytes = 0;
    files.forEach(file => totalBytes += file.size);

    const lastBytesTransferred: { [key: string]: number } = {};

    // This will hold the promises for each file upload
    const uploadPromises = files.map((file) => {
        return new Promise<void>(async (resolve, reject) => {
            const storageRef = ref(storage, `${path}/${file.name}`);

            const uploadTask = uploadBytesResumable(storageRef, file);

            uploadTask.on("state_changed",
                (snapshot) => {
                    const newBytesTransferred = snapshot.bytesTransferred - (lastBytesTransferred[file.name] || 0);
                    totalBytesTransferred += newBytesTransferred;
                    lastBytesTransferred[file.name] = snapshot.bytesTransferred;

                    const progress = (totalBytesTransferred / totalBytes) * 100;
                    console.log("Overall upload is " + progress + "% done");
                    onProgress(progress);
                },
                (error) => {
                    // Handle unsuccessful uploads
                    console.error("Upload failed:", error);
                    reject(error);
                },
                () => {
                    // Handle successful uploads on complete
                    console.log("Upload successful");
                    resolve();
                }
            );
        });
    });

    // Wait for all files to be uploaded
    await Promise.all(uploadPromises);
}

export async function listFiles(path: string) {
    try {
        const listRef = ref(storage, path);
        const res = await listAll(listRef);
        return res.items
            .map(item => ({ name:  item.name, path: item.fullPath }))
            .sort((a, b) => a.name.localeCompare(b.name));
    } catch (error) {
        console.error("List files failed:", error);
        throw error;
    }
}

export async function getFileAsBlob(path: string) {
    const storageRef = ref(storage, path);
    return getBlob(storageRef);
}

export async function deleteFile(path: string) {
    const storageRef = ref(storage, path);
    try {
        await deleteObject(storageRef);
    } catch (error) {
        console.error("Delete file failed:", error);
        throw error;
    }
}