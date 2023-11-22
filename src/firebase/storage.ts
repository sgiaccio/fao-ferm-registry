/**
 * @fileoverview storage.ts is a file that contains all the functions related to the storage of the firebase project.
 * @packageDocumentation
 * @module storage
 **/

// import { storage } from "./index";

// import { ref, uploadBytesResumable, listAll, getBlob, deleteObject } from "firebase/storage";

// export async function uploadFiles(path: string, files: File[], onProgress: (progress: number) => void) {
//     let totalBytesTransferred = 0;
//     let totalBytes = 0;
//     files.forEach(file => totalBytes += file.size);

//     const lastBytesTransferred: { [key: string]: number } = {};

//     // This will hold the promises for each file upload
//     const uploadPromises = files.map((file) => {
//         return new Promise<void>(async (resolve, reject) => {
//             const storageRef = ref(storage, `${path}/${file.name}`);

//             const uploadTask = uploadBytesResumable(storageRef, file);

//             uploadTask.on("state_changed",
//                 (snapshot) => {
//                     const newBytesTransferred = snapshot.bytesTransferred - (lastBytesTransferred[file.name] || 0);
//                     totalBytesTransferred += newBytesTransferred;
//                     lastBytesTransferred[file.name] = snapshot.bytesTransferred;

//                     const progress = (totalBytesTransferred / totalBytes) * 100;
//                     // console.log("Overall upload is " + progress + "% done");
//                     onProgress(progress);
//                 },
//                 (error) => {
//                     // Handle unsuccessful uploads
//                     console.error("Upload failed:", error);
//                     reject(error);
//                 },
//                 () => {
//                     // Handle successful uploads on complete
//                     // console.log("Upload successful");
//                     resolve();
//                 }
//             );
//         });
//     });

//     // Wait for all files to be uploaded
//     await Promise.all(uploadPromises);
// }

export async function uploadFiles(projectId: string, path: string = '', files: File[], accessToken: string) {
    const uploadPromises = files.map((file) => {
        return new Promise<void>((resolve, reject) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('project_id', projectId);
            formData.append('path', path); // Construct the desired path

            fetch('https://europe-west3-fao-ferm.cloudfunctions.net/upload_project_file', {
                method: 'POST',
                body: formData, // The FormData instance
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    // 'Content-Type': 'multipart/form-data' should not be set manually
                },
            }).then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.text();
            }).then(data => {
                resolve();
            }).catch(error => {
                reject(error);
            });
        });
    });

    await Promise.all(uploadPromises);
}

// export async function listFiles(path: string) {
//     try {
//         const listRef = ref(storage, path);
//         const res = await listAll(listRef);
//         return res.items
//             .map(item => ({ name: item.name, path: item.fullPath }))
//             .sort((a, b) => a.name.localeCompare(b.name));
//     } catch (error) {
//         console.error("List files failed:", error);
//         throw error;
//     }
// }

export async function listFiles(projectId: string, path: string | null, accessToken: string) {
    const url = new URL('https://europe-west3-fao-ferm.cloudfunctions.net/list_document_files');
    url.searchParams.append('project_id', projectId);
    if (path) url.searchParams.append('path', path);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
}

// export async function getFileAsBlob(path: string) {
//     const storageRef = ref(storage, path);
//     return getBlob(storageRef);
// }

export async function getFileAsBlob(projectId: string, path: string, accessToken: string) {
    const url = new URL('https://europe-west3-fao-ferm.cloudfunctions.net/download_document_file');
    url.searchParams.append('project_id', projectId);
    url.searchParams.append('file_path', path);

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const blob = await response.blob();
    return blob;
}


export async function deleteFile(projectId: string, path: string, accessToken: string) {
    const url = new URL('https://europe-west3-fao-ferm.cloudfunctions.net/delete_document_file');
    url.searchParams.append('project_id', projectId);
    url.searchParams.append('file_path', path);

    return fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`,
        },
    }).then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.text();
    // }).then(data => {
    //     console.log(data);
    }).catch(error => {
        console.error("Delete file failed:", error);
        throw error;
    });
    // const storageRef = ref(storage, path);
    // try {
    //     await deleteObject(storageRef);
    // } catch (error) {
    //     console.error("Delete file failed:", error);
    //     throw error;
    // }
}