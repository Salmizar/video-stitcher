import axios from 'axios';

export default function api_get(url, params) {
	return new Promise((resolve, reject) => {
		axios
			.get(url, { withCredentials: true, params: params || {} })
			.then((response) => {
				if (response.status === 200) {
					resolve(response.data);
				}
			})
			.catch((error) => {
				if (error.response.status === 401) {
					reject(error);
				}
			});
	});
}

export async function api_stream_get(url, params, progressCallback) {
		let configuredParams = new URLSearchParams(params);
		const response = await fetch(url +'?'+ configuredParams);
		const reader = response.body.getReader();
		const decoder = new TextDecoder();
		const progress = [];
		(async function read() {
			const { done, value } = await reader.read();
			const chunk = decoder.decode(value, { stream: true });
			if (chunk!='') {
				progress.push(chunk);//end of stream will be an empty
			}
			progressCallback(progress,done);
			if (done) {
				return '';
			}
			return read();
		})();
}