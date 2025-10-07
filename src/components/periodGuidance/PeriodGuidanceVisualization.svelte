<script lang="ts">
    import {onMount} from 'svelte';
    import * as d3 from "d3";
    import type {PeriodFitness} from "$lib/types";
    import {Icon, Play} from "svelte-hero-icons";

    export let periodFitnessIndicators: PeriodFitness[] = [];
    export let width = 1000;
    export let height = 200;
    export let min_period: number;
    export let max_period: number;
    export let click_function: (period: number) => void;

    let mouse_x = 0;
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;
    let hover_data: { color: string; period: number } | null = null;

    function createPixelPeriodMapping(total_pixels: number, min_period: number, max_period: number) {
        let mapping: [number, number][] = [];
        const width = (max_period - min_period) / total_pixels;
        for (let i = 0; i < total_pixels; i++) {
            const start = min_period + i * width;
            const end = min_period + (i + 1) * width;
            mapping.push([Math.floor(start), Math.floor(end)]);
        }
        mapping[total_pixels - 1][1] = max_period;
        return mapping;
    }

    function initMouse() {
        const pixelToPeriodMapping = createPixelPeriodMapping(width, min_period, max_period);
        const fitnessValues = periodFitnessIndicators.map(p => p.fitness);
        const max = Math.max(...fitnessValues);
        const min = Math.min(...fitnessValues);
        const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([min, max]);
        canvas.onmousemove = (e) => {
            mouse_x = e.clientX - canvas.getBoundingClientRect().left;
            const period_interval = pixelToPeriodMapping[mouse_x];
            const color = getPeriodColor(mouse_x, pixelToPeriodMapping, colorScale);
            if (color === "#eeeee") hover_data = null;
            else hover_data = {color, period: period_interval[0]}
        };
        canvas.onclick = (e) => {
            mouse_x = e.clientX - canvas.getBoundingClientRect().left;
            const period_interval = pixelToPeriodMapping[mouse_x];
            if (click_function) click_function(period_interval[0]);
        }
    }

    function getPeriodColor(pixel: number, pixelToPeriodMapping: [number, number][], colorScale: (v: number) => string) {
        const period_interval = pixelToPeriodMapping[pixel];
        const periodFitness = periodFitnessIndicators.filter(p => p.period >= period_interval[0] && p.period <= period_interval[1]).map(p => p.fitness);
        if (periodFitness.length === 0) {
            return "#eeeeee";
        } else {
            const value = Math.max(...periodFitness)
            return colorScale(value);
        }
    }

    function render() {
        if (!context) return;
        context.clearRect(0, 0, width, height);
        const pixelToPeriodMapping = createPixelPeriodMapping(width, min_period, max_period);
        const fitnessValues = periodFitnessIndicators.map(p => p.fitness);
        const max = Math.max(...fitnessValues);
        const min = Math.min(...fitnessValues);
        const colorScale = d3.scaleSequential(d3.interpolateViridis).domain([max, min]);
        for (let i = 0; i < width; i++) {
            context.fillStyle = getPeriodColor(i, pixelToPeriodMapping, colorScale);
            context.fillRect(i, 0, 1, height);

        }
    }

    function updateProcedure(periodFitnessIndicators: PeriodFitness[], width: number) {
        render();
        if (context) initMouse()
    }

    onMount(() => {
        context = canvas.getContext('2d');
        updateProcedure(periodFitnessIndicators, width);
    })

    $: updateProcedure(periodFitnessIndicators, width);
</script>

<div class="relative w-full" style={`width: ${width}px; height: ${height}px`}>
    <div class="absolute">
        <canvas bind:this={canvas} width={width} height={height}></canvas>
    </div>
    {#if hover_data !== null}
        <div class="absolute" style={`left: ${mouse_x}px`}>
            <div class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
                <Icon src="{Play}" solid class="w-5 h-5 text-indigo-600" style="rotate: 90deg"/>
            </div>
            <div class="text-sm font-bold text-indigo-600 absolute text-center -top-5 -translate-x-1/2 -translate-y-1/2">{hover_data.period}</div>
        </div>
    {/if}
</div>

