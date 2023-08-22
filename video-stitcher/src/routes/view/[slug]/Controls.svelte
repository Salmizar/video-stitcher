<script>
	import SkipPrevious from 'svelte-material-icons/SkipPrevious.svelte';
	import SkipNext from 'svelte-material-icons/SkipNext.svelte';
	import Play from 'svelte-material-icons/Play.svelte';
	import Pause from 'svelte-material-icons/Pause.svelte';
	import VolumeHigh from 'svelte-material-icons/VolumeHigh.svelte';
	import VolumeMute from 'svelte-material-icons/VolumeMute.svelte';
	import convertTime from '$lib/utils';
	export let video1;
	export let video2;
	const totalTime = Math.floor(video1.duration + video2.duration);
	let videosTotalTime = convertTime(totalTime);
	let currentTime = '00:00';
	let canSkipBack = false;
	let canSkipForward = true;
	const videoTimeUpdated = (e) => {
		canSkipBack = (e.target.currentTime>0);
		canSkipForward = (e.target.currentTime<e.target.duration);
		currentTime = convertTime(e.target.currentTime);
	}
	const videoEnded = (e) => {
		paused = e.target.pause;
	}
	video1.target.addEventListener('ended', videoEnded);
	video2.target.addEventListener('ended', videoEnded);
	video1.target.addEventListener('timeupdate', videoTimeUpdated);
	video2.target.addEventListener('timeupdate', videoTimeUpdated);
	let muted = video1.target.muted;
	const toggleMute = () => {
		muted = !muted;
		video1.target.muted = muted;
		video2.target.muted = muted;
	};
	let paused = true;
	const togglePlay = () => {
		if (paused) {
			video1.target.currentTime = 66;
			video1.target.play();
		} else {
			video1.target.pause();
		}
		paused = !paused;
	}
	const skipForward = () => {
		if (canSkipForward) {
			if (!video1.target.paused) {
				togglePlay();
			}
			video1.target.currentTime = video1.target.duration;
		}
	}
	const skipBack = () => {
		if (canSkipBack) {
			if (!video1.target.paused) {
				togglePlay();
			}
			video1.target.currentTime = 0;
		}
	}
</script>

<div class="controls">
	<div class="time">{currentTime} / {videosTotalTime}</div>
	<div class="playback-controls">
		<div title="Skip Back" on:click={skipBack} class="{canSkipBack?'enabled':'disabled'}">
			<SkipPrevious width="24" height="24" />
		</div>
		<div class="play" title="Toggle Play/Pause" on:click={togglePlay}>
			{#if paused}
				<Play width="24" height="24" />
			{:else}
				<Pause width="24" height="24" />
			{/if}
		</div>
		<div title="Skip Forward" on:click={skipForward} class="{canSkipForward?'enabled':'disabled'}">
			<SkipNext width="24" height="24" />
		</div>
	</div>
	<div class="volume" title="Toggle Mute" on:click={toggleMute}>
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
