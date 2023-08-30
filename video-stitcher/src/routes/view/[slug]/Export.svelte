<script>
	import { scale } from "svelte/transition";
	import { api_stream_get } from '$lib/dal';
	import { page } from '$app/stores';
	export let videoWidth;
	export let videoHeight;
	export let video1;
	export let video2;
	export let processingVideo;
	const api_url = import.meta.env.VITE_API_URL;
	const sessionId = $page.params.slug;
	const processVideo = () => {
		processingVideo = 1;
		let params = {
			width: videoWidth,
			height: videoHeight,
			v1start:video1.trimStart,
			v1end:video1.duration-video1.trimStart-video1.trimEnd,
			v1filename: video1.fileName,
			v2start:video2.trimStart,
			v2end:video2.duration-video2.trimStart-video2.trimEnd,
			v2filename: video2.fileName
		};
		api_stream_get(api_url + '/export/' + sessionId, params, progressCallback);
	}
	const progressCallback = (progress) => {
		let step = progress[progress.length-1];
		if (processingVideo>0) {
			if (step.indexOf('error')>-1) {
				alert('An error ocurred processing the video. Please try again.')
				processingVideo = 0;	
			}	else {
				processingVideo = progress.length;
			}
		}
	}
</script>
<div class="export-options">
	{#if processingVideo===0}
		<div in:scale out:scale class="export-info" title="Output size and format">{videoWidth} x {videoHeight} (MP4)</div>
	{/if}
	<button title="Export Video" on:click={processVideo} class="btn btn-blue {processingVideo>0?'btn-processing':''}">{processingVideo>0?'Processing...':'Export'}</button>
</div>

<style>
	.btn {
		max-width: 82px;
		overflow: hidden;
		transition: max-width 0.15s ease 0s;
		@apply font-bold py-2 px-4 rounded;
	}
	.btn-processing {
		max-width: 126px;
	}
	.btn-blue {
		@apply bg-blue-500 text-white;
	}
	.btn-blue:hover {
		@apply bg-blue-700;
	}
	.export-options {
		position: absolute;
		bottom: 10px;
		right: 10px;
		white-space: nowrap;
		padding-left: 7px;
	}
	.export-info {
		cursor: default;
		font-size: 13px;
		float: left;
		margin-top:3px;
		margin-right: 5px;
		padding: 6px;
		padding-bottom: 7px;
		border: 1px solid lightgray;
	}
</style>
