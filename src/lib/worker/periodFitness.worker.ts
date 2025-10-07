import type {PeriodFitness} from "$lib/types";
import {computePeriodFitness} from "$lib/helper/periodFitness";

onmessage = (e) => {
    const {data, min_period, max_period} = e.data;
    void computePeriodFitnessValues(data, min_period, max_period);
};

async function computePeriodFitnessValues(data: number[], min_period: number, max_period: number) {
    for (let i = min_period; i < max_period; i++) {
        const fitness = computePeriodFitness(data, i);
        const result: PeriodFitness = {period: i, fitness: fitness};
        postMessage(JSON.stringify(result));
    }
}


export {};