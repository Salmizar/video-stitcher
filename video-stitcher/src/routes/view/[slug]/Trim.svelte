<script>
	import { createEventDispatcher } from 'svelte';
	import { fade } from 'svelte/transition';
	const dispatch = createEventDispatcher();
	export let video1;
	export let video2;
	export let trimOpened;
	export let processingVideo;
	$: processingVideo && closeTrim();
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
	const closeTrim = () => {
		if (trimOpened) {
			toggleTrim(true);
		}
	}
	const toggleTrim = (force) => {
		if (processingVideo===0 || force) {
			trimOpened = !trimOpened;
			video1.trim = '';
			video2.trim = '';
			if (video1.active) {
				video1.target.currentTime = Number(video1.target.currentTime);
			} else {
				video2.target.currentTime = Number(video2.target.currentTime);
			}
		}
	};
</script>

<div class="trim-options {trimOpened?'trim-options-opened':''}">
	<button title="Trim Videos" class="btn btn-blue" on:click={() => {toggleTrim(false)}}>
		{trimOpened ? 'Done' : 'Trim'}
	</button>
	{#if trimOpened}
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
		white-space: nowrap;
		transition: bottom 0.2s ease 0s;
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
		font-size: 13px;
		position: relative;
		top: -1px;
		width: 110px;
		height: 35px;
		border: 1px solid lightgrey;
	}
	@media screen and (max-width: 425px) {
		.trim-options-opened {
			bottom: 60px;
		}
	}
	@media screen and (max-width: 310px) {
		.trim-options {
			bottom: 60px;
		}
	}
</style>
