/**
 * @fileoverview storage.ts is a file that contains all the functions related to the storage of the firebase project.
 * @packageDocumentation
 * @module storage
 **/

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

export async function uploadFiles(projectId: string, path: string = '', files: File[], accessToken: string, onProgress: (loaded: number, total: number) => void = () => { }, onUploadComplete: () => void = () => { }) {
    const totalSize = files.reduce((acc, file) => acc + file.size, 0);
    let totalLoaded = 0;
    const fileProgressMap = new Map();

    const uploadPromises = files.map(file => {
        return new Promise((resolve, reject) => {
            // using XMLHttpRequest instead of fetch to be able to track upload progress
            // in fact upload progress it not yet used anywhere in the UI - maybe it will be in the future, otherwise fetch could be used
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const previousLoaded = fileProgressMap.get(file) || 0;
                    totalLoaded += event.loaded - previousLoaded;
                    fileProgressMap.set(file, event.loaded);

                    onProgress(totalLoaded, totalSize);
                }
            });

            xhr.open('POST', 'https://europe-west3-fao-ferm.cloudfunctions.net/upload_project_file', true);
            xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

            const formData = new FormData();
            formData.append('file', file);
            formData.append('project_id', projectId);
            formData.append('path', path);

            xhr.onreadystatechange = function () {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        resolve();
                    } else {
                        reject(new Error(`HTTP error! status: ${xhr.status}`));
                    }
                }
            };

            xhr.send(formData);
        });
    });

    await Promise.all(uploadPromises);
    onUploadComplete();
}

// export async function uploadFiles(projectId: string, path: string = '', files: File[], accessToken: string) {
//     const uploadPromises = files.map((file) => {
//         return new Promise<void>((resolve, reject) => {
//             const formData = new FormData();
//             formData.append('file', file);
//             formData.append('project_id', projectId);
//             formData.append('path', path); // Construct the desired path

//             fetch('https://europe-west3-fao-ferm.cloudfunctions.net/upload_project_file', {
//                 method: 'POST',
//                 body: formData,
//                 headers: {
//                     'Authorization': `Bearer ${accessToken}`,
//                 },
//             }).then(response => {
//                 if (!response.ok) {
//                     throw new Error(`HTTP error! status: ${response.status}`);
//                 }
//                 return response.text();
//             }).then(data => {
//                 resolve();
//             }).catch(error => {
//                 reject(error);
//             });
//         });
//     });

//     await Promise.all(uploadPromises);
// }

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

export async function listProjectFiles(projectId: string, path: string | null, accessToken: string) {
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

export function getFileUrl(projectId: string, path: string) {
    const url = new URL('https://europe-west3-fao-ferm.cloudfunctions.net/download_document_file');
    url.searchParams.append('project_id', projectId);
    url.searchParams.append('file_path', path);
    return url.toString();
}

export async function getFileAsBlob(projectId: string, path: string, accessToken: string) {
    const url = getFileUrl(projectId, path);

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

// async function getProjectImagesAsURLs(projectId: string, path: string | null, accessToken: string) {
//     const images = await listProjectImages(projectId, path, accessToken);
//     return images.map(image => getFileUrl(projectId, image.path));
// }

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
