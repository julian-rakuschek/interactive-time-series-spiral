<script lang="ts">
    import {onMount} from "svelte";
    import {Chart, registerables} from "chart.js";
    import annotationPlugin, {type AnnotationOptions} from 'chartjs-plugin-annotation';
    import type {RegressionResult} from "$lib/types";

    Chart.register(...registerables, annotationPlugin);

    export let values: number[] = [];
    export let color: string = "#3949ab";
    export let timestamps: number[] = [];
    export let label: string = "";
    export let height = 100;
    export let horizontal_markers: number[] = [];
    export let active_indices: number[] = [];
    export let regressionResult: RegressionResult | undefined = undefined;

    const regressionColor = "#e91e63";
    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;
    let chart: Chart | null = null;

    function createRegressionValues(len: number): number[] {
        const values: number[] = [];
        if (!regressionResult) return values;
        for (let i = 0; i < len; i++) {
            values.push(regressionResult.gradient * i + regressionResult.intercept);
        }
        return values;
    }

    function generateAnnotations(values: number[]) {
        const annotations: Record<string, AnnotationOptions> = {};

        values.forEach((yValue, index) => {
            annotations[`line${index + 1}`] = {
                type: 'line',
                yMin: yValue,
                yMax: yValue,
                borderColor: 'rgb(255, 99, 132)', // you can randomize or customize this
                borderWidth: 2,
            };
        });
        return annotations
    }



    function createChart(ctx: CanvasRenderingContext2D, values: number[], color: string) {
        const default_labels = Array.from({length: values.length}, (x, i) => i);

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps.length === 0 ? default_labels : timestamps,
                datasets: [
                    {
                        label: label,
                        data: values,
                        fill: false,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        pointHoverRadius: 0,
                        borderColor: color,
                        backgroundColor: color,
                        order: 10,
                        segment: {
                            borderColor: ctx => {
                                if (active_indices.length === 0) return color;
                                const i = ctx.p0DataIndex;
                                return active_indices.includes(i) ? color : "#c5cae9";
                            }
                        }
                    },
                    {
                        label: "Regression Line",
                        data: createRegressionValues(values.length),
                        fill: false,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        pointHoverRadius: 0,
                        borderColor: regressionColor,
                        backgroundColor: regressionColor,
                        order: 10
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {intersect: false, mode: 'index'},
                animation: false,
                plugins: {
                    legend: {
                        display: false,
                    },
                    annotation: {
                        annotations: generateAnnotations(horizontal_markers)
                    }
                },
                scales: {
                    x: {
                        display: false
                    }
                }
            }
        });
    }

    function render(values: number[], color: string, active_indices: number[]) {
        if (!context) return;
        if (chart === null) {
            createChart(context, values, color);
        } else {
            const default_labels = Array.from({length: values.length}, (x, i) => i);
            chart.data.labels = timestamps.length === 0 ? default_labels : timestamps;
            chart.data.datasets[0].data = values;
            chart.data.datasets[0].borderColor = color;
            chart.data.datasets[0].backgroundColor = color;
            chart.data.datasets[1].data = createRegressionValues(values.length);
            chart.options.plugins.annotation.annotations = generateAnnotations(horizontal_markers);
            chart.data.datasets[0].segment = {
                borderColor: ctx => {
                    if (active_indices.length === 0) return color;
                    const i = ctx.p0DataIndex;
                    return active_indices.includes(i) ? color : "#c5cae9";
                }
            }
            chart.update()
        }
    }

    onMount(() => {
        context = canvas.getContext('2d');
        render(values, color, active_indices);
    })

    $: render(values, color, active_indices);
</script>

<div class="w-full" style="height: {height}px">
    <canvas bind:this={canvas}></canvas>
</div>