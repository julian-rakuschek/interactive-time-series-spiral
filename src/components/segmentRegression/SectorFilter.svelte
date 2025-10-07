<script lang="ts">
    import SegmentRegression from "./SegmentRegression.svelte";
    import {activeSectorFilter} from "$lib/stores";
    import {SectorFilters} from "$lib/types";

    export let values: number[] = [];

    const item_unselected = "rounded-lg shadow-lg text-sm px-2 py-1 bg-white text-black/80 cursor-default transition hover:bg-indigo-100 hover:text-indigo-800"
    const item_selected = "rounded-lg shadow-lg text-sm px-2 py-1 bg-indigo-600 text-white transition cursor-default"

    function updateFilterSelection(target: SectorFilters) {
        if ($activeSectorFilter === target) activeSectorFilter.set(SectorFilters.NONE);
        else  activeSectorFilter.set(target);
    }

</script>
<div class="w-full flex flex-row items-center justify-center">
    <button on:click={() => updateFilterSelection(SectorFilters.REG)}
            class={$activeSectorFilter === SectorFilters.REG ? item_selected : item_unselected}>Apply Linear Regression Model
    </button>
</div>

<div class="w-2/3 mx-auto">
    {#if $activeSectorFilter === SectorFilters.REG}
        <SegmentRegression {values} />
    {/if}
</div>
