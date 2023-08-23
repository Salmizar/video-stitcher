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
