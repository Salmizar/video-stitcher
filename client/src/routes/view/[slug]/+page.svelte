<script>
	import api_get from '$lib/dal';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Controls from './Controls.svelte';
	import Timeline from './Timeline.svelte';
	import Trim from './Trim.svelte';
	import Export from './Export.svelte';
	import Processing from './Processing.svelte';
	let videoHeight = 0;
	let videoWidth = 0;
	let maxVideoWidth = 0;
	let maxVideoHeight = 0;
	let paused = true;
	let trimOpened = false;
	let processingVideo = 0;
	let video1 = {
		trim: '',
		active: true,
		trimStart: 0,
		trimEnd: 0
	};
	let video2 = {
		trim: '',
		active: false,
		trimStart: 0,
		trimEnd: 0
	};
	onMount(() => {
		const api_url = import.meta.env.VITE_API_URL;
		const sessionId = $page.params.slug;
		api_get(api_url + '/' + sessionId)
			.then((videoFileNames) => {
				const isSecondVideo = (element, index) =>
					index > 0 && element.fileName.indexOf('png') === -1;
				const video2Index = Array(videoFileNames)[0].findIndex(isSecondVideo);
				if (videoFileNames.length > 0) {
					video1.fileName = videoFileNames[0].fileName;
					video1.url = api_url + '/files/' + sessionId + '?filename=' + videoFileNames[0].fileName;
					video1.thumbnails = videoFileNames.slice(1, video2Index);
					video2.fileName = videoFileNames[video2Index].fileName;
					video2.url =
						api_url + '/files/' + sessionId + '?filename=' + videoFileNames[video2Index].fileName;
					video2.thumbnails = videoFileNames.slice(video2Index + 1);
				} else {
					alert(`This session doesn't exist`);
					goto('/');
				}
			})
			.catch((error) => {
				console.log('error', error);
				goto('/');
			});
		window.addEventListener('resize', resizeVideoContainer);
		return () => {
			window.removeEventListener('resize', resizeVideoContainer);
		};
	});
	const resizeVideoContainer = () => {
		let headerHeight = 30;
		let footerHeight = 175;
		let viewPortWidth = window.innerWidth;
		let viewPortHeight = window.innerHeight - headerHeight - footerHeight;
		maxVideoHeight = Math.round(viewPortHeight > videoHeight ? videoHeight : viewPortHeight);
		maxVideoWidth = Math.round(viewPortWidth > videoWidth ? videoWidth : viewPortWidth);
		let width_scale = viewPortWidth / videoWidth;
		let height_scale = viewPortHeight / videoHeight;
		let lower_scale = width_scale < height_scale ? width_scale : height_scale;
		if (lower_scale < 1) {
			maxVideoHeight = Math.round(videoHeight * lower_scale);
			maxVideoWidth = Math.round(videoWidth * lower_scale);
		}
	};
	const videoLoaded = (e) => {
		if (e.currentTarget.id === 'video1') {
			video1.width = e.currentTarget.videoWidth;
			video1.height = e.currentTarget.videoHeight;
			video1.duration = e.currentTarget.duration;
			video1.target = e.currentTarget;
		} else {
			video2.width = e.currentTarget.videoWidth;
			video2.height = e.currentTarget.videoHeight;
			video2.duration = e.currentTarget.duration;
			video2.target = e.currentTarget;
		}
		if (maxVideoWidth < e.currentTarget.videoWidth) {
			maxVideoWidth = e.currentTarget.videoWidth;
		}
		if (maxVideoHeight < e.currentTarget.videoHeight) {
			maxVideoHeight = e.currentTarget.videoHeight;
		}
		if (video1.duration && video2.duration) {
			const combinedTime = Math.floor(video1.duration + video2.duration);
			video1.percentageOfTotalTime = (Math.floor(video1.duration) / combinedTime) * 100;
			video2.percentageOfTotalTime = (Math.floor(video2.duration) / combinedTime) * 100;
			video1.target.addEventListener('ended', videoEnded);
			video2.target.addEventListener('ended', videoEnded);
			videoWidth = maxVideoWidth;
			videoHeight = maxVideoHeight;
			resizeVideoContainer();
		}
	};
	const focusVideo = (e) => {
		video1.active = e.detail.id === 1;
		video2.active = e.detail.id === 2;
		video1.target.style.display = video1.active ? 'block' : 'none';
		video2.target.style.display = video2.active ? 'block' : 'none';
		if (e.detail.pause) {
			paused = true;
		}
	};
	const togglePlay = () => {
		if (video1.active) {
			if (paused) {
				video1.target.play();
			} else {
				video1.target.pause();
			}
		} else {
			if (paused) {
				video2.target.play();
			} else {
				video2.target.pause();
			}
		}
		paused = !paused;
	};
	const videoEnded = (e) => {
		if (!paused) {
			video1.active = !e.target.id === 'video1';
			video2.active = !video1.active;
			video1.target.style.display = video1.active ? 'block' : 'none';
			video2.target.style.display = video2.active ? 'block' : 'none';
			if (e.target.id === 'video1') {
				video2.target.play();
			} else {
				video1.target.currentTime = video1.trimStart;
				paused = true;
			}
		}
	};
</script>

<div class="app-container">
	<header>
		<a title="Video X Stitcher" href="/">
			<img alt="Video X Stitcher" width="120" height="30" src="../videoxstitcher.png" />
		</a>
	</header>
	<main class={trimOpened ? 'main-trim-opened' : ''}>
		<div
			class="video-container"
			style="height:{videoHeight}px; width:{videoWidth}px; max-height:{maxVideoHeight}px; max-width:{maxVideoWidth}px;"
		>
			{#if video1.url}
				<video style="display:block;" on:loadedmetadata={videoLoaded} id="video1">
					<source src={video1.url} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			{/if}
			{#if video2.url}
				<video style="display:none;" on:loadedmetadata={videoLoaded} id="video2">
					<source src={video2.url} type="video/mp4" />
					Your browser does not support the video tag.
				</video>
			{/if}
			{#if video1.duration && video2.duration}
				<div class="video-controls">
					<Controls
						on:focusVideo={focusVideo}
						on:togglePlay={togglePlay}
						{paused}
						{video1}
						{video2}
					/>
				</div>
			{/if}
		</div>
	</main>
	<footer class={trimOpened ? 'footer-trim-opened' : ''}>
		{#if video1.duration && video2.duration}
			<Timeline on:focusVideo={focusVideo} {video1} {video2} />
			<Trim on:focusVideo={focusVideo} {video1} {video2} bind:trimOpened {processingVideo} />
			<Export {videoWidth} {videoHeight} {video1} {video2} bind:processingVideo />
		{/if}
	</footer>
</div>
<Processing bind:processingVideo />
<style>
	:root {
		--footer-height: 175px;
		--expanded-footer-height: 210px;
		--header-height: 30px;
		--min-width: 200px;
		--min-height: 300px;
	}
	.app-container {
		position: relative;
		height: 100vh;
		min-width: var(--min-width);
	}
	header {
		width: 100%;
		min-width: var(--min-width);
		height: var(--header-height);
		box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.3);
	}
	header a {
		width: 125px;
		display: block;
	}
	img {
		position: relative;
		top: -6px;
		left: 5px;
	}
	main {
		position: absolute;
		width: 100%;
		min-width: var(--min-width);
		top: var(--header-height);
		bottom: var(--footer-height);
		border-top: 1px solid #000;
		border-bottom: 1px solid #000;
		box-shadow: 0 -10px 5px -10px rgba(0, 0, 0, 0.4) inset;
		justify-content: center;
		display: flex;
		transition: bottom 0.2s ease 0s;
	}
	.video-controls {
		position: absolute;
		width: 100%;
		z-index: 3;
		bottom: 0px;
	}
	.video-container {
		width: auto;
		height: auto;
		aspect-ratio: 16 / 9;
		margin: auto;
		background-color: #000;
		position: relative;
		justify-content: center;
		display: flex;
	}
	.video-container video {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}
	footer {
		position: absolute;
		bottom: 0px;
		width: 100%;
		min-width: var(--min-width);
		height: var(--footer-height);
		transition: height 0.2s ease 0s;
	}
	@media screen and (max-width: 310px) {
		footer {
			height: var(--expanded-footer-height);
		}
		main {
			bottom: var(--expanded-footer-height);
		}
	}
	@media screen and (max-width: 425px) {
		.footer-trim-opened {
			height: var(--expanded-footer-height);
		}
		.main-trim-opened {
			bottom: var(--expanded-footer-height);
		}
	}
</style>
