<script lang="ts">
    import {selected_spiral_element} from "$lib/stores";

    let arena: HTMLDivElement;
    let mouse_x = -1;
    let mouse_y = -1;

    function onMouseMove(e) {
        if (!arena) return;
        mouse_x = e.clientX - arena.getBoundingClientRect().left + 10;
        mouse_y = e.clientY - arena.getBoundingClientRect().top + 10;
    }

</script>

<div class="w-full h-full relative overflow-visible" bind:this={arena}>
    {#if mouse_x !== -1 && mouse_y !== -1 && $selected_spiral_element !== null}
        <div class="bg-indigo-100/80 text-indigo-800 border-2 border-solid border-indigo-800 p-3 rounded-lg absolute min-w-[140px]" style="top: {mouse_y}px; left: {mouse_x}px">
            <p>{$selected_spiral_element.value.toFixed(2)}</p>
            {#if $selected_spiral_element.timestamp}
                <p class="text-xs">{$selected_spiral_element.timestamp.toLocaleString()}</p>
            {/if}
        </div>
    {/if}
</div>

<svelte:window on:mousemove={onMouseMove} />