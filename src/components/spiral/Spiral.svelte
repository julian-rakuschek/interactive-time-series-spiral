<script lang="ts">
    import {onMount} from "svelte";
    import {Application, ColorMatrixFilter, Graphics} from "pixi.js";
    import {Spiral} from "$lib/classes/Spiral";
    import type {LineChart, Record, SpiralRecord} from "$lib/types";
    import {sector_selection, linecharts, useResiduals} from "$lib/stores";

    export let period: number;
    export let spiral_data: SpiralRecord[];
    export let cutout: number = 0;

    let canvas: HTMLCanvasElement;
    let pixiApp: Application;
    const size = 700;
    export let spiral: Spiral;

    function renderPixi(data: SpiralRecord[], period: number, useZeroCenteredColoring: boolean) {
        if (!pixiApp || !data || data.length === 0) return;
        pixiApp.stage.removeChildren().forEach(child => child.destroy());
        spiral = new Spiral(size, period, data, useZeroCenteredColoring, cutout);
        for (const sector of spiral.sectors) {
            pixiApp.stage.addChild(sector.graphics);
        }
        spiral.visualizeSectors(spiral.sectors);
    }

    function updateLinecharts() {
        if (!spiral) return;
        const linechartsArray: LineChart[] = [];
        let batch: LineChart = {values: [], timestamps: [], indices: [], ring: 0}
        let current_selected = false;
        for (const spiralElement of spiral.sectors) {
            if (spiralElement.selected) {
                current_selected = true;
                batch.values.push(spiralElement.value);
                batch.indices.push(spiralElement.index);
                if (spiralElement.timestamp) batch.timestamps.push(spiralElement.timestamp);
            }
            if (current_selected && !spiralElement.selected || batch.values.length === period) {
                current_selected = false;
                linechartsArray.push(batch)
                batch = {values: [], timestamps: [], indices: [], ring: 0}
            }
        }
        if (batch.values.length > 0) linechartsArray.push(batch);
        for (const lineChart of linechartsArray) {
            const average = lineChart.values.reduce((a, b) => a + b, 0) / lineChart.values.length;
            lineChart.color = spiral.selected_coloring.getColor(average).colorA;
        }
        linecharts.set(linechartsArray);
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
                spiral.addHoverEffectToGraphics(sector);
            }
        }
    }

    function resetSectorColoring(spiral_data: SpiralRecord[], period: number) {
        updateSectorColoring(...$sector_selection, true);
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
        renderPixi(spiral_data, period, $useResiduals);
        updateSectorColoring(...$sector_selection, true);
        updateLinecharts();
    })

    sector_selection.subscribe(s => {
        updateSectorColoring(...s, false);
        updateLinecharts();
    })

    $: {
        renderPixi(spiral_data, period, $useResiduals);
        updateLinecharts();
    }

    $: resetSectorColoring(spiral_data, period);

    useResiduals.subscribe(r => renderPixi(spiral_data, period, r))

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