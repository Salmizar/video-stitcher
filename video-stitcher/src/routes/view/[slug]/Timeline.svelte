<script>
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	const sessionId = $page.params.slug;
	const file_url = import.meta.env.VITE_API_URL + '/files/' + sessionId + '?filename=';
	const padding = 10;
	let playheadPos = 0;
	export let video1;
	export let video2;
	const updatePlayhead = () => {
		const innerWidth = window.innerWidth - padding * 2;
		if (Number(video1.target.style.zIndex) === 2) {
			let percentagePlayed = (video1.target.currentTime / video1.duration) * 100;
			playheadPos = Math.round(
				(((innerWidth / 100) * video1.percentageOfTotalTime) / 100) * percentagePlayed
			);
		} else {
			let percentagePlayed = (video2.target.currentTime / video2.duration) * 100;
			console.log(video1.percentageOfTotalTime);
			playheadPos =
				(innerWidth / 100) * video1.percentageOfTotalTime +
				Math.round((((innerWidth / 100) * video2.percentageOfTotalTime) / 100) * percentagePlayed);
		}
	};
	window.addEventListener('resize', updatePlayhead);
	video1.target.addEventListener('timeupdate', updatePlayhead);
	video2.target.addEventListener('timeupdate', updatePlayhead);
	let delayScrub;
	const scrubDelay = 100;
	let scrubTime;
	let delayTimer;
	const timelineScrub = (e) => {
		if (e.buttons === 1) {
			let clientX = e.clientX - padding;
			let videoPixelWidth = (e.target.clientWidth / 100) * video1.percentageOfTotalTime;
			if (clientX <= videoPixelWidth) {
				let newTime = Number(
					(video1.target.duration / 100) * ((clientX / videoPixelWidth) * 100)
				).toFixed(2);
				if (video1.target.currentTime != newTime) {
					delayVideoTimeUpdate(video1, 1, newTime);
				}
			} else {
				clientX = e.clientX - padding - videoPixelWidth;
				videoPixelWidth = (e.target.clientWidth / 100) * video2.percentageOfTotalTime;
				let newTime = Number(
					(video2.target.duration / 100) * ((clientX / videoPixelWidth) * 100)
				).toFixed(2);
				if (video2.target.currentTime != newTime) {
					delayVideoTimeUpdate(video2, 2, newTime);
				}
			}
		}
	};
	const delayVideoTimeUpdate = (video, id, time) => {
		//Set delay in updating time, otherwise some files could lock up due to codec issues.
		if (delayScrub === undefined || Date.now() - delayTimer > scrubDelay) {
			delayScrub = setTimeout(() => {
				updateVideoCurrentTime(video, id);
			}, scrubDelay);
			delayTimer = Date.now();
		}
		scrubTime = time;
	};
	const updateVideoCurrentTime = (video, id) => {
		if (!video1.target.paused) {
			video1.target.pause();
		}
		if (!video2.target.paused) {
			video2.target.pause();
		}
		video.target.currentTime = scrubTime;
		dispatch('focusVideo', id);
	};
</script>

<div class="timeline">
	<div class="timeline-bg" />
	{#if video1.thumbnails}
		<div class="playhead" style="left:{playheadPos + padding}px;">
			<img alt="playhead" class="playhead-icon" src="../pointer.svg" width="12" height="101" />
		</div>
		<div
			class="thumbnails-container"
			style="width: calc( calc( 100vw - {padding * 2}px ) * {video1.percentageOfTotalTime / 100} );"
		>
			{#each video1.thumbnails as thumb, i}
				<div
					style="z-index:{video1.thumbnails.length - i};"
					class="thumbnail {i === 0 ? 'first-vid-thumbnail' : ''}"
				>
					<img alt="video 1 thumbnail" src={file_url + thumb.fileName} />
					{#if i === 0}
						<div class="filename">{video1.thumbnails[0].fileName}</div>
					{/if}
					<div class="fileinfo">{i * 10}</div>
				</div>
			{/each}
		</div>
		<div
			class="thumbnails-container"
			style="width:calc( calc( 100vw - {padding * 2}px ) * {video2.percentageOfTotalTime / 100} );"
		>
			{#each video2.thumbnails as thumb, i}
				<div
					style="z-index:{video1.thumbnails.length + video2.thumbnails.length - i};"
					class="thumbnail {i === 0 ? 'first-thumbnail' : ''}"
				>
					<img alt="video 2 thumbnail" src={file_url + thumb.fileName} />
					{#if i === 0}
						<div class="filename">{video2.thumbnails[0].fileName}</div>
					{/if}
					<div class="fileinfo">{(video2.thumbnails.length - 1 - i) * 10}</div>
				</div>
			{/each}
		</div>
	{/if}
	<div
		role="none"
		class="timeline-scrubber"
		on:mousemove={timelineScrub}
		on:mousedown={timelineScrub}
	/>
</div>

<style>
	:root {
		--timeline-padding: 10px;
	}
	::-webkit-scrollbar {
		height: 10px;
	}
	::-webkit-scrollbar-track {
		background: #f1f1f1;
		border-radius: 5px;
	}
	::-webkit-scrollbar-thumb {
		background: #d1d1d1;
		border-radius: 5px;
	}
	::-webkit-scrollbar-thumb:hover {
		background: #c1c1c1;
	}
	.timeline {
		position: relative;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 13px var(--timeline-padding) 0 var(--timeline-padding);
		width: 100vw;
		height: 115px;
		background-color: white;
	}
	.timeline-bg {
		position: absolute;
		padding: var(--timeline-padding);
		width: calc(100vw - var(--timeline-padding) - var(--timeline-padding));
		height: 85px;
		border: 1px solid black;
		background-image: url('../timeline.png');
		background-color: gray;
		cursor: col-resize;
	}
	.timeline-scrubber {
		position: absolute;
		padding: var(--timeline-padding);
		width: calc(100vw - var(--timeline-padding) - var(--timeline-padding));
		height: 85px;
		border: 1px solid black;
		background-color: black;
		opacity: 0;
		z-index: 50;
		cursor: e-resize;
	}
	.playhead {
		position: absolute;
		z-index: 11;
		left: calc(var(--timeline-padding));
		top: 0px;
		filter: invert(1);
		mix-blend-mode: difference;
	}
	.playhead-icon {
		position: relative;
		left: -5px;
		top: 0px;
	}
	.first-vid-thumbnail {
		border-left: 1px solid #000;
	}
	.first-thumbnail {
		border-left: 1px solid white;
	}
	.thumbnails-container {
		float: left;
		display: flex;
		justify-content: space-between;
		left: calc(var(--timeline-padding));
	}
	.thumbnail {
		display: flex;
		align-items: center;
		border-top: 1px solid #000;
		border-bottom: 1px solid #000;
		height: 85px;
		width: 114px;
	}
	.filename {
		padding: 0px 5px 0 5px;
		cursor: default;
		color: white;
		opacity: 0.8;
		font-size: 12px;
		background-color: rgba(0, 0, 0, 0.8);
		position: absolute;
		top: 14px;
	}
	.fileinfo {
		visibility: hidden;
		padding: 0px 5px 0 5px;
		cursor: default;
		color: white;
		opacity: 0.8;
		font-size: 12px;
		background-color: rgba(0, 0, 0, 0.8);
		position: absolute;
		top: 0px;
	}
</style>
