<script>
	import api_get from '$lib/dal';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Controls from './Controls.svelte';
	import Timeline from './Timeline.svelte';
	import Trim from './Trim.svelte';
	import Export from './Export.svelte';
	const api_url = import.meta.env.VITE_API_URL;
	const sessionId = $page.params.slug;
	let videoWidth = 0;
	let videoHeight = 0;
	let video1 = {};
	let video2 = {};
	onMount(() => {
		api_get(api_url + '/' + sessionId)
			.then((videoFileNames) => {
				if (videoFileNames.length > 0) {
					video1 = {
						url: api_url + '/files/' + sessionId + '?filename=' + videoFileNames[0].fileName,
                        thumbnails: videoFileNames.slice(1,videoFileNames.length / 2)
					};
                    console.log('video1',video1);
					video2 = {
						url:
							api_url +
							'/files/' +
							sessionId +
							'?filename=' +
							videoFileNames[videoFileNames.length / 2].fileName,
                            thumbnails: videoFileNames.slice(videoFileNames.length / 2+1)
					};
                    console.log('video2',video2);
				} else {
					alert(`This session doesn't exist`);
					goto('/');
				}
			})
			.catch((error) => {
				console.log('error', error);
				goto('/');
			});
	});
	function videoLoaded(e) {
		if (e.currentTarget.id === 'video1') {
			video1.width = e.currentTarget.videoWidth;
			videoWidth = video1.width;
			video1.height = e.currentTarget.videoHeight;
			videoHeight = video1.height;
			video1.duration = e.currentTarget.duration;
		} else {
			video2.width = e.currentTarget.videoWidth;
			if (videoWidth < video2.width) {
				videoWidth = video2.width;
			}
			video2.height = e.currentTarget.videoHeight;
			if (videoHeight < video2.height) {
				videoHeight = video2.height;
			}
			video2.duration = e.currentTarget.duration;
		}
	}
</script>

<div class="container">
	<header>
		<img alt="Video X Stitcher" width="120" height="30" src="../videoxstitcher.png" />
	</header>
	<main>
		<div class="video-container" style="max-width: {videoWidth}px; max-height: {videoHeight}px;">
			{#if video1.url}
				<video on:loadedmetadata={videoLoaded} id="video1" width={videoWidth} height={videoHeight}>
					<source src={video1.url} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			{/if}
			{#if video2.url}
				<video on:loadedmetadata={videoLoaded} id="video2" width={videoWidth} height={videoHeight}>
					<source src={video2.url} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			{/if}
			{#if video1.url}
				<div class="video-controls" style="top: {videoHeight - 30}px;">
					<Controls  video1={video1} video2={video2} />
				</div>
			{/if}
		</div>
	</main>
	<footer>
        <Timeline video1={video1} video2={video2} />
        <Trim />
        <Export />
    </footer>
</div>

<style>
	:root {
		--footer-height: 175px;
		--header-height: 30px;
	}
	.container {
		position: relative;
		height: 100vh;
	}
	header {
		width: 100vw;
		height: var(--header-height);
		box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
	}
	img {
		position: relative;
		top: -6px;
		left: 5px;
	}
	main {
		position: absolute;
		width: 100vw;
		top: var(--header-height);
		bottom: var(--footer-height);
		border-top: 1px solid #000;
		border-bottom: 1px solid #000;
		box-shadow: 0 -10px 5px -10px rgba(0, 0, 0, 0.4) inset;
	}
	.video-controls {
		position: relative;
	}
	.video-container {
		width: 100%;
		margin: auto;
		position: relative;
		top: calc(50% - 240px);
	}
	.video-container video {
		position: absolute;
		left: 0px;
		top: 0px;
	}
	footer {
		position: absolute;
		bottom: 0px;
		width: 100vw;
		height: var(--footer-height);
	}
</style>
