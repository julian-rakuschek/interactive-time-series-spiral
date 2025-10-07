import {mod} from "$lib/helper/util";
import {Graphics} from "pixi.js";
import type {SectorQualityMeasure} from "$lib/types";
import {interpolatePlasma} from "d3-scale-chromatic";
import {donutPaths} from "$lib/helper/heatmapHelper";

export function sectorToDonutPosition(start: number, end: number, period: number, rings: number, sectors_per_ring: number[]) {
    const width = mod(end - start, period);
    const offset = Math.floor(width / 2);
    const offset_start = (start + offset) % period;

    const donut_ring = rings - 1 - Math.floor(width / period * rings);
    const donut_sector = Math.min(sectors_per_ring[donut_ring] - 1, Math.round(offset_start / period * sectors_per_ring[donut_ring]));
    return [donut_ring, donut_sector, width];
}

class DonutElement {
    public dataElements: {
        [qualityMeasure: string]: SectorQualityMeasure[];
    };
    public representativeValues: {
        [qualityMeasure: string]: number
    }

    constructor() {
        this.dataElements = {}
        this.representativeValues = {}
    }

    computeAverage(data: number[]) {
        let sum = 0
        for (const datum of data) {
            sum += datum;
        }
        return sum / data.length;
    }

    addDataElement(data: SectorQualityMeasure) {
        if (this.dataElements[data.qualityMeasure] === undefined) {
            this.dataElements[data.qualityMeasure] = []
        }
        this.dataElements[data.qualityMeasure].push(data);
        const values = this.dataElements[data.qualityMeasure].map(d => d.value)
        this.representativeValues[data.qualityMeasure] = this.computeAverage(values)
    }

    getColor(qualityMeasure: string, min: number, max: number): string {
        if (!this.dataElements[qualityMeasure] || this.dataElements[qualityMeasure].length === 0) return "#e0e0e0";
        if (min === max) return interpolatePlasma(0);
        const t = (this.representativeValues[qualityMeasure] - min) / (max - min);
        return interpolatePlasma(t);
    }
}

class DonutRing {
    public ringIdx: number;
    public elements: DonutElement[] = [];
    // If a global min and max across all rings should be stores, then these dictionaries will be identical
    // across the rings
    public minima: { [qualityMeasure: string]: number } = {}
    public maxima: { [qualityMeasure: string]: number } = {}

    constructor(ringIdx: number, initialElements: DonutElement[]) {
        this.ringIdx = ringIdx;
        this.elements = initialElements;
    }
}

export class QualityMeasureDataManager {
    public readonly rings: number;
    public readonly period: number;
    public readonly sectors_per_ring: number[];
    public donutRings: DonutRing[] = [];

    constructor(period: number, rings: number) {
        this.period = period;
        this.rings = rings;
        this.sectors_per_ring = [];
        for (let i = 0; i < rings; i++) {
            const ring = i / (rings - 1);
            const sectors = Math.floor(1 + ring * (this.period - 1));
            this.sectors_per_ring.push(sectors)
        }
        this.initHeatmap()
    }

    initHeatmap() {
        for (let ring_idx = 0; ring_idx < this.rings; ring_idx++) {
            const donutRing: DonutElement[] = []
            const sectors = this.sectors_per_ring[ring_idx]
            for (let sector_idx = 0; sector_idx < sectors; sector_idx++) {
                const donutElement = new DonutElement()
                donutRing.push(donutElement);
            }
            this.donutRings.push(new DonutRing(ring_idx, donutRing));
        }
    }

    addDataElement(data: SectorQualityMeasure) {
        const [donut_ring, donut_sector, width] = sectorToDonutPosition(data.start, data.end, this.period, this.rings, this.sectors_per_ring);
        this.donutRings[donut_ring].elements[donut_sector].addDataElement(data);
        this.updateMinMax(data, data.qualityMeasure === "mp" ? donut_ring : null);
    }

    updateMinMax(cell: SectorQualityMeasure, donut_ring_idx: number | null) {
        for (const donutRing of this.donutRings) {
            if (donut_ring_idx !== null && donut_ring_idx !== donutRing.ringIdx) continue;
            if (!donutRing.minima[cell.qualityMeasure]) {
                donutRing.minima[cell.qualityMeasure] = Infinity;
            }
            if (!donutRing.maxima[cell.qualityMeasure]) {
                donutRing.maxima[cell.qualityMeasure] = -Infinity;
            }
            donutRing.minima[cell.qualityMeasure] = Math.min(donutRing.minima[cell.qualityMeasure], cell.value);
            donutRing.maxima[cell.qualityMeasure] = Math.max(donutRing.maxima[cell.qualityMeasure], cell.value);
        }
    }

    getColorArray(qualityMeasure: string): string[][] {
        let result: string[][] = [];
        for (const donutElementRing of this.donutRings) {
            let result_row: string[] = []
            const min = donutElementRing.minima[qualityMeasure] ?? 0;
            const max = donutElementRing.maxima[qualityMeasure] ?? 0;
            for (const donutElement of donutElementRing.elements) {
                result_row.push(donutElement.getColor(qualityMeasure, min, max));
            }
            result.push(result_row);
        }
        return result;
    }

    getMinMaxLabels(qualityMeasure: string): [string, string] {
        if (qualityMeasure == "mp") {
            return ["Unique", "Recurring"]
        }

        const min = this.donutRings[0].minima[qualityMeasure];
        const max = this.donutRings[0].maxima[qualityMeasure];
        if (!min || !max) return ["Low", "High"];
        return [min.toFixed(2), max.toFixed(2)]
    }
}