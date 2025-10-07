<script lang="ts">
    import {onMount} from "svelte";
    import {Application, ColorMatrixFilter, Graphics} from "pixi.js";
    import {Spiral} from "$lib/classes/Spiral";
    import type {LineChart, Record, SpiralRecord} from "$lib/types";

    export let period: number;
    export let spiral_data: SpiralRecord[];
    export let sector_selection: [number, number];
    export let size = 700;
    export let ringWidthMultiplier: number = 1;
    export let cutout: number = 0;

    let canvas: HTMLCanvasElement;
    let pixiApp: Application;
    let spiral: Spiral;

    function renderPixi(data: SpiralRecord[], period: number) {
        if (!pixiApp || !data || data.length === 0) return;
        pixiApp.stage.removeChildren().forEach(child => child.destroy());
        spiral = new Spiral(size, period, data, false, cutout, ringWidthMultiplier);
        for (const sector of spiral.sectors) {
            pixiApp.stage.addChild(sector.graphics);
        }
        spiral.visualizeSectors(spiral.sectors, false);
    }


    function sectorInInterval(sector_to_check: number, sector_start: number, sector_end: number, period: number) {
        let current_sector = sector_start;
        if (current_sector == sector_to_check) return true;
        let safety_count = 0;
        while (current_sector !== sector_end) {
            current_sector = (current_sector + 1) % period;
            if (current_sector == sector_to_check) return true;
            safety_count++;
            if (safety_count > period) break;
        }
        return false;
    }

    function updateSectorColoring(sector_start: number, sector_end: number, brute: boolean) {
        if (!spiral) return;
        for (const sector of spiral.sectors) {
            const new_selected_status = sectorInInterval(sector.period, sector_start, sector_end, period);
            if (sector.selected !== new_selected_status || brute) {
                sector.selected = new_selected_status;
                const color = new_selected_status ? spiral.selected_coloring.getColor(sector.value) : spiral.unselected_coloring.getColor(sector.value);
                spiral.visualizeSpiralSector(sector, color)
            }
        }
    }


    onMount(async () => {
        pixiApp = new Application();
        await pixiApp.init({
            canvas: canvas,
            width: size,
            height: size,
            backgroundColor: "white",
            antialias: true,
            preserveDrawingBuffer: true
        })
        renderPixi(spiral_data, period);
        updateSectorColoring(...sector_selection, true);
    })

    $: {
        renderPixi(spiral_data, period);
        updateSectorColoring(...sector_selection, true);
    }

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