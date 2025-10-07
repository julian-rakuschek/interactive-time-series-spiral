import {levenbergMarquardt} from "$lib/helper/curve-fitting.mjs";

const modelFunction = ([a, b, c, d, e]: number[]) => {
    return (x: number) => (a + b * x) + (c + d * x) * Math.cos(2 * Math.PI * x + e);
};

export function computePeriodFitness(data: number[], period: number) {
    const x_values = Array.from({length: data.length}, (x, i) => i / period);
    const results = levenbergMarquardt(
        {
            x: x_values,
            y: data
        },
        modelFunction,
        {
            parameters: { initial: [1, 0, 1, 0, 0] }
        }
    );
    const estimated = x_values.map(x => modelFunction(results.parameters)(x))
    // Residuals
    const residuals = data.map((v, index) => v - estimated[index]);

    // Fitness metrics:
    const mse = residuals.reduce((sum, r) => sum + r * r, 0) / residuals.length;
    return Math.sqrt(mse)
}