<script lang="ts">
    import BasicLineChart from "./linechart/BasicLineChart.svelte";
    import {linecharts, period} from "$lib/stores";
    import StackedLineChart from "./linechart/StackedLineChart.svelte";
    import StackedHeatmaps from "./stackedHeatmap/StackedHeatmaps.svelte";
    import {activeSectorFilter} from "$lib/stores";
    import {type LineChart, SectorFilters} from "$lib/types";
    import {
        applyRegression,
        computeRegressionWithIndices,
        getLineChartMinMax
    } from "$lib/helper/util";
    import {onMount} from "svelte";
    import TwoToneColorLegendSimple from "./legend/TwoToneColorLegendSimple.svelte";
    import {TwoTonePseudoColoring} from "$lib/classes/TwoTonePseudoColoring";
    import * as d3 from "d3-scale-chromatic";

    const item_unselected = "rounded-lg shadow-lg text-sm px-2 py-1 bg-white text-black/80 cursor-default transition hover:bg-indigo-100 hover:text-indigo-800"
    const item_selected = "rounded-lg shadow-lg text-sm px-2 py-1 bg-indigo-600 text-white transition cursor-default"

    let visualization = "stackedHeatmaps";

    export let min = 0;
    export let max = 1;
    let filter_min = 0;
    let filter_max = 1;
    export let dataLength: number;

    let linechartData: LineChart[] = []

    function applySectorFilter(lineCharts: LineChart[], sectorFilter: SectorFilters) {
        let data = JSON.parse(JSON.stringify(lineCharts));
        if (sectorFilter === SectorFilters.REG) {
            const active_indices = lineCharts.flatMap(lc => lc.indices);
            const lineChartValues = lineCharts.flatMap(lc => lc.values);
            const regressionResult = computeRegressionWithIndices(lineChartValues, active_indices)
            data = applyRegression(data, regressionResult);
        }
        [filter_min, filter_max] = getLineChartMinMax(data);
        const coloring = new TwoTonePseudoColoring(filter_min, filter_max, 10, d3.interpolateRdYlBu, true, true);
        if (sectorFilter === SectorFilters.REG) {
            for (let i = 0; i < data.length; i++) {
                const average = data[i].values.reduce((a: number, b: number) => a + b, 0) / data[i].values.length;
                data[i].color = coloring.getColor(average).colorA;
            }
        }
        return data;
    }

    onMount(() => {
        linechartData = applySectorFilter($linecharts, $activeSectorFilter)
    })

    linecharts.subscribe(l => linechartData = applySectorFilter(l, $activeSectorFilter))
    activeSectorFilter.subscribe(s => linechartData = applySectorFilter($linecharts, s))

</script>

<p class="font-semibold text-center">Time Series within Selected Sector</p>
<p class="text-sm text-center">
    Each time series represents data from one ring within the selected sector.
</p>
<div class="flex flex-row justify-center gap-2 my-2">
    <button on:click={() => visualization = "stackedHeatmaps"}
            class={visualization === "stackedHeatmaps" ? item_selected : item_unselected}>Stacked Heatmaps
    </button>
    <button on:click={() => visualization = "stackedLinecharts"}
            class={visualization === "stackedLinecharts" ? item_selected : item_unselected}>Stacked Linecharts
    </button>
    <button on:click={() => visualization = "separateLinecharts"}
            class={visualization === "separateLinecharts" ? item_selected : item_unselected}>Separate Linecharts
    </button>
</div>
{#if $activeSectorFilter !== SectorFilters.NONE}
    <div class="text-sm text-black/80 text-center">
        {#if $activeSectorFilter === SectorFilters.REG}Showing residuals of fitted regression model{/if}
        <button class="underline decoration-dashed hover:text-black/95" on:click={() => activeSectorFilter.set(SectorFilters.NONE)}>(Deactivate)</button>
    </div>
    <div class="w-[300px] mx-auto">
        <TwoToneColorLegendSimple width={200} min={Number.parseFloat(filter_min.toFixed(2))} max={Number.parseFloat(filter_max.toFixed(2))} zero_centered={true} />
    </div>
{/if}
{#if visualization === "stackedHeatmaps"}
    {#key [dataLength, $period]}
        <div class="grid place-items-center">
            <StackedHeatmaps {min} {max} {dataLength} {linechartData} sectorFilterActive={$activeSectorFilter !== SectorFilters.NONE}/>
        </div>
    {/key}
{/if}
{#if visualization === "stackedLinecharts"}
    <StackedLineChart linecharts={linechartData}/>
{/if}
{#if visualization === "separateLinecharts"}
    <p class="text-xs">
        The top time series corresponds to the inner-most spiral ring while the bottom
        time series corresponds to the outer-most ring,
        thus transitioning chronologically through the rings.
    </p>
    {#each linechartData as lc}
        <BasicLineChart values={lc.values} color={lc.color}/>
    {/each}
{/if}

