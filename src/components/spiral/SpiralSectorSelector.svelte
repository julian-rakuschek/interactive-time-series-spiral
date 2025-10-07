<script lang="ts">

    import {onMount} from "svelte";
    import {guidance_sector_selection, sector_selection} from "$lib/stores";
    import {
        angleToCoordinate,
        coordinateAngle,
        coordinateToCircle,
        coordinateToSector
    } from "$lib/helper/sectorSelectionHelper";
    import type {SectorSelectionKnobPositions} from "$lib/types";
    import {Icon, Play} from "svelte-hero-icons";
    import {pushHistoryEntry} from "$lib/helper/historyHelper";

    export let period: number;
    export let size: number;
    const center = size / 2;
    const inner_radius = size / 2 - 20;
    const outer_radius = size / 2 - 10;

    let knob_positions: SectorSelectionKnobPositions = { x_inner: 0, x_outer: 0, y_inner: 0, y_outer: 0 };
    let sector_inner_knob_moving = false;
    let sector_outer_knob_moving = false;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;

    function updateSectorSelection(s: SectorSelectionKnobPositions) {
        sector_selection.set([
            coordinateToSector(s.x_inner, s.y_inner, center, period),
            coordinateToSector(s.x_outer, s.y_outer, center, period)
        ])
    }

    function rescaleSectorSelection(period: number) {
        updateSectorSelection(knob_positions);
    }

    function onMouseMove(e: MouseEvent) {
        const mouse_x = e.clientX - canvas.getBoundingClientRect().left;
        const mouse_y = e.clientY - canvas.getBoundingClientRect().top;
        if (sector_inner_knob_moving) {
            const [x, y] = coordinateToCircle(mouse_x, mouse_y, inner_radius, center);
            knob_positions = {...knob_positions, x_inner: x, y_inner: y};
            updateSectorSelection(knob_positions);
            render(period);
        }
        if (sector_outer_knob_moving) {
            const [x, y] = coordinateToCircle(mouse_x, mouse_y, outer_radius, center);
            knob_positions = {...knob_positions, x_outer: x, y_outer: y};
            updateSectorSelection(knob_positions);
            render(period);
        }
    }

    function onMouseUp() {
        sector_outer_knob_moving = false;
        sector_inner_knob_moving = false;
        pushHistoryEntry();
    }

    function setKnobsToSectors(sector_start: number, sector_end: number) {
        const angle_inner = (sector_start / period + 0.5 / period) * 2 * Math.PI;
        const angle_outer = (sector_end / period + 0.5 / period) * 2 * Math.PI;
        const [x_inner, y_inner] = angleToCoordinate(angle_inner, inner_radius, center);
        const [x_outer, y_outer] = angleToCoordinate(angle_outer, outer_radius, center);
        knob_positions = {x_inner, y_inner, x_outer, y_outer};
        render(period);
    }

    export function resetSelection() {
        setKnobsToSectors(0, period - 1);
        sector_selection.set([0, period - 1])
        render(period);
    }

    function render(period: number) {
        if (!context) return;
        context.clearRect(0, 0, size, size);

        const ring_width = outer_radius - inner_radius;
        const middle = (outer_radius + inner_radius) / 2;

        context.beginPath();
        context.strokeStyle = "#e8eaf6";
        context.lineWidth = ring_width;
        context.arc(center, center, middle, 0, 2 * Math.PI);
        context.stroke();

        context.beginPath();
        context.strokeStyle = "#3949ab";
        context.lineWidth = 1;
        context.arc(center, center, inner_radius, 0, 2 * Math.PI);
        context.stroke();

        context.strokeStyle = "#3949ab";
        context.lineWidth = 1;
        context.arc(center, center, outer_radius, 0, 2 * Math.PI);
        context.stroke();

        for (let i = 0; i < period; i++) {
            const angle = (i / period) * 2 * Math.PI;
            const x1 = center + Math.cos(angle) * (middle - ring_width / 2)
            const y1 = center + Math.sin(angle) * (middle - ring_width / 2)
            const x2 = center + Math.cos(angle) * (middle + ring_width / 2)
            const y2 = center + Math.sin(angle) * (middle + ring_width / 2)
            context.moveTo(x1, y1);
            context.lineTo(x2, y2);
            context.stroke();
        }

        context.beginPath();
        context.strokeStyle = "#304ffe";
        context.lineWidth = 3;
        context.moveTo(center, center);
        context.lineTo(knob_positions.x_inner, knob_positions.y_inner);
        context.stroke();
        context.moveTo(center, center);
        context.lineTo(knob_positions.x_outer, knob_positions.y_outer);
        context.stroke();
    }

    onMount(() => {
        context = canvas.getContext('2d');
        resetSelection();
    })

    guidance_sector_selection.subscribe(s => {
        setKnobsToSectors(...s);
        render(period);
    })

    $: render(period);

    $: rescaleSectorSelection(period);
</script>

<div class="relative" style="width: {size}px; height: {size}px">
    <div class="absolute">
        <canvas class="noselect" bind:this={canvas} width={size} height={size}></canvas>
    </div>
    <div
            role="button" tabindex="0"
            on:mousedown={() => sector_inner_knob_moving = true}
            style="left: {knob_positions.x_inner}px; top: {knob_positions.y_inner}px; pointer-events: all"
            class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
        <Icon src="{Play}" solid class="w-5 h-5 text-indigo-600"
              style="rotate: {coordinateAngle(knob_positions.x_inner, knob_positions.y_inner, center) / (Math.PI * 2) * 360}deg"
        />
    </div>
    <div
            role="button" tabindex="0"
            on:mousedown={() => sector_outer_knob_moving = true}
            style="left: {knob_positions.x_outer}px; top: {knob_positions.y_outer}px;  pointer-events: all"
            class="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2">
        <Icon src="{Play}" solid class="w-5 h-5 text-indigo-600"
              style="rotate: {coordinateAngle(knob_positions.x_outer, knob_positions.y_outer, center) / (Math.PI * 2) * 360 + 180}deg"
        />
    </div>
</div>


<svelte:window on:mouseup={onMouseUp} on:mousemove={onMouseMove} />

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