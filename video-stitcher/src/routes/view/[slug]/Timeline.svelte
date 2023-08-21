<script>
	import { page } from '$app/stores';
	const sessionId = $page.params.slug;
	const file_url = import.meta.env.VITE_API_URL + '/files/' + sessionId + '?filename=';
	export let video1;
	export let video2;
</script>

<div class="timeline">
	{#if video1.thumbnails}
    <img class="bg-playhead" src="../bg-pointer.png" />
    <img class="playhead" src="../pointer.png" />
		{#each video1.thumbnails as thumb, i}
			<img
				style="z-index:{5 + video1.thumbnails.length - i}; left:calc({i * 10}% + 15px);"
				class="thumbnail"
				src={file_url + thumb.fileName}
			/>
		{/each}
		{#each video2.thumbnails as thumb, i}
			<img
				style="z-index:{video2.thumbnails.length - i}; left: calc({50 + i * 10}% + 15px);"
				class="thumbnail"
				src={file_url + thumb.fileName}
			/>
		{/each}
		<div class="filename">{video1.thumbnails[0].fileName}</div>
		<div class="filename" style="left:calc(50% + 15px);">{video2.thumbnails[0].fileName}</div>
	{/if}
</div>

<style>
    .bg-playhead {
        z-index: 13;
        position: absolute;
        left: 12px;
        top: 0px;
    }
    .playhead {
        z-index: 12;
        position: absolute;
        left: 12px;
        top: 0px;
        filter: invert(1);
        mix-blend-mode: difference;
    }
	.thumbnail {
		position: absolute;
		height: 85px;
		width: 114px;
	}
	.timeline {
		position: relative;
		white-space: nowrap;
		overflow-x: auto;
		overflow-y: hidden;
		padding: 15px 10px 0 15px;
		width: 100vw;
		height: 115px;
	}
	.filename {
		z-index: 11;
		color: white;
		opacity: 0.8;
		font-size: 12px;
		background-color: rgba(0, 0, 0, 0.8);
		position: absolute;
		top: 80px;
	}
</style>
