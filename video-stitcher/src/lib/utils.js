export default function convertTime(seconds) {
	let min = Math.floor(seconds / 60);
    if (String(min).length===1) {
        min= '0'+min;
    }
    let sec = Math.floor(seconds - min * 60);
    if (String(sec).length===1) {
        sec= '0'+sec;
    }
	return min + ':' + sec;
}