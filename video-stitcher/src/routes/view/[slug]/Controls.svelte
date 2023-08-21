<script>
	import VolumeHeight from 'svelte-material-icons/VolumeHigh.svelte';
	import SkipPrevious from 'svelte-material-icons/SkipPrevious.svelte';
	import SkipNext from 'svelte-material-icons/SkipNext.svelte';
	import Play from 'svelte-material-icons/Play.svelte';
	import Pause from 'svelte-material-icons/Pause.svelte';
	export let video1;
	export let video2;
	let totalTime = Math.floor(video1.duration+video2.duration)/60;
</script>

<div class="controls">
	<div class="time">00:00 / {totalTime}</div>
	<div class="playback-controls">
		<div title="Skip to start of the clip">
			<SkipPrevious width="24" height="24" />
		</div>
		<div title="Toggle Play/Pause">
			<Play width="24" height="24" />
		</div>
		<div title="Skip to end of the clip">
			<SkipNext width="24" height="24" />
		</div>
	</div>
	<div class="volume" title="Toggle Mute">
		<VolumeHeight width="24" height="24" />
	</div>
</div>

<style>
    .controls {
        color: white;
        display: flex;
        justify-content: center;
        background-image: linear-gradient(rgba(0,0,0,0), rgba(0,0,0,0.5));
        height: 30px;
    }
    .time {
		font-size: 15px;
        position: absolute;
        left:10px;
    }
	.playback-controls {
    }
	.playback-controls div {
        padding-right:15px;
		float: left;
	}
	.volume {
        position: absolute;
        right:10px;
	}
</style>
