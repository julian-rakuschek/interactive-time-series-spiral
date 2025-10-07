<script lang="ts">
    import {createColorsArray} from "$lib/helper/colorHelper";
    import {interpolatePlasma} from "d3-scale-chromatic";
    import {guidanceLabels} from "$lib/stores";

    const color_gradient = `linear-gradient(90deg, ${
        createColorsArray(20, {start: 0, end: 1, reverse: false, interpolateFunc: interpolatePlasma}).join(", ")
    })`;

    let left_text: string = "";
    let right_text: string = "";

    guidanceLabels.subscribe(g => {
        left_text = g[0];
        right_text = g[1];
    })
</script>

<div class="grid grid-cols-12 place-items-center w-1/2 mx-auto">
    <span class="text-sm text-gray-700 col-span-3">{left_text}</span>
    <div class="w-full h-[10px] col-span-6" style={`background: ${color_gradient}`}></div>
    <span class="text-sm text-gray-700 col-span-3">{right_text}</span>
</div>