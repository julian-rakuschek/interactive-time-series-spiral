import {levenbergMarquardt} from "$lib/helper/curve-fitting.mjs";

export const modelFunction = ([a, b, c, d, e]: number[]): (x: number) => number => {
    return (x: number) => (a + b * x) + (c + d * x) * Math.cos(2 * Math.PI * x + e);
};

export function computeModelParameters(values: number[], period: number) {
    const x_values = Array.from({length: values.length}, (x, i) => i / period);
    const results = levenbergMarquardt(
        {x: x_values, y: values},
        modelFunction,
        {parameters: {initial: [1, 0, 1, 0, 0]}}
    );

    return results.parameters;
}

export function computeResiduals(values: number[], period: number, parameters: number[]) {
    const x_values = Array.from({length: values.length}, (x, i) => i / period);
    const estimated = x_values.map(x => modelFunction(parameters)(x))
    return values.map((v, index) => v - estimated[index]);
}