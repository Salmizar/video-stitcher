<script>
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	const dispatch = createEventDispatcher();
	export let video1;
	export let video2;
	let trimmingVideos = false;
	const trimVideo = (e) => {
		const details = e.target.value.split('-');
		const id = Number(details[0]);
		video1.trim = '';
		video2.trim = '';
		if (id === 0) {
			video1.trim = '';
			video2.trim = '';
			video2.target.currentTime = video2.trimStart;
		} else {
			if (id === 1) {
				video1.target.currentTime =
					details[1] === 's' ? video1.trimStart : video1.duration - video1.trimEnd;
				video1.trim = details[1];
			} else {
				video2.target.currentTime =
					details[1] === 's' ? video2.trimStart : video2.duration - video2.trimEnd;
				video2.trim = details[1];
			}
			dispatch('focusVideo', {id: id, pause: false});
		}
	};
	const toggleTrim = () => {
		trimmingVideos = !trimmingVideos;
		video1.trim = '';
		video2.trim = '';
		if (video1.active) {
			video1.target.currentTime = Number(video1.target.currentTime);
		} else {
			video2.target.currentTime = Number(video2.target.currentTime);
		}
	};
</script>

<div class="trim-options">
	<button title="Trim Videos" class="btn btn-blue" on:click={toggleTrim}>
		{trimmingVideos ? 'Done' : 'Trim'}
	</button>
	{#if trimmingVideos}
		<select in:fade={{duration:200}} out:fade={{duration:200}} on:change={trimVideo}>
			<option value="0-0">Select One</option>
			<option value="1-s">Video 1 Start</option>
			<option value="1-e">Video 1 End</option>
			<option value="2-s">Video 2 Start</option>
			<option value="2-e">Video 2 End</option>
		</select>
	{/if}
</div>

<style>
	.trim-options {
		position: absolute;
		bottom: 10px;
		left: 10px;
	}
	.btn {
		width: 80px;
		@apply font-bold py-2 px-4 rounded;
	}
	.btn-blue {
		@apply bg-blue-500 text-white;
	}
	.btn-blue:hover {
		@apply bg-blue-700;
	}
	select {
		width: 125px;
		height: 35px;
		border: 1px solid grey;
	}
</style>
