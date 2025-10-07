import type {HistoryRecord} from "$lib/types";
import {historyStack, sector_selection, dataset, channel, period, useResiduals, activeSectorFilter} from "$lib/stores";
import { get } from "svelte/store";
import { v4 as uuidv4 } from 'uuid';

export function hashHistoryRecord(record: HistoryRecord): string {
    const obj = {
        dataset: record.dataset,
        channel: record.channel,
        period: record.period,
        useResiduals: record.useResiduals,
        selectedSector: record.selectedSector,
        sectorFilter: record.sectorFilter,
    };
    return JSON.stringify(obj)
}

export function pushHistoryEntry() {
    const new_entry: HistoryRecord = {
        uuid: uuidv4(),
        dataset: get(dataset),
        channel: get(channel),
        period: get(period),
        useResiduals: get(useResiduals),
        selectedSector: get(sector_selection),
        sectorFilter: get(activeSectorFilter)
    }
    let historyDuplicate = false
    let hist = get(historyStack)
    if (hist.length > 0) {
        const lastHistoryRecord = hist[hist.length - 1];
        historyDuplicate = hashHistoryRecord(lastHistoryRecord) === hashHistoryRecord(new_entry);
    }
    if (!historyDuplicate) historyStack.update(stack => [...stack, new_entry]);
}

export function removeHistoryRecordByID(uuid: string) {
    const currentHistoryStack = get(historyStack);
    console.log("remove", uuid)
    const newStack = currentHistoryStack.filter(h => h.uuid !== uuid);
    console.log(currentHistoryStack.length, newStack.length)
    historyStack.set(newStack);
}

export function setStatesFromHistoryRecord(uuid: string) {
    const records = get(historyStack).filter(h => h.uuid === uuid);
    if (records.length === 0) return;
    const record = records[0];
    dataset.set(record.dataset);
    channel.set(record.channel);
    period.set(record.period);
    useResiduals.set(record.useResiduals);
    sector_selection.set(record.selectedSector);
    activeSectorFilter.set(record.sectorFilter);
}