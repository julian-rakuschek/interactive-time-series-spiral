import type {SectorQualityMeasure, SpiralElementBase} from "$lib/types";
import {Sampler} from "$lib/classes/Sampler";
import {
    computeAverage,
    computeMinimalDistance,
    computeTrend
} from "$lib/helper/qualityMeasures";
import {getSectorData} from "$lib/helper/sectorSelectionHelper";

onmessage = (e) => {
    const {spiral_data, period, rings, quality_measure} = e.data;
    void computeSectorRecommendations(spiral_data, period, rings, quality_measure);
};

function computeQualityMeasureForSector(spiral_data: SpiralElementBase[], start: number, end: number, period: number, qualityMeasure: string): SectorQualityMeasure {
    const sector_data = getSectorData(spiral_data, start, end, period);

    let value;
    if (qualityMeasure == "average") value = computeAverage(sector_data.ts);
    else if (qualityMeasure == "trend") value = computeTrend(sector_data);
    else if (qualityMeasure == "mp") value = computeMinimalDistance(sector_data, spiral_data.map(s => s.value));
    else throw "Unknown quality measure";

    return {start, end, qualityMeasure, value}
}



async function computeSectorRecommendations(spiral_data: SpiralElementBase[], period: number, rings: number, quality_measure: string): Promise<void> {
    const sampler = new Sampler(period, rings, quality_measure === "mp" ? 3 : 1);
    let batch: SectorQualityMeasure[] = [];
    while (true) {
        if (sampler.isFinished()) break;
        // if (sampler.completed_round_trips >= 1) break;
        const sector = sampler.getSector();
        if (sector === null) return;
        const res = computeQualityMeasureForSector(spiral_data, sector.start, sector.end, period, quality_measure)
        batch.push(res)
        if (batch.length > 50) {
            postMessage(JSON.stringify(batch));
            batch = [];
        }
    }
    if (batch.length > 0) {
        postMessage(JSON.stringify(batch));
    }
}

export {};