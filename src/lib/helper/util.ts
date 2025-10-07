import regression, {type DataPoint} from "regression";
import type {LineChart, RegressionResult} from "$lib/types";

export function computeMinMax(values: number[]) {
    let min = Infinity;
    let max = -Infinity;
    for (const value of values) {
        if (value < min) min = value;
        if (value > max) max = value;
    }
    return [min, max];
}

export function norm(v: number[]) {
    const len = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
    return [v[0] / len, v[1] / len];
}

export function zNormalize(arr: number[]): number[] {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    const std = Math.sqrt(arr.reduce((s, x) => s + (x - mean) ** 2, 0) / arr.length);
    return arr.map(x => (x - mean) / std);
}

// https://stackoverflow.com/a/17323608
export function mod(n: number, m: number) {
    return ((n % m) + m) % m;
}

export function computeRegressionWithIndices(values: number[], indices: number[]): RegressionResult {
    let regressionInputData: DataPoint[] = []
    for (let i = 0; i < values.length; i++) {
        regressionInputData.push([indices[i], values[i]])
    }
    const result = regression.linear(regressionInputData);
    const gradient = result.equation[0];
    const intercept = result.equation[1];
    return {gradient, intercept}
}

export function applyRegression(linecharts: LineChart[], regressionResult: RegressionResult): LineChart[] {
    const model = (x: number) => {
        return x * regressionResult.gradient + regressionResult.intercept;
    }

    for (const linechart of linecharts) {
        let new_values: number[] = []
        for (let i = 0; i < linechart.values.length; i++) {
            new_values.push(linechart.values[i] - model(linechart.indices[i]))
        }
        linechart.values = new_values
    }
    return linecharts;
}

export function getLineChartMinMax(linecharts: LineChart[]): [number, number] {
    let [min, max] = [Infinity, -Infinity];
    for (const linechart of linecharts) {
        const [lcMin, lcMax] = computeMinMax(linechart.values);
        min = Math.min(min, lcMin);
        max = Math.max(max, lcMax);
    }
    return [min, max];
}