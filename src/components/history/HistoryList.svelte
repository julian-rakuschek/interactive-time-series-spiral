<script lang="ts">
    import {historyStack} from "$lib/stores";
    import HistoryElement from "./HistoryElement.svelte";
    import type {Datasets, HistoryRecord} from "$lib/types";
    import {computeModelParameters, computeResiduals} from "$lib/helper/globalRegression";
    import {mod} from "$lib/helper/util";
    import {removeHistoryRecordByID} from "$lib/helper/historyHelper";
    import {ChevronLeft, ChevronRight, Icon} from "svelte-hero-icons";
    import HistoryDisplayedSubsetIndicator from "./HistoryDisplayedSubsetIndicator.svelte";

    export let datasets: Datasets;
    let selected_idx: number = 0;
    let history: HistoryRecord[] = [];

    function getSpiralData(selected_dataset: string, selected_channel: string, useResiduals: boolean, period: number) {
        let spiral_data = datasets[selected_dataset].map(item => ({
            timestamp: item.timestamp,
            value: item.values[selected_channel]
        }));
        if (useResiduals) {
            const values = spiral_data.map(s => s.value);
            const parameters = computeModelParameters(values, period);
            const residuals = computeResiduals(values, period, parameters);
            spiral_data = spiral_data.map((item, i) => ({
                timestamp: item.timestamp,
                value: residuals[i]
            }));
        }
        return spiral_data
    }

    function getDisplayedHistories(history: HistoryRecord[], middle_index: number) {
        if (history.length <= 3) {
            return history;
        }
        let displayHistories: HistoryRecord[] = [
            history[mod(middle_index - 1, history.length)],
            history[mod(middle_index, history.length)],
            history[mod(middle_index + 1, history.length)],
        ];
        return displayHistories;
    }

    function getDisplayedIndices(history: HistoryRecord[], middle_index: number) {
        if (history.length <= 3) {
            return [...Array(history.length - 1).keys()];
        }
        return [
            mod(middle_index - 1, history.length),
            mod(middle_index, history.length),
            mod(middle_index + 1, history.length),
        ];
    }

    historyStack.subscribe(h => {
        history = [...h].reverse();
        selected_idx = 0;
    })

</script>

<div class="flex flex-col gap-5 p-10 h-full overflow-y-scroll">
    <p class="text-5xl font-semibold text-center">History</p>
    <div class="grid place-items-center">
        <button class="border-b-2 border-dotted border-b-indigo-400 text-indigo-400 hover:text-indigo-600"
                on:click={() => historyStack.set([])}>Clear History ({$historyStack.length} elements)
        </button>
    </div>
    <div class="flex flex-row items-center justify-center gap-8">
        <button on:click={() => selected_idx--} class="h-20 w-20 text-black/50 rounded-full transition hover:text-black/80">
            <Icon src="{ChevronLeft}" />
        </button>
        {#each getDisplayedHistories(history, selected_idx) as historyRecord}
            <HistoryElement
                    {historyRecord}
                    spiral_data={getSpiralData(historyRecord.dataset, historyRecord.channel, historyRecord.useResiduals, historyRecord.period)}
                    onDelete={() => removeHistoryRecordByID(historyRecord.uuid)}
            />
        {/each}
        <button on:click={() => selected_idx++} class="h-20 w-20 text-black/50 rounded-full transition hover:text-black/80">
            <Icon src="{ChevronRight}" />
        </button>
    </div>
    <div class="w-[400px] h-[10px] mx-auto">
        <HistoryDisplayedSubsetIndicator maxIndex={history.length - 1} displayedIndices={getDisplayedIndices(history, selected_idx)} />
    </div>
</div>
