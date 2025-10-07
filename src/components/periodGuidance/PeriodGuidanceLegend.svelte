<script lang="ts">
    import {createColorsArray} from "$lib/helper/colorHelper";
    import {interpolateViridis} from "d3-scale-chromatic";

    const color_gradient = `linear-gradient(90deg, ${
        createColorsArray(20, {start: 0, end: 1, reverse: false, interpolateFunc: interpolateViridis}).join(", ")
    })`;

    let left_text: string = "Unsuitable";
    let right_text: string = "Suitable";

</script>

<div class="grid grid-cols-12 place-items-center mx-auto gap-2">
    <span class="text-xs text-gray-700 col-span-3">{left_text}</span>
    <div class="w-full h-[10px] col-span-6" style={`background: ${color_gradient}`}></div>
    <span class="text-xs text-gray-700 col-span-3">{right_text}</span>
</div>