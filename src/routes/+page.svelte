<script lang="ts">
    import Spiral from "../components/spiral/Spiral.svelte";
    import TwoToneColorLegend from "../components/legend/TwoToneColorLegend.svelte";
    import type {Datasets, SpiralRecord} from "$lib/types";
    import {onMount} from "svelte";
    import SpiralSectorSelector from "../components/spiral/SpiralSectorSelector.svelte";
    import SectorLinkedView from "../components/SectorLinkedView.svelte";
    import {datasets, period, useResiduals, dataset, channel} from "$lib/stores";
    import {computeMinMax} from "$lib/helper/util";
    import SpiralElementHover from "../components/spiral/SpiralElementHover.svelte";
    import Header from "../components/settingsBarElements/Header.svelte";
    import Disclosure from "../components/settingsBarElements/Disclosure.svelte";
    import DataSelection from "../components/settingsBarElements/DataSelection.svelte";
    import PeriodSelection from "../components/settingsBarElements/PeriodSelection.svelte";
    import SectorFilter from "../components/segmentRegression/SectorFilter.svelte";
    import GlobalModel from "../components/settingsBarElements/GlobalModel.svelte";
    import {computeModelParameters, computeResiduals} from "$lib/helper/globalRegression";
    import {pushHistoryEntry} from "$lib/helper/historyHelper";
    import HistoryButton from "../components/history/HistoryButton.svelte";
    import DataLineChart from "../components/linechart/DataLineChart.svelte";
    import SpiralGuidanceWrapper from "../components/guidanceDonut/SpiralGuidanceWrapper.svelte";
    import QualityMeasureSelection from "../components/guidanceDonut/QualityMeasureSelection.svelte";
    import GuidanceDonutLegend from "../components/legend/GuidanceDonutLegend.svelte";

    export let data: Datasets = {};
    let spiralSelector: SpiralSectorSelector;
    let selected_dataset: string = "air_passengers";
    let selected_channel: string = "passengers";
    let selectedQualityMeasure: string = "average"
    let spiral_data: SpiralRecord[] = [];
    let spiral_data_original: SpiralRecord[] = [];
    let min = 0;
    let max = 1;

    function updateSpiralData(selected_dataset: string, selected_channel: string, useResiduals: boolean, period: number) {
        if (!selected_dataset || !data[selected_dataset]) return;
        dataset.set(selected_dataset)
        channel.set(selected_channel)
        const channel_exists = Object.keys(data[selected_dataset][0].values).includes(selected_channel)
        if (!channel_exists) return;
        spiral_data = data[selected_dataset].map(item => ({
            timestamp: item.timestamp,
            value: item.values[selected_channel]
        }));
        spiral_data_original = [...spiral_data]
        if (useResiduals) {
            const values = spiral_data.map(s => s.value);
            const parameters = computeModelParameters(values, period);
            const residuals = computeResiduals(values, period, parameters);
            spiral_data = spiral_data.map((item, i) => ({
                timestamp: item.timestamp,
                value: residuals[i]
            }));
        }
        [min, max] = computeMinMax(spiral_data.map(v => v.value))
        pushHistoryEntry();
    }

    function resetSelection() {
        if (spiralSelector) spiralSelector.resetSelection()
    }

    onMount(() => {
        datasets.set(data)
        updateSpiralData(selected_dataset, selected_channel, $useResiduals, $period);
    })

    $: updateSpiralData(selected_dataset, selected_channel, $useResiduals, $period);

    useResiduals.subscribe(r => updateSpiralData(selected_dataset, selected_channel, r, $period));
    period.subscribe(p => updateSpiralData(selected_dataset, selected_channel, $useResiduals, p));
</script>


<div class="w-full h-full flex flex-col lg:flex-row">
    <div class="h-full w-full lg:w-[400px] shrink-0 lg:shadow-2xl p-4 z-50 flex flex-col gap-2 lg:overflow-y-scroll">
        <Header/>
        <Disclosure title="Data Selection">
            <DataSelection bind:selected_dataset bind:selected_channel/>
        </Disclosure>
        <Disclosure title="Period Selection">
            <PeriodSelection spiral_data={spiral_data}/>
        </Disclosure>
        <Disclosure title="Global Regression" open={false}>
            <GlobalModel spiral_data={spiral_data_original} period={$period}/>
        </Disclosure>
    </div>
    <div class="grow flex flex-col 2xl:flex-row mt-32 lg:mt-0 lg:overflow-y-scroll">
        <div class="grow flex flex-col items-center justify-center gap-2 overflow-y-scroll">
            <DataLineChart values={spiral_data_original.map(s => s.value)} period={$period}/>
            {#if $useResiduals}
                <p class="text-pink-600 text-sm"><b>Attention:</b> The spiral shows the residuals of a fitted model
                    instead of the original data.</p>
            {/if}
            <div class="shrink-0 relative h-[700px] w-[700px]">
                <div class="absolute">
                    <Spiral {spiral_data} period={$period} cutout={0.3}/>
                </div>
                <div class="absolute w-full h-full overflow-visible">
                    <SpiralElementHover/>
                </div>
                <div class="absolute w-full h-full grid place-items-center">
                    <SpiralGuidanceWrapper {spiral_data} {selectedQualityMeasure} period={$period}/>
                </div>
                <div class="absolute" style="pointer-events: none">
                    <SpiralSectorSelector bind:this={spiralSelector} period={$period} size={700}/>
                </div>

            </div>
            <button on:click={resetSelection}
                    class="text-black/70 border-b-2 border-b-black/70 border-dotted hover:text-black/90 hover:border-b-black/90 cursor-default">
                Reset Selection
            </button>
            <TwoToneColorLegend {min} {max} zero_centered={$useResiduals}/>
            <QualityMeasureSelection bind:selectedQualityMeasure/>
            <div class="w-full h-[20px]">
                <GuidanceDonutLegend/>
            </div>
        </div>
        <div class="h-full p-4 w-200 z-50 mt-20 2xl:mt-0 2xl:overflow-y-scroll">
            {#if data && data[selected_dataset]}
                <SectorLinkedView {min} {max} dataLength={data[selected_dataset].length}/>
                <SectorFilter values={spiral_data.map(s => s.value)}/>
            {/if}
        </div>
    </div>

</div>
<HistoryButton datasets={$datasets}/>
