<script lang="ts">
    import {Application} from "pixi.js";
    import {CircularHeatmap} from "$lib/classes/CircularHeatmap";
    import {onMount} from "svelte";
    import {guidance_sector_selection, sector_selection} from "$lib/stores";
    import type {SectorQualityMeasure} from "$lib/types";

    export let period: number;
    export let size = 300;
    export let rings = 5;
    export let colors: string[][] = []
    export let interactive: boolean = true;

    let canvas: HTMLCanvasElement;
    let pixiApp: Application;
    let heatmap: CircularHeatmap;

    function getRelativeMousePos(e: MouseEvent) {
        const mouse_x = e.clientX - canvas.getBoundingClientRect().left;
        const mouse_y = e.clientY - canvas.getBoundingClientRect().top;
        return [mouse_x, mouse_y];
    }

    function initMouse() {
        canvas.onmousemove = (e) => {
            const [mouse_x, mouse_y] = getRelativeMousePos(e);
            const selected_sectors = heatmap.renderMouseHover(mouse_x, mouse_y);
            if (selected_sectors) sector_selection.set(selected_sectors as [number, number])
            heatmap.renderCurrentSelection($guidance_sector_selection[0], $guidance_sector_selection[1])
        };
        canvas.onmousedown = (e) => {
            const [mouse_x, mouse_y] = getRelativeMousePos(e);
            const selected_sectors = heatmap.renderMouseHover(mouse_x, mouse_y);
            if (selected_sectors) guidance_sector_selection.set(selected_sectors as [number, number])
            heatmap.renderCurrentSelection($guidance_sector_selection[0], $guidance_sector_selection[1])
        }
        canvas.onmouseenter = (e) => {
            guidance_sector_selection.set($sector_selection)
        }
        canvas.onmouseleave = (e) => {
            sector_selection.set($guidance_sector_selection)
            heatmap.renderCurrentSelection($guidance_sector_selection[0], $guidance_sector_selection[1])
            heatmap.clearMouseHover()
        }
    }

    sector_selection.subscribe(g => {
        if (heatmap) heatmap.renderCurrentSelection(g[0], g[1])
    })

    function resetHeatmap(period: number) {
        if (!pixiApp) return;
        heatmap = new CircularHeatmap(pixiApp, size, period, rings);
        if (interactive) initMouse();
        heatmap.renderDonut(colors);
    }

    function render(colors: string[][]) {
        if (!heatmap) return;
        heatmap.renderDonut(colors);
    }

    onMount(async () => {
        pixiApp = new Application();
        await pixiApp.init({
            canvas: canvas,
            width: size,
            height: size,
            backgroundAlpha: 0,
            antialias: true
        })
        resetHeatmap(period);
    })

    $: render(colors);

    $: resetHeatmap(period)
</script>

<canvas bind:this={canvas} width={size} height={size} class="noselect"></canvas>

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