<script lang="ts">
    import {onMount, tick} from "svelte";
    import {period, selected_stacked_heatmap_element} from "$lib/stores";
    import {type LineChart, SectorFilters, type TwoToneColor} from "$lib/types";
    import {TwoTonePseudoColoring} from "$lib/classes/TwoTonePseudoColoring";
    import * as d3 from "d3-scale-chromatic";
    import {getLineChartMinMax} from "$lib/helper/util";
    import StackedHeatmapHover from "./StackedHeatmapHover.svelte";

    export let min = 0;
    export let max = 1;
    export let dataLength: number;
    export let linechartData: LineChart[] = [];
    export let sectorFilterActive: boolean;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;

    let rows: number = 1;
    let intervals = 10;
    const width = 500;
    const rowHeight = 30;

    function drawRawCanvas(lineCharts: LineChart[], sectorFilterActive: boolean) {
        if (!context) return;
        let [lcMin, lcMax] = [min, max];
        if (sectorFilterActive) [lcMin, lcMax] = getLineChartMinMax(lineCharts);
        const colorGenerator = new TwoTonePseudoColoring(lcMin, lcMax, intervals, d3.interpolateRdYlBu, true, sectorFilterActive)
        const max_row_len = Math.max(...lineCharts.map(l => l.values.length))
        const emptyColor: TwoToneColor = {colorA: "white", colorB: "white", ratio: 0};
        context.clearRect(0, 0, width, rows * rowHeight);

        for (let rowIdx = 0; rowIdx < lineCharts.length; rowIdx++) {
            const lc = lineCharts[rowIdx];
            const rowBase = rowIdx * rowHeight;
            for (let colIdx = 0; colIdx < max_row_len; colIdx++) {
                let color;
                if (rowIdx === 0) {
                    const offset = colIdx - max_row_len + lc.values.length;
                    color = offset >= 0 ? colorGenerator.getColor(lc.values[offset]) : emptyColor;
                } else {
                    color = colIdx < lc.values.length ? colorGenerator.getColor(lc.values[colIdx]) : emptyColor;
                }
                context.fillStyle = color.colorB
                context.fillRect(colIdx / max_row_len * width, rowBase, width / max_row_len, rowHeight - 5)
                context.fillStyle = color.colorA
                context.fillRect(colIdx / max_row_len * width, rowBase, width / max_row_len, (rowHeight - 5) * (1 - color.ratio))
            }
        }
    }

    function mouseToValue(lineCharts: LineChart[], mouse_x: number, mouse_y: number): [number | null, Date | undefined] {
        const max_row_len = Math.max(...lineCharts.map(l => l.values.length))
        const rowIdx = Math.floor(mouse_y / (rows * rowHeight) * rows)
        const lc = lineCharts[rowIdx];
        if (!lc) return [null, undefined];
        const colIdx = Math.floor(mouse_x / width * max_row_len);
        let value = null;
        let timestamp = undefined;
        if (rowIdx === 0) {
            const offset = colIdx - max_row_len + lc.values.length;
            if (offset >= 0) value = lc.values[offset];
            if (offset >= 0 && offset < lc.timestamps.length) timestamp = lc.timestamps[offset];
        } else {
            if (colIdx < lc.values.length) value = lc.values[colIdx];
            if (colIdx < lc.timestamps.length) timestamp = lc.timestamps[colIdx];
        }
        return [value, timestamp];
    }

    function initMouse() {
        canvas.onmousemove = (e) => {
            const mouse_x = e.clientX - canvas.getBoundingClientRect().left;
            const mouse_y = e.clientY - canvas.getBoundingClientRect().top;
            const [value, timestamp] = mouseToValue(linechartData, mouse_x, mouse_y);
            selected_stacked_heatmap_element.set(value !== null ? {value, timestamp} : null)
        };
    }

    onMount(async () => {
        rows = Math.ceil(dataLength / $period) + 1;
        context = canvas.getContext('2d');
        await tick()
        drawRawCanvas(linechartData, sectorFilterActive)
        initMouse();
    })


    $: drawRawCanvas(linechartData, sectorFilterActive)


</script>

<div style="width: {width}px; height: {rows * rowHeight}px" class="relative">
    <canvas on:mouseleave={() => selected_stacked_heatmap_element.set(null)} bind:this={canvas} width={width} height={rows * rowHeight} class="absolute noselect"></canvas>
    <div class="absolute top-0 left-0 pointer-events-none" style="width: {width}px; height: {rows * rowHeight}px" >
        <StackedHeatmapHover />
    </div>
</div>

<style>
    .noselect {
        -webkit-touch-callout: none !important;
        -webkit-user-select: none !important;
        -webkit-user-drag: none !important;
        -khtml-user-select: none !important;
        -moz-user-select: none !important;
        -ms-user-select: none !important;
        user-select: none !important;
    }
</style>
