<script lang="ts">
    import { onMount } from 'svelte';
    import * as d3 from "d3";
    import { TwoTonePseudoColoring } from "$lib/classes/TwoTonePseudoColoring";

    export let values: number[];
    export let width: number = 1000;  // independent width
    export let height: number = 100;
    export let useTwoToneColoring: boolean = false;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;

    function render() {
        if (!context || values.length === 0) return;

        context.clearRect(0, 0, width, height);

        const max = Math.max(...values);
        const min = Math.min(...values);

        const colorScale = d3.scaleSequential(d3.interpolateRdYlBu).domain([max, min]);
        const twoToneColorScale = new TwoTonePseudoColoring(min, max, 10, d3.interpolateRdYlBu, true);

        // Map canvas pixels to data indices
        const scaleX = d3.scaleLinear()
            .domain([0, width])
            .range([0, values.length]);

        for (let x = 0; x < width; x++) {
            // Get the corresponding value index (can be fractional)
            const dataIndex = scaleX(x);

            // If multiple values per pixel -> average them
            const start = Math.floor(dataIndex);
            const end = Math.ceil(scaleX(x + 1));
            let val: number;

            if (end > start) {
                const subset = values.slice(start, end);
                val = d3.mean(subset) ?? values[start];
            } else {
                val = values[Math.min(start, values.length - 1)];
            }

            if (useTwoToneColoring) {
                const color = twoToneColorScale.getColor(val);
                context.fillStyle = color.colorB;
                context.fillRect(x, 0, 1, height);
                context.fillStyle = color.colorA;
                context.fillRect(x, 0, 1, height * (1 - color.ratio));
            } else {
                context.fillStyle = colorScale(val);
                context.fillRect(x, 0, 1, height);
            }
        }
    }

    onMount(() => {
        context = canvas.getContext('2d');
        render();
    });
</script>

<div class="relative w-full" style={`width: ${width}px; height: ${height}px`}>
    <canvas bind:this={canvas} width={width} height={height}></canvas>
</div>
