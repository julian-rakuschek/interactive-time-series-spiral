<script lang="ts">
    import {
        type HistoryRecord,
        type LineChart,
        SectorFilters,
        type SpiralElementBase,
        type SpiralRecord
    } from "$lib/types";
    import SpiralStatic from "../spiral/SpiralStatic.svelte";
    import {Icon, Trash} from "svelte-hero-icons";
    import StackedLineChart from "../linechart/StackedLineChart.svelte";
    import {getSectorData} from "$lib/helper/sectorSelectionHelper";
    import {applyRegression, computeRegressionWithIndices, getLineChartMinMax} from "$lib/helper/util";
    import {TwoTonePseudoColoring} from "$lib/classes/TwoTonePseudoColoring";
    import * as d3 from "d3-scale-chromatic";

    export let historyRecord: HistoryRecord;
    export let spiral_data: SpiralRecord[] = [];

    function spiralDataToLinecharts(historyRecord: HistoryRecord, spiral_data: SpiralRecord[]) {
        const sectorData = getSectorData(spiral_data as SpiralElementBase[], historyRecord.selectedSector[0], historyRecord.selectedSector[1], historyRecord.period);
        let linecharts: LineChart[] = [];
        for (let i = 0; i < sectorData.ts.length; i++) {
            const ts = sectorData.ts[i];
            const indices = sectorData.indices[i];
            const lc: LineChart = {
                values: ts,
                indices: indices,
                ring: i,
                timestamps: []
            }
            linecharts.push(lc)
        }
        if (historyRecord.sectorFilter === SectorFilters.REG) {
            const active_indices = linecharts.flatMap(lc => lc.indices);
            const lineChartValues = linecharts.flatMap(lc => lc.values);
            const regressionResult = computeRegressionWithIndices(lineChartValues, active_indices)
            linecharts = applyRegression(linecharts, regressionResult);
        }
        const [filter_min, filter_max] = getLineChartMinMax(linecharts);
        const coloring = new TwoTonePseudoColoring(filter_min, filter_max, 10, d3.interpolateRdYlBu, true, historyRecord.sectorFilter === SectorFilters.REG);
        for (let i = 0; i < linecharts.length; i++) {
            const average = linecharts[i].values.reduce((a: number, b: number) => a + b, 0) / linecharts[i].values.length;
            linecharts[i].color = coloring.getColor(average).colorA;
        }
        return linecharts;
    }

    export let linechartData = spiralDataToLinecharts(historyRecord, spiral_data);

    export let onDelete: () => void;

    $: linechartData = spiralDataToLinecharts(historyRecord, spiral_data);
</script>

<div class="shadow-lg rounded-2xl p-3 flex flex-col relative">
    <SpiralStatic size={400} {spiral_data} period={historyRecord.period} sector_selection={historyRecord.selectedSector} />
    <StackedLineChart linecharts={linechartData} />
    <table class="w-full text-left text-sm">
        <tbody>
        <tr class="bg-gray-50">
            <td class="font-bold px-4 py-2">Dataset</td>
            <td class="px-4 py-2">{historyRecord.dataset}</td>
        </tr>
        <tr class="bg-white">
            <td class="font-bold px-4 py-2">Channel</td>
            <td class="px-4 py-2">{historyRecord.channel}</td>
        </tr>
        <tr class="bg-gray-50">
            <td class="font-bold px-4 py-2">Period</td>
            <td class="px-4 py-2">{historyRecord.period}</td>
        </tr>
        <tr class="bg-white">
            <td class="font-bold px-4 py-2">Selected Sector</td>
            <td class="px-4 py-2">{historyRecord.selectedSector[0]} to {historyRecord.selectedSector[1]}</td>
        </tr>
        <tr class="bg-gray-50">
            <td class="font-bold px-4 py-2">Global Regression</td>
            <td class="px-4 py-2">{historyRecord.useResiduals ? "Yes" : "No"}</td>
        </tr>
        <tr class="bg-white">
            <td class="font-bold px-4 py-2">Local Regression</td>
            <td class="px-4 py-2">{historyRecord.sectorFilter === SectorFilters.REG ? "Yes" : "No"}</td>
        </tr>
        </tbody>
    </table>
    <button class="absolute top-5 right-5 cursor-default " on:click={onDelete}>
        <Icon src="{Trash}" class="w-7 h-7 p-0.5 rounded-full transition border-2 border-transparent hover:border-black bg-primary-background/80" />
    </button>
</div>
