<script lang="ts">
    import {onMount} from "svelte";
    import {TwoTonePseudoColoring} from "$lib/classes/TwoTonePseudoColoring";
    import * as d3 from "d3-scale-chromatic";
    import {selected_spiral_element} from "$lib/stores";

    export let width = 400;
    export let min = 0;
    export let max = 1;
    export let intervals = 10;
    export let zero_centered = false;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;
    const height = 30;
    let mouse_x = -1;

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

    function getTwoToneColorAtMousePos(mouse_x: number, min: number, max: number) {
        const colorGenerator = new TwoTonePseudoColoring(min, max, intervals, d3.interpolateRdYlBu, true, zero_centered)
        const value = (mouse_x / width) * Math.abs(min - max) + min
        return {...colorGenerator.getColor(value), value}
    }

    function initMouse() {
        canvas.onmousemove = (e) => {
            mouse_x = e.clientX - canvas.getBoundingClientRect().left;
        };
    }

    selected_spiral_element.subscribe(d => {
        if (d) {
            const normalized = (d.value - min) / (max - min);
            mouse_x = normalized * width;
        } else {
            mouse_x = -1;
        }
    })

    onMount(() => {
        context = canvas.getContext('2d');
        render(min, max, zero_centered);
        initMouse();
    })

    $: render(min, max, zero_centered);

</script>

<div class="grid grid-cols-12 place-items-center">
    <div class="col-span-1">
        {min.toFixed(2)}
    </div>
    <div class="col-span-10">
        <canvas on:mouseleave={() => mouse_x = -1} bind:this={canvas} width={width} height={height}></canvas>
    </div>
    <div class="col-span-1">
        {max.toFixed(2)}
    </div>
</div>


<div class="relative w-full" style={`width: ${width}px;`}>
    {#if mouse_x !== -1}
        {@const color = getTwoToneColorAtMousePos(mouse_x, min, max)}
        <div class="absolute bg-indigo-800 w-[20px] h-[20px] -translate-x-1/2 rotate-45"
             style={`left: ${mouse_x}px`}></div>
        <div class="absolute mt-1 p-3 bg-white rounded-md shadow-xl -translate-x-1/2 border-2 border-solid border-indigo-800 flex flex-row items-center justify-center gap-2"
             style={`left: ${mouse_x}px`}>
            <div class="text-nowrap text-sm">{color.value.toFixed(2)} = </div>
            <div class="flex flex-col h-5 w-5">
                <div style={`flex-basis: ${(1 - color.ratio) * 100}%; background-color: ${color.colorA}`}></div>
                <div style={`flex-basis: ${color.ratio * 100}%; background-color: ${color.colorB}`}></div>
            </div>
        </div>
    {/if}
</div>