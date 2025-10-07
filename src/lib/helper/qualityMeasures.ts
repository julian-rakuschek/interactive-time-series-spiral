import regression, {type DataPoint} from 'regression';
import type {SpiralElementBase, SpiralRecord} from "$lib/types";
import {Spiral as SpiralClass} from "$lib/classes/Spiral";
import {MASS} from "$lib/helper/matrixProfile";
import {computeMinMax, zNormalize} from "$lib/helper/util";

export function computeAverage(sector_data: number[][]): number {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < sector_data.length; i++) {
        for (let j = 0; j < sector_data[i].length; j++) {
            sum += sector_data[i][j];
            count++;
        }
    }
    return sum / count;
}

export function computeMonotoncity(sector_data: number[][]): number {
    let total_monotoncity = 0;
    for (let i = 0; i < sector_data.length; i++) {
        let increasing_pairs = 0;
        for (let j = 0; j < sector_data[i].length - 1; j++) {
            if (sector_data[i][j] < sector_data[i][j + 1]) increasing_pairs++;
            else increasing_pairs--;
        }
        total_monotoncity += increasing_pairs / (sector_data[i].length - 1);
    }
    return total_monotoncity;
}

export function computeSubsequentPairwiseSimilarity(sector_data: number[][]): number {
    let similarity_sum = 0;
    let count = 0;
    for (let i = 0; i < sector_data.length - 1; i++) {
        const ringA = sector_data[i];
        const ringB = sector_data[i + 1];
        if (ringA.length !== ringB.length || ringA.length === 0) continue;
        let norm = 0;
        for (let j = 0; j < ringA.length; j++) {
            norm += Math.pow(ringA[j] - ringB[j], 2)
        }
        norm = Math.sqrt(norm) / ringA.length;
        similarity_sum += norm;
        count++;
    }
    return similarity_sum / count;
}

export function computeTrend(sectorData: {ts: number[][], indices: number[][]}): number {
    let regressionInputData: DataPoint[] = []
    for (let ring = 0; ring < sectorData.ts.length; ring++) {
        const ts = sectorData.ts[ring];
        const indices = sectorData.indices[ring];
        for (let i = 0; i < ts.length; i++) {
            regressionInputData.push([indices[i], ts[i]])
        }
    }
    const result = regression.linear(regressionInputData);
    return result.equation[0];
}

export function computeMinimalDistance(sectorData: {ts: number[][], indices: number[][]}, timeseries: number[]): number {
    let distProfiles = sectorData.ts.map(t => MASS(t, timeseries));
    let global_min = Infinity;
    for (let i = 0; i < sectorData.indices.length; i++) {
        const sequence_len = sectorData.ts[i].length
        const start_idx = Math.max(0, sectorData.indices[i][0] - Math.floor(sequence_len / 2))
        distProfiles[i].splice(start_idx, sequence_len * 2)
        distProfiles[i] = zNormalize(distProfiles[i])
        const [min, max] = computeMinMax(distProfiles[i]);
        global_min = Math.min(min, global_min);
    }
    return global_min
}

