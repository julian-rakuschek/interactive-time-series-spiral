import type {Graphics} from "pixi.js";

export enum QualityMeasures { AVG, TREND }

export enum SectorFilters { NONE, REG }

export type Datasets = {
    [key: string]: Record[];
}

export type Record = {
    timestamp?: Date;
    values: {
        [channel: string]: number
    };
}

export type SpiralRecord = {
    timestamp?: Date;
    value: number;
}

export type SpiralElementBase = {
    period: number;
    ring: number;
    value: number;
}

export type SpiralElement = {
    graphics: Graphics;
    selected: boolean;
    index: number;
    period: number;
    ring: number;
    value: number;
    spiralStart: number;
    spiralEnd: number;
    timestamp?: Date;
}

export type LineChart = {
    values: number[];
    timestamps: number[];
    indices: number[];
    color?: string;
    ring: number;
}

export type TwoToneColor = {
    colorA: string;
    colorB: string;
    ratio: number;
}

export type SectorQualityMeasure = {
    start: number;
    end: number;
    qualityMeasure: string;
    value: number;
}


export type SectorSelectionKnobPositions = {
    x_inner: number;
    y_inner: number;
    x_outer: number;
    y_outer: number;
}

export type RegressionResult = {
    gradient: number;
    intercept: number;
}

export type SelectedStackedHeatmapElement = {
    value: number;
    timestamp?: Date;
}

export type HistoryRecord = {
    uuid: string;
    dataset: string;
    channel: string;
    period: number;
    useResiduals: boolean;
    selectedSector: [number, number];
    sectorFilter: SectorFilters;
}

export type WorkerWithStatus = {
    worker: Worker;
    running: boolean;
    computed_sectors: number;
    progress: number;
}

export type PeriodFitness = {
    period: number;
    fitness: number;
}