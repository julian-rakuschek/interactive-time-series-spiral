<script lang="ts">
    import type {SectorQualityMeasure, SpiralElementBase, SpiralRecord, WorkerWithStatus} from "$lib/types";
    import SpiralGuidanceDonut from "./SpiralGuidanceDonut.svelte";
    import {QualityMeasureDataManager} from "$lib/classes/QualityMeasureDataManager";
    import {onDestroy, onMount} from "svelte";
    import {browser} from "$app/environment";
    import {Spiral} from "$lib/classes/Spiral";
    import {guidanceLabels} from "$lib/stores"

    export let spiral_data: SpiralRecord[] = [];
    export let period: number;
    export let size: number = 200;
    const rings = 5;
    export let selectedQualityMeasure: string = "average";

    let qmdm: QualityMeasureDataManager;

    const workers: { [qualityMeasure: string]: WorkerWithStatus } = {};
    let colors: { [qualityMeasure: string]: string[][] } = {};

    async function initWebWorker(period: number, qualityMeasure: string, spiral_data: SpiralRecord[]) {
        if (!browser || !window.Worker) return;

        const spiral = new Spiral(700, period, spiral_data);
        const MyWorker = await import('$lib/worker/qualitymeasures.worker?worker');
        const worker = new MyWorker.default();
        workers[qualityMeasure] = {worker: worker, running: false, progress: 0, computed_sectors: 0};
        colors[qualityMeasure] = [];
        const data: SpiralElementBase[] = spiral.sectors.map(s => ({period: s.period, ring: s.ring, value: s.value}));
        worker.postMessage({period: period, rings: rings, spiral_data: [...data], quality_measure: qualityMeasure});
        workers[qualityMeasure].running = true;
        worker.onmessage = function (e) {
            const worker_data: SectorQualityMeasure[] = JSON.parse(e.data);
            for (const workerDatum of worker_data) qmdm.addDataElement(workerDatum)
            colors[qualityMeasure] = qmdm.getColorArray(qualityMeasure)
            workers[qualityMeasure].computed_sectors += worker_data.length
            workers[qualityMeasure].progress = workers[qualityMeasure].computed_sectors / (period * period);
            if (workers[qualityMeasure].progress === 1) workers[qualityMeasure].running = false;
            if (selectedQualityMeasure === qualityMeasure) guidanceLabels.set(qmdm.getMinMaxLabels(selectedQualityMeasure));
        };
    }

    function terminateWorker() {
        Object.keys(workers).forEach(qm => {
            if (workers[qm].worker) {
                workers[qm].worker.terminate();
                workers[qm].running = false;
            }
        })
    }

    async function reset(period: number, spiral_data: SpiralRecord[]) {
        Object.keys(workers).forEach(qm => {
            workers[qm].progress = 0;
            workers[qm].computed_sectors = 0;
        })
        terminateWorker();
        qmdm = new QualityMeasureDataManager(period, rings);
        await initWebWorker(period, "average", spiral_data);
        await initWebWorker(period, "trend", spiral_data);
        await initWebWorker(period, "mp", spiral_data);
    }

    onDestroy(() => {
        terminateWorker();
    });

    onMount(() => {
        reset(period, spiral_data)
    })

    $: reset(period, spiral_data);

    $: guidanceLabels.set(qmdm.getMinMaxLabels(selectedQualityMeasure));
</script>


<div style="width: {size}px; height: {size}px">
    <SpiralGuidanceDonut {period} {size} {rings} colors={colors[selectedQualityMeasure]} />
</div>