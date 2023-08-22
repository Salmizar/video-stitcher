<script>
	import { page } from '$app/stores';
	const sessionId = $page.params.slug;
	const file_url = import.meta.env.VITE_API_URL + '/files/' + sessionId + '?filename=';
	const padding = 10;
	let playheadPos = 0;
	export let video1;
	export let video2;
	const videoTimeUpdated = (e) => {
		let percentagePlayed = e.target.currentTime / video1.duration * 100;
		playheadPos = Math.round(((window.innerWidth - (padding*2))/100*video1.percentageOfTotalTime)/100*percentagePlayed);
		//console.log(playheadPos);
	};
	video1.target.addEventListener('ended', videoTimeUpdated);
	video2.target.addEventListener('ended', videoTimeUpdated);
	video1.target.addEventListener('timeupdate', videoTimeUpdated);
	video2.target.addEventListener('timeupdate', videoTimeUpdated);
	const timelineScrub = (e) => {
		
		video1.target.currentTime = video1.target.duration /100* (e.clientX / e.target.clientWidth * 100);
		
	}
</script>

<div class="timeline">
	<div class="timeline-bg"></div>
	{#if video1.thumbnails}
	<div class="playhead" style="left:{playheadPos+padding}px;">
		<img class="playhead-icon" src="../pointer.svg" width="12" height="101" />
	</div>
		{#each video1.thumbnails as thumb, i}
			<div
				style="z-index:{video1.thumbnails.length - i}; left: calc({i * 10}% + {padding}px);"
				class="thumbnail {i === 0 ? 'first-thumbnail' : ''}"
			>
				<img src={file_url + thumb.fileName} />
				{#if i === 0}
					<div class="filename">{video1.thumbnails[0].fileName}</div>
				{/if}
			</div>
		{/each}
		{#each video2.thumbnails as thumb, i}
			<div
				style="z-index:{video1.thumbnails.length +
					video2.thumbnails.length -
					i}; right: calc({(video2.thumbnails.length - 1 - i) * 10}% + {padding}px);"
				class="thumbnail {i === 0 ? 'first-thumbnail' : ''}"
			>
				<img src={file_url + thumb.fileName} />
				{#if i === 0}
					<div class="filename">{video2.thumbnails[0].fileName}</div>
				{/if}
			</div>
		{/each}
	{/if}
	<div class="timeline-scrubber" on:mousedown={timelineScrub}></div>
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
		filter:invert(1);
		mix-blend-mode: difference;
	}
	.playhead-icon {
		position: relative;
		left: -5px;
		top: 0px;
	}
	.first-thumbnail {
		border-left: 1px solid white;
	}
	.thumbnail {
		border-top: 1px solid #000;
		border-bottom: 1px solid #000;
		position: absolute;
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
		top: 67px;
	}
</style>
