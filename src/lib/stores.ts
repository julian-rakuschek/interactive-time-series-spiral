import {writable} from "svelte/store";
import {
    type Datasets, type HistoryRecord,
    type LineChart,
    SectorFilters,
    type SelectedStackedHeatmapElement,
    type SpiralElement,
} from "$lib/types";

export const datasets = writable<Datasets>({});
export const dataset = writable<string>();
export const channel = writable<string>();
export const period = writable(12);
export const useResiduals = writable(false);
export const linecharts = writable<LineChart[]>([]);


// the sector selection is provided in indices, so [4, 10] means from the 4th sector up to the 10th sector.
export const sector_selection = writable<[number, number]>([0, 0]);
export const guidance_sector_selection = writable<[number, number]>([0, 0]);
export const selected_spiral_element = writable<SpiralElement | null>(null);

export const selected_stacked_heatmap_element = writable<SelectedStackedHeatmapElement | null>(null);

export const activeSectorFilter = writable<SectorFilters>(SectorFilters.NONE);

export const historyStack = writable<HistoryRecord[]>([]);

export const guidanceLabels = writable<[string, string]>(["", ""]);
