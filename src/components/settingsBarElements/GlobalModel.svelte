<script lang="ts">
    import type {SpiralRecord} from "$lib/types";
    import {onMount} from "svelte";
    import {useResiduals} from "$lib/stores"
    import {computeModelParameters} from "$lib/helper/globalRegression";

    export let period: number;
    export let spiral_data: SpiralRecord[];

    let parameters: number[] | null = null;

    function updateParameters(spiral_data: SpiralRecord[], period: number) {
        parameters = null;
        const values = spiral_data.map(s => s.value);
        parameters = computeModelParameters(values, period);
    }

    onMount(() => {
        updateParameters(spiral_data, period);
    })

    $: updateParameters(spiral_data, period);

</script>
<div class="flex flex-col gap-2">
    <p class="text-xs">The following model is a simplistic way to describe global periodicity within the time series:</p>
    <div class="font-mono bg-gray-200 text-gray-700 text-xs rounded-lg p-2">
        m(x) = (a + b * x) + (c + d * x) * cos(2 * PI * x + e)
    </div>
    <p class="text-xs">To fit the model, we assume that each d-period corresponds to a delta-t of 1. </p>

    {#if parameters !== null}
        <div class="font-mono bg-gray-200 text-gray-700 text-xs rounded-lg p-2">
            f(x) = (<span class="text-red-500">{parameters[0]}</span> + <span class="text-purple-500">{parameters[1]}</span> * x) + (<span class="text-blue-500">{parameters[2]}</span> + <span class="text-green-500">{parameters[3]}</span> * x) * cos(2 * PI * x + <span class="text-orange-500">{parameters[4]}</span>)
        </div>
        <div class="grid grid-cols-2 text-sm">
            <p class="font-bold text-sm col-span-2">Human Readable Format:</p>
            <p>Trend Intercept (a):</p><p class="text-red-500">{parameters[0].toFixed(3)}</p>
            <p>Trend Gradient (b):</p><p class="text-purple-500">{parameters[1].toFixed(3)}</p>
            <p>Amplitude Intercept (c):</p><p class="text-blue-500">{parameters[2].toFixed(3)}</p>
            <p>Amplitude Gradient (d):</p><p class="text-green-500">{parameters[3].toFixed(3)}</p>
            <p>Phase Shift (e):</p><p class="text-orange-500">{parameters[4].toFixed(3)}</p>
        </div>
        <p class="text-xs">By checking the box below, the residuals of the fitted model will be used instead of the original data. This can be used to explore hidden details possibly obscured by the main periodic seasonaility.</p>
        <div class="flex flex-row gap-2 items-center">
            <input type="checkbox" class="focus:ring-0" bind:checked={$useResiduals} />
            <p class="text-sm font-bold">Use residuals instead of original data</p>
        </div>
    {:else}
        Computing ...
    {/if}
</div>
