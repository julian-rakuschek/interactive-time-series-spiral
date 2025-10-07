<script lang="ts">
    import {onMount} from "svelte";

    export let width = 400;
    export let height = 10;
    export let displayedIndices: number[] = [];
    export let maxIndex: number;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;

    function render(displayedIndices: number[], maxIndex: number) {
        if (!context) return;
        context.clearRect(0, 0, width, height);
        for (let i = 0; i < width; i++) {
            const index = Math.ceil(i / width * maxIndex);
            context.fillStyle = displayedIndices.includes(index) ? "#304ffe" : "#c5cae9"
            context.fillRect(i, 0, 1, height);
        }
    }

    onMount(() => {
        context = canvas.getContext('2d');
        render(displayedIndices, maxIndex);
    })

    $: render(displayedIndices, maxIndex);

</script>

<canvas bind:this={canvas} width={width} height={height}></canvas>