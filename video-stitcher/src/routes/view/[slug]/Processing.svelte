<script>
	import { fade } from 'svelte/transition';
	import { page } from '$app/stores';
	export let processingVideo;
	const api_url = import.meta.env.VITE_API_URL;
	const sessionId = $page.params.slug;
	const totalVideos = 2;
	const downloadVideo = () => {
		console.log('download');
		processingVideo = 0;
		let params = {
			filename: 'output/output.mp4'
		}
		let configuredParams = new URLSearchParams(params);
		window.location.href= api_url + '/files/' + sessionId + '?'+ configuredParams;
	};
</script>

{#if processingVideo > 0}
	<div in:fade out:fade class="processing-video">
		{#if processingVideo < 4}
			<div
				class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] text-neutral-100 motion-reduce:animate-[spin_1.5s_linear_infinite]"
				role="status"
			/>
			<p>
				<b>Processing Videos - Standby</b><br />
				{#if processingVideo <= totalVideos}
					Converting video {processingVideo}
				{:else if processingVideo === totalVideos+1}
					Merging videos together
				{/if}
			</p>
		{:else if processingVideo === totalVideos+2}
			<p>Ready to download</p>
			<button in:fade title="Trim Videos" class="btn btn-blue" on:click={downloadVideo}
				>Download</button
			>
		{/if}
	</div>
{/if}

<style>
	.btn {
		@apply font-bold py-2 px-4 rounded;
	}
	.btn-blue {
		@apply bg-blue-500 text-white;
	}
	.btn-blue:hover {
		@apply bg-blue-700;
	}
	.processing-video p {
		position: absolute;
		cursor: default;
		top: 55%;
		left: 0px;
		right: 0px;
	}
	.processing-video {
		text-align: center;
		color: white;
		position: absolute;
		display: flex;
		align-items: center;
		justify-content: center;
		top: 0px;
		left: 0px;
		z-index: 100;
		width: 100vw;
		height: 100vh;
		background-color: rgba(0, 0, 0, 0.4);
	}
</style>
