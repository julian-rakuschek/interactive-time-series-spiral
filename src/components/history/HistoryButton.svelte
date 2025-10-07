<script lang="ts">
    import {Icon, ArchiveBox, XMark} from "svelte-hero-icons";
    import { fly } from 'svelte/transition'
    import HistoryList from "./HistoryList.svelte";
    import type {Datasets} from "$lib/types";

    export let datasets: Datasets;
    let historyOpen = false;
</script>

<button on:click={() => historyOpen = true} class="fixed right-5 bottom-5 bg-gray-200 text-black/80 z-50 flex flex-row gap-2 py-2 px-4 rounded-2xl cursor-default hover:bg-gray-300 transition">
    <Icon src="{ArchiveBox}" class="w-7 h-7"/>
    <span>History</span>
</button>

{#if historyOpen}
    <div class="fixed top-0 left-0 w-full h-full bg-white z-50" in:fly={{ y: -500, duration: 400 }} out:fly={{ y: -500, duration: 400 }}>
        <button class="absolute top-5 right-5 cursor-default " on:click={() => historyOpen = false}>
            <Icon src="{XMark}" class="w-14 h-14 rounded-full transition border-2 border-transparent hover:border-black bg-primary-background/80" />
        </button>
        <HistoryList {datasets} close={() => historyOpen = false} />
    </div>
{/if}
