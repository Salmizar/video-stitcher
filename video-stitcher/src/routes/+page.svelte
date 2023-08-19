<script>
	import DeleteForever from 'svelte-material-icons/DeleteForever.svelte';
	import { fade, scale } from 'svelte/transition';
	import { v4 as uuidv4 } from 'uuid';
	import uploadFiles from '$lib/files.js';
  import { goto } from '$app/navigation';
	const maxFileSize = 262144000; //250MB
	let uploading = false;
	let file1 = null;
	let file2 = null;
	let file1Progress = 0;
	let file2Progress = 0;
	function handleSelectFile(e) {
		document.getElementById('file' + e.currentTarget.id).click();
	}
	function fileSelected(e) {
		if (e.currentTarget.files[0].size > maxFileSize) {
			alert('max file limit of 250MB. Please selected a smaller file.');
			e.currentTarget.value = '';
		} else {
			if (e.currentTarget.id === 'file1') {
				file1 = e.currentTarget.files[0];
			} else {
				file2 = e.currentTarget.files[0];
			}
		}
	}
	function sendFile1Progress(e) {
		file1Progress = Math.round((e.loaded / e.total) * 100);
	}
	function sendFile2Progress(e) {
		file2Progress = Math.round((e.loaded / e.total) * 100);
	}
  function viewStitcher(sessionId) {
    if (uploading) {
        uploading = false;
      } else {
        goto(`/view/${sessionId}`);
      }
  }
	function sendFiles() {
		uploading = true;
		const sessionId = uuidv4();
		let url = import.meta.env.VITE_API_URL + `/?filename=1.${file1.name}&session=${sessionId}`;
		uploadFiles(file1, url, sendFile1Progress).then(() => {
      viewStitcher(sessionId);
		});
		url = import.meta.env.VITE_API_URL + `/?filename=2.${file2.name}&session=${sessionId}`;
		uploadFiles(file2, url, sendFile2Progress).then(() => {
      viewStitcher(sessionId);
		});
	}
</script>

<header>
	<img alt="Video X Stitcher" width="400" height="99" src="videoxstitcher.png" />
	<img alt="Logo" width="135" height="99" src="logo.png" />
</header>
<p class="text-lg font-normal mt-10" style="min-height:60px">
	{#if file1Progress===100&&file2Progress===100}
    <span in:fade>
      Uploading complete. Files are processing to generate thumbnails and get ready for stitching
    </span>
  {:else if file1 != null && file2 != null}
		<span in:fade>
			If you're readonly, let's view the stitched VideoColorSpace. We can also trim them if
			necessary
		</span>
	{:else}
		<span in:fade>Select 2 files to begin the process of stitching them together</span>
	{/if}
</p>
<div class="videos">
	{#if file1 === null}
		<button id="1" title="Select a video" on:click={handleSelectFile} class="btn btn-blue">
			Select Video 1
		</button>
	{:else}
		<div in:fade out:fade class="file-selected file-selected1">
			<div style="width:{file1Progress}%" class="file-progress" />
			<span class="file-name">{file1.name}</span>
			<span id="1" class="delete-icon" title="Select a new file" on:click={handleSelectFile}>
				<DeleteForever width="24" height="24" />
			</span>
		</div>
	{/if}
	<div class="separator" />
	{#if file2 === null}
		<button id="2" title="Select a video" on:click={handleSelectFile} class="btn btn-blue">
			Select Video 2
		</button>
	{:else}
		<div in:fade out:fade class="file-selected file-selected2">
			<div style="width:{file2Progress}%" class="file-progress file-progress2" />
			<span id="2" class="delete-icon" title="Select a new file" on:click={handleSelectFile}>
				<DeleteForever width="24" height="24" />
			</span>
			<span class="file-name">{file2.name}</span>
		</div>
	{/if}
</div>
{#if file1 != null && file2 != null}
	<button
		disabled={uploading}
		in:scale
		id="1"
		title="Trim and view Video"
		on:click={sendFiles}
		class={uploading ? 'btn mt-5 text-gray-600 bg-gray-300 font-bold' : 'btn mt-5 btn-blue'}
	>
		{#if file1Progress === 100 && file2Progress === 100}<span in:fade>Processing...</span>{:else if uploading}<span in:fade>Uploading...</span>{:else}Trim and View{/if}
	</button>
{:else}
	<p class="text-xs text-slate-500">Maximum 250MB per file</p>
{/if}
<div class="hidden">
	<input accept=".mp4,.ogg,.webm" id="file1" type="file" on:change={fileSelected} />
	<input accept=".mp4,.ogg,.webm" id="file2" type="file" on:change={fileSelected} />
</div>

<style lang="postcss">
	:global(html) {
		text-align: center;
	}
	img {
		margin: 0px auto 0px;
		display: block;
	}
	.btn {
		@apply font-bold py-2 px-4 rounded;
		width: 200px;
	}
	.btn-blue {
		@apply bg-blue-500 text-white;
	}
	.btn-blue:hover {
		@apply bg-blue-700;
	}
	.videos {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		margin-top: 20px;
	}
	.videos button,
	.videos div {
		float: left;
	}
	.videos button {
		margin: 25px;
	}
	.separator {
		margin-left: 10px;
		padding-right: 10px;
		height: 90px;
		border-left: 3px dotted #ccc;
	}
	.file-selected1 {
		text-align: right;
	}
	.file-selected2 {
		text-align: left;
	}
	.file-selected {
		position: relative;
		margin: 25px;
		width: 200px;
		border: 1px solid #d9d9d9;
		background-color: #efefefff;
		height: 35px;
		white-space: nowrap;
	}
	.file-progress {
		position: absolute;
		left: 0px;
		min-width: 0%;
		height: 35px;
		background-color: blue;
		opacity: 0.5;
	}
	.file-progress2 {
		left: auto;
		right: 0px;
	}
	.file-selected span {
		padding-top: 5px;
		display: inline-block;
	}
	.delete-icon {
		cursor: pointer;
	}
	.file-name {
		width: 169px;
		overflow: hidden;
		white-space: nowrap;
	}
	@media screen and (max-width: 525px) {
		.separator {
			display: none;
		}
	}
	@media screen and (max-width: 500px) {
		.file-selected2 .file-name {
			text-align: right;
		}
		.file-selected2 .delete-icon {
			float: right;
		}
		.file-progress2 {
			left: 0px;
			right: auto;
		}
	}
</style>
