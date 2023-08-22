<script>
	import SkipPrevious from 'svelte-material-icons/SkipPrevious.svelte';
	import SkipNext from 'svelte-material-icons/SkipNext.svelte';
	import Play from 'svelte-material-icons/Play.svelte';
	import Pause from 'svelte-material-icons/Pause.svelte';
	import VolumeHigh from 'svelte-material-icons/VolumeHigh.svelte';
	import VolumeMute from 'svelte-material-icons/VolumeMute.svelte';
	import convertTime from '$lib/utils';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();
	export let video1;
	export let video2;
	export let paused;
	const totalTime = Math.floor(video1.duration + video2.duration);
	let videosTotalTime = convertTime(totalTime);
	let currentTime = '00:00';
	let canSkipBack = false;
	let canSkipForward = true;
	const videoTimeUpdated = (e) => {
		canSkipBack = (video1.target.currentTime>0);
		canSkipForward = (e.target.id==='video1' && e.target.currentTime<e.target.duration);
		let timePadding = 0;
		if (e.target.id==='video2') {
			timePadding = video1.duration;
		}
		currentTime = convertTime(timePadding + e.target.currentTime);
	}
	video1.target.addEventListener('timeupdate', videoTimeUpdated);
	video2.target.addEventListener('timeupdate', videoTimeUpdated);
	let muted = video1.target.muted;
	const toggleMute = () => {
		muted = !muted;
		video1.target.muted = muted;
		video2.target.muted = muted;
	};
	const togglePlay = () => {
		dispatch('togglePlay');
		paused = !paused;
	}
	const skipForward = () => {
		if (canSkipForward) {
			if (!video1.target.paused) {
				togglePlay();
			}
			video1.target.currentTime = Math.round(video1.target.duration);
			video2.target.currentTime = 0;
			dispatch('focusVideo', 2);
		}
	}
	const skipBack = () => {
		if (canSkipBack) {
			if (!video2.target.paused || !video1.target.paused) {
				togglePlay();
			}
			if (Number(video2.target.style.zIndex) === 2 && video2.target.currentTime === 0) {
				video1.target.currentTime = 0;
				dispatch('focusVideo', 1);
			}
			video2.target.currentTime = 0;
		}
	}
</script>

<div class="controls">
	<div class="time">{currentTime} / {videosTotalTime}</div>
	<div class="playback-controls">
		<div title="Skip Back" role="button" tabindex="-4" on:click={skipBack} on:keypress={skipBack} class="{canSkipBack?'enabled':'disabled'}">
			<SkipPrevious width="24" height="24" />
		</div>
		<div class="play" role="button" tabindex="-3" title="Toggle Play/Pause" on:click={togglePlay} on:keypress={skipBack}>
			{#if paused}
				<Play width="24" height="24" />
			{:else}
				<Pause width="24" height="24" />
			{/if}
		</div>
		<div title="Skip Forward" role="button" tabindex="-2" on:click={skipForward} on:keypress={skipBack} class="{canSkipForward?'enabled':'disabled'}">
			<SkipNext width="24" height="24" />
		</div>
	</div>
	<div class="volume" role="button" tabindex="-1" title="Toggle Mute" on:click={toggleMute} on:keypress={skipBack}>
		{#if muted}
			<VolumeMute width="24" height="24" />
		{:else}
			<VolumeHigh width="24" height="24" />
		{/if}
	</div>
</div>

<style>
	.enabled {
		cursor: pointer;
		opacity: 1;
	}
	.disabled {
		opacity: 0.5;
	}
	.controls {
		color: white;
		display: flex;
		justify-content: center;
		background-image: linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0.5));
		height: 30px;
	}
	.time {
		font-size: 13px;
		position: absolute;
		top: 3px;
		left: 10px;
	}
	.playback-controls {
	}
	.playback-controls div {
		padding-right: 15px;
		float: left;
	}
	.play {
		cursor: pointer;
	}
	.volume {
		cursor: pointer;
		position: absolute;
		right: 10px;
	}
</style>
