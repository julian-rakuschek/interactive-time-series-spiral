<script lang="ts">
    import {period} from "$lib/stores";
    import {onMount} from "svelte";
    import PeriodGuidanceWrapper from "../periodGuidance/PeriodGuidanceWrapper.svelte";
    import type {SpiralRecord} from "$lib/types";
    import PeriodGuidanceLegend from "../periodGuidance/PeriodGuidanceLegend.svelte";

    let custom_period: string | number;
    export let spiral_data: SpiralRecord[];

    function updatePeriod() {
        let digitsOnly = String(custom_period).replace(/\D+/g, "");
        if (digitsOnly === "") return;
        let parsedInt = parseInt(digitsOnly, 10);
        period.set(parsedInt);
    }

    onMount(() => {
        custom_period = $period;
    })

    const period_item_unselected = "rounded-lg shadow-lg text-sm px-2 py-1 bg-white text-black/80 cursor-default transition hover:bg-indigo-100 hover:text-indigo-800"
    const period_item_selected = "rounded-lg shadow-lg text-sm px-2 py-1 bg-indigo-600 text-white transition cursor-default"
</script>

<div class="flex flex-col gap-1">
    <p class="text-xs">The period defines the number of data elements in one ring. Note that this prototype does <b>not</b>
        perform any aggregations. Below we provide a period recommendation:</p>
    <div class="mt-5 mb-2">
        <PeriodGuidanceWrapper {spiral_data} />
    </div>
    <PeriodGuidanceLegend />
    <p class="text-xs">The following are standard periods for a calendar-centric seasonality:</p>
    <div class="flex flex-row justify-around">
        <button on:click={() => period.set(7)} class={$period === 7 ? period_item_selected : period_item_unselected}>7</button>
        <button on:click={() => period.set(12)} class={$period === 12 ? period_item_selected : period_item_unselected}>12</button>
        <button on:click={() => period.set(24)} class={$period === 24 ? period_item_selected : period_item_unselected}>24</button>
        <button on:click={() => period.set(365)}
             class={$period === 365 ? period_item_selected : period_item_unselected}>365
        </button>
    </div>
    <div class={([24, 7, 12, 365].includes($period) ? period_item_unselected : period_item_selected )+ " flex flex-row gap-2 justify-center items-center"}>
        Custom: <input on:keyup={updatePeriod} bind:value={custom_period}
                       class="text-sm border-0 border-b-[1px] border-solid p-0 bg-transparent"/>
    </div>
</div>