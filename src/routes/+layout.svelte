<script lang="ts">
	import '../app.css';
    import {SvelteToast} from "@zerodevx/svelte-toast";

	let { children } = $props();
</script>

<svelte:head>
    <title>Zeitspirale</title>
    <link rel="icon" type="image/x-icon" href="favicon.png">
</svelte:head>

{@render children?.()}

<SvelteToast options={{ reversed: true, intro: { x: -20 }, pausable: true }} />

<style>
    :root {
        --toastContainerTop: 10px;
        --toastContainerRight: auto;
        --toastContainerBottom: auto;
        --toastContainerLeft: 10px;
    }
</style>