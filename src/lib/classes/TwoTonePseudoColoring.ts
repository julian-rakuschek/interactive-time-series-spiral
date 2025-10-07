import type {TwoToneColor} from "$lib/types";

export class TwoTonePseudoColoring {
    private readonly min: number;
    private readonly max: number;
    private readonly zeroCentered: boolean;
    private colors: string[] = [];
    private interval_borders: number[] = [];

    constructor(min: number, max: number, intervals: number, color_interpolation_function: (t: number) => string, inverse: boolean = true, zero_centered: boolean = false) {
        this.min = min;
        this.max = max;
        this.zeroCentered = zero_centered;
        for (let i = 0; i <= intervals; i++) {
            const t = inverse ? (1 - i / intervals) : i / intervals;
            this.colors.push(color_interpolation_function(t));
            this.interval_borders.push(i / intervals);
        }
    }

    getColor(value: number): TwoToneColor {
        let t = (value - this.min) / (this.max - this.min);
        if (this.zeroCentered) {
            const max_span = Math.max(Math.abs(this.min), Math.abs(this.max))
            const radius = Math.abs(value) / max_span;
            const direction = value < 0 ? -1 : 1;
            t = 0.5 + radius * 0.5 * direction;
        }

        let interval: [number, number] = [0, 0];
        if (t >= 1) interval = [this.interval_borders.length - 1, this.interval_borders.length - 1];
        for (let i = 0; i < this.interval_borders.length - 1; i++) {
            if (this.interval_borders[i] <= t && this.interval_borders[i + 1] >= t) {
                interval = [i, i + 1]
            }
        }
        const ratio = (t - this.interval_borders[interval[0]]) / (this.interval_borders[interval[1]] - this.interval_borders[interval[0]]);
        return {
            colorA: this.colors[interval[0]],
            colorB: this.colors[interval[1]],
            ratio: ratio
        }
    }
}