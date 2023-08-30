<script>
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	import ContentCut from 'svelte-material-icons/ContentCut.svelte';
	import { fade } from 'svelte/transition';
	const dispatch = createEventDispatcher();
	export let video1;
	export let video2;
	const sessionId = $page.params.slug;
	const file_url = import.meta.env.VITE_API_URL + '/files/' + sessionId + '?filename=';
	const padding = 10;
	const scrubDelay = 100;
	let playheadPos = 0;
	let trim = {
		v1Start: 0,
		v1End: 0,
		v2Start: 0,
		v2End: 0
	};
	let delayScrub;
	let scrubTime;
	let delayTimer;
	const updateTimeline = () => {
		const innerWidth = window.innerWidth - padding * 2;
		if (video1.active) {
			let percentagePlayed = (video1.target.currentTime / video1.duration) * 100;
			playheadPos = Math.round(
				(((innerWidth / 100) * video1.percentageOfTotalTime) / 100) * percentagePlayed
			);
		} else {
			let percentagePlayed = (video2.target.currentTime / video2.duration) * 100;
			playheadPos =
				(innerWidth / 100) * video1.percentageOfTotalTime +
				Math.round((((innerWidth / 100) * video2.percentageOfTotalTime) / 100) * percentagePlayed);
		}
		trim.v1Start = video1.trimStart / video1.duration;
		trim.v1End = video1.trimEnd / video1.duration;
		trim.v2Start = video2.trimStart / video2.duration;
		trim.v2End = video2.trimEnd / video2.duration;
		if (
			video1.trimEnd > 0 &&
			!video1.target.paused &&
			video1.target.currentTime >= video1.duration - video1.trimEnd
		) {
			scrubTime = video2.trimStart;
			updateVideoCurrentTime(video2, 2, false);
			video2.target.play();
		}
		if (
			video2.trimEnd > 0 &&
			!video2.target.paused &&
			video2.target.currentTime >= video2.duration - video2.trimEnd
		) {
			scrubTime = video1.trimStart;
			updateVideoCurrentTime(video1, 1, true);
		}
	};
	updateTimeline();
	window.addEventListener('resize', updateTimeline);
	video1.target.addEventListener('timeupdate', updateTimeline);
	video2.target.addEventListener('timeupdate', updateTimeline);
	const constrainTime = (video, clientX, videoPixelWidth) => {
		let newTime = Number((
			(video.target.duration / 100) * ((clientX / videoPixelWidth) * 100)
		).toFixed(2));
		if (newTime<0) {
			newTime = 0;
		}
		if (video.trim === 's') {
			//trimming video start
			let maxStart = Number(video.duration - 1 - video.trimEnd);
			if (newTime > maxStart) {
				newTime = maxStart;
			}
			video.trimStart = newTime;
		} else if (video.trim === 'e') {
			//trimming video end
			let minEnd = Number(video.trimStart + 1);
			if (newTime < minEnd) {
				newTime = minEnd;
			}
			video.trimEnd = video.duration - newTime;
		} else {
			//regular scrubbing
			let minStart = Number(video.trimStart);
			if (newTime < minStart) {
				newTime = minStart;
			}
			let maxEnd = Number(video.duration - video.trimEnd);
			if (newTime > maxEnd) {
				newTime = maxEnd;
			}
		}
		return newTime;
	};
	const timelineScrub = (e) => {
		e.preventDefault();
		if (e.buttons === 1 && e.type==='mousemove' || e.type==='touchmove') {
			let clientX = ((e.clientX)?e.clientX:e.touches[0].pageX) - padding;
			let videoPixelWidth = (e.target.clientWidth / 100) * video1.percentageOfTotalTime;
			if ((clientX <= videoPixelWidth && video2.trim==='') || video1.trim != '') {
				let newTime = constrainTime(video1, clientX, videoPixelWidth);
				if (video1.target.currentTime != newTime) {
					delayVideoTimeUpdate(video1, 1, newTime);
				}
			} else {
				clientX = clientX - padding - videoPixelWidth;
				videoPixelWidth = (e.target.clientWidth / 100) * video2.percentageOfTotalTime;
				let newTime = constrainTime(video2, clientX, videoPixelWidth);
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
				updateVideoCurrentTime(video, id, true);
			}, scrubDelay);
			delayTimer = Date.now();
		}
		scrubTime = time;
	};
	const updateVideoCurrentTime = (video, id, pause) => {
		if (!video1.target.paused) {
			video1.target.pause();
		}
		if (!video2.target.paused) {
			video2.target.pause();
		}
		video.target.currentTime = scrubTime;
		dispatch('focusVideo', {id: id, pause: pause});
	};
</script>

<div class="timeline">
	<div class="timeline-bg" />
	{#if video1.thumbnails}
		<div class="playhead" style="left:{playheadPos + padding}px;">
			<img alt="playhead" class="playhead-icon" src="../pointer.svg" width="12" height="101" />
			{#if video1.trim != '' || video2.trim != ''}
				<div  in:fade={{duration:100}} out:fade={{duration:200}} class="playhead-cut"><ContentCut width="14" height="14" /></div>
			{/if}
		</div>
		<div
			class="thumbnails-container"
			style="width: calc( 100% * {video1.percentageOfTotalTime / 100} );"
		>
			<div
				id="v1-trim-start"
				style="width: calc( 100% * {trim.v1Start});"
				class="video-trim-start"
			/>
			{#each video1.thumbnails as thumb, i}
				<div
					style="z-index:{video1.thumbnails.length - i};"
					class="thumbnail {i === 0 ? 'first-vid-thumbnail' : ''}"
				>
					<img alt="video 1 thumbnail" src={file_url + thumb.fileName} />
					{#if i === 0}
						<div class="filename">{video1.thumbnails[0].fileName}</div>
					{/if}
				</div>
			{/each}
			<div
				id="v1-trim-end"
				style="width: calc( 100% * {trim.v1End});"
				class="video-trim-end"
			/>
		</div>
		<div
			class="thumbnails-container"
			style="width:calc( 100% * {video2.percentageOfTotalTime / 100} );"
		>
			<div
				id="v2-trim-start"
				style="width: calc( 100% * {trim.v2Start});"
				class="video-trim-start"
			/>
			{#each video2.thumbnails as thumb, i}
				<div
					style="z-index:{video1.thumbnails.length + video2.thumbnails.length - i};"
					class="thumbnail {i === 0 ? 'first-thumbnail' : ''}"
				>
					<img alt="video 2 thumbnail" src={file_url + thumb.fileName} />
					{#if i === 0}
						<div class="filename">{video2.thumbnails[0].fileName}</div>
					{/if}
				</div>
			{/each}
			<div
				id="v2-trim-end"
				style="width: calc( 100% * {trim.v2End});"
				class="video-trim-end"
			/>
		</div>
	{/if}
	<div
		role="none"
		class="timeline-scrubber"
		on:drag={timelineScrub}
		on:touchstart={timelineScrub}
		on:touchmove={timelineScrub}
		on:mousemove={timelineScrub}
		on:mousedown={timelineScrub}
	/>
</div>

<style>
	:root {
		--timeline-padding: 10px;
		--thumb-height: 85px;
	}
	.timeline {
		position: relative;
		white-space: nowrap;
		overflow: hidden;
		padding: 13px var(--timeline-padding) 0 var(--timeline-padding);
		height: 115px;
		background-color: white;
	}
	.timeline-bg {
		position: absolute;
		left: var(--timeline-padding);
		right: var(--timeline-padding);
		height: var(--thumb-height);
		border: 1px solid black;
		background-image: url('../timeline.png');
		background-color: gray;
		cursor: col-resize;
	}
	.timeline-scrubber {
		position: absolute;
		padding: var(--timeline-padding);
		width: calc(100vw - var(--timeline-padding) - var(--timeline-padding));
		height: var(--thumb-height);
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
	.playhead-cut {
		position: relative;
		top:-3px;
		left:-7px;
	}
	.video-trim-start {
		position: absolute;
		height: var(--thumb-height);
		background-color: black;
		opacity: 0.7;
		z-index: 15;
		filter: invert(1);
		mix-blend-mode: difference;
		border: 1px dashed darkgray;
		border-right: 1px dashed darkgray;
	}
	.video-trim-end {
		position: absolute;
		height: var(--thumb-height);
		right: 0px;
		background-color: black;
		opacity: 0.7;
		z-index: 16;
		filter: invert(1);
		mix-blend-mode: difference;
		border: 1px dashed darkgray;
		border-left: 1px dashed darkgray;
	}
	.first-vid-thumbnail {
		border-left: 1px solid #000;
	}
	.first-thumbnail {
		border-left: 1px solid white;
	}
	.thumbnails-container {
		position: relative;
		float: left;
		display: flex;
		justify-content: space-between;
		overflow: hidden;
	}
	.thumbnail {
		display: flex;
		align-items: center;
		border-top: 1px solid #000;
		border-bottom: 1px solid #000;
		height: var(--thumb-height);
		width: 114px;
		overflow: hidden;
	}
	.filename {
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
