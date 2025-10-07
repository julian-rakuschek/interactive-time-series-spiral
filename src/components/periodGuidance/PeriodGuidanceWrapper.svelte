<script lang="ts">
    import type {Datasets, PeriodFitness, SpiralRecord} from "$lib/types.js";
    import PeriodGuidanceVisualization from "../../components/periodGuidance/PeriodGuidanceVisualization.svelte";
    import {onDestroy, onMount} from "svelte";
    import {browser} from "$app/environment";
    import {period} from "$lib/stores";

    export let spiral_data: SpiralRecord[];

    let min_period = 3;
    let max_period = Math.floor(spiral_data.length / 2);
    let fitness_values: PeriodFitness[] = [];
    let worker;

    async function initWebWorker() {
        if (!browser || !window.Worker) return;
        const MyWorker = await import('$lib/worker/periodFitness.worker.ts?worker');
        worker = new MyWorker.default();
        const values = spiral_data.map(s => s.value);
        worker.postMessage({data: values, min_period, max_period});
        worker.onmessage = function (e) {
            const worker_data: PeriodFitness = JSON.parse(e.data);
            fitness_values = [...fitness_values, worker_data]
        }
    }

    function reset(data: SpiralRecord[]) {
        if (worker) worker.terminate();
        max_period = Math.floor(data.length / 2);
        initWebWorker()
    }

    function clickAction(p: number) {
        period.set(p);
    }

    onMount(() => {
        reset(spiral_data);
    });

    onDestroy(() => {
        if (worker) worker.terminate()
    })

    $: reset(spiral_data);
</script>

<PeriodGuidanceVisualization click_function={clickAction} width={350} height={30} periodFitnessIndicators={fitness_values} {min_period} {max_period} />
