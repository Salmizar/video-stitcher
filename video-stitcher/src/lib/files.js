export default function uploadFile(file, url, progressCallBack) {
    return new Promise((resolve, reject) => {
        const formData = new FormData();
        formData.append('file', file);
        const xhr = new XMLHttpRequest();
        xhr.addEventListener('load', () => {
            resolve(xhr.responseText);
        });
        xhr.upload.onprogress = progressCallBack;
        xhr.addEventListener('error', (error) => {
            reject(error);
        });
        xhr.open('POST', url);
        xhr.send(formData);
    })
}