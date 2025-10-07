<script lang="ts">
    import {onMount} from "svelte";
    import {TwoTonePseudoColoring} from "$lib/classes/TwoTonePseudoColoring";
    import * as d3 from "d3-scale-chromatic";

    export let width = 400;
    export let min = 0;
    export let max = 1;
    export let intervals = 10;
    export let zero_centered = false;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;
    const height = 15;

    function render(min: number, max: number, zero_centered: boolean) {
        if (!context) return;
        const colorGenerator = new TwoTonePseudoColoring(min, max, intervals, d3.interpolateRdYlBu, true, zero_centered)
        context.clearRect(0, 0, width, height);
        const span = Math.abs(min - max);
        const step = span / width;
        for (let i = 0; i < width; i++) {
            const two_tone = colorGenerator.getColor(min + step * i);
            const colorAheight = height - height * two_tone.ratio;
            const colorBheight = height * two_tone.ratio;
            context.fillStyle = two_tone.colorA
            context.fillRect(i, 0, 1, colorAheight);
            context.fillStyle = two_tone.colorB
            context.fillRect(i, colorAheight, 1, colorBheight);
        }
    }

    onMount(() => {
        context = canvas.getContext('2d');
        render(min, max, zero_centered);
    })

    $: render(min, max, zero_centered);

</script>

<div class="grid grid-cols-12 place-items-center">
    <div class="col-span-1">
        {min}
    </div>
    <div class="col-span-10">
        <canvas bind:this={canvas} width={width} height={height}></canvas>
    </div>
    <div class="col-span-1">
        {max}
    </div>
</div>
