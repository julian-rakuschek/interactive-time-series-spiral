<script lang="ts">
    export let selectedQualityMeasure: string = "average";

    const quality_measure_unselected = "rounded-lg shadow-lg text-sm px-2 py-1 bg-white text-black/80 cursor-default transition hover:bg-indigo-100 hover:text-indigo-800"
    const quality_measure_selected = "rounded-lg shadow-lg text-sm px-2 py-1 bg-indigo-600 text-white transition cursor-default"
</script>

<p class="text-sm text-black/80">Selected Quality Measure:</p>
<div class="flex flex-row justify-center gap-4">
    <button on:click={() => selectedQualityMeasure = "average"} class={selectedQualityMeasure === "average" ? quality_measure_selected : quality_measure_unselected}>
        Average
    </button>
    <button on:click={() => selectedQualityMeasure = "trend"} class={selectedQualityMeasure === "trend" ? quality_measure_selected : quality_measure_unselected}>
        Trend
    </button>
    <button on:click={() => selectedQualityMeasure = "mp"} class={selectedQualityMeasure === "mp" ? quality_measure_selected : quality_measure_unselected}>
        Similarities
    </button>
</div>