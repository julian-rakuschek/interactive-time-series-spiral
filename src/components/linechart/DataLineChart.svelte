<script lang="ts">
    import {onMount} from "svelte";
    import {Chart, registerables} from "chart.js";
    import annotationPlugin, {type AnnotationOptions} from 'chartjs-plugin-annotation';
    import type {RegressionResult} from "$lib/types";
    import {computeModelParameters, modelFunction} from "$lib/helper/globalRegression";

    Chart.register(...registerables, annotationPlugin);

    export let values: number[] = [];
    export let timestamps: number[] = [];
    export let period: number;

    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;
    let chart: Chart | null = null;

    function createRegressionValues(values: number[], period: number): number[] {
        const parameters = computeModelParameters(values, period);
        let modelValues = [];
        const f = modelFunction(parameters)
        for (let i = 0; i < values.length; i++) {
            modelValues.push(f(i / period));
        }
        return modelValues;
    }

    function generateAnnotations(data_length: number, period: number) {
        const annotations: Record<string, AnnotationOptions> = {};
        const annotations_length = Math.ceil(data_length / period);
        for (let i = 0; i < annotations_length; i++) {
            annotations[`line${i + 1}`] = {
                type: 'line',
                xMin: i * period,
                xMax: i * period,
                borderColor: '#304ffe', // you can randomize or customize this
                borderWidth: 1,
            };
        }
        return annotations
    }



    function createChart(ctx: CanvasRenderingContext2D, values: number[], period: number) {
        const default_labels = Array.from({length: values.length}, (x, i) => i);

        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: timestamps.length === 0 ? default_labels : timestamps,
                datasets: [
                    {
                        label: "Original Dataset",
                        data: values,
                        fill: false,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        pointHoverRadius: 0,
                        borderColor: "#1a237e",
                        backgroundColor: "#1a237e",
                        order: 10
                    },
                    {
                        label: "Regression Line",
                        data: createRegressionValues(values, period),
                        fill: false,
                        pointRadius: 0,
                        pointHitRadius: 10,
                        pointHoverRadius: 0,
                        borderColor: "rgb(255, 99, 132)",
                        backgroundColor: "rgb(255, 99, 132)",
                        borderWidth: 2,
                        order: 0
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
                        display: true,
                    },
                    annotation: {
                        annotations: generateAnnotations(values.length, period)
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

    function render(values: number[], period: number) {
        if (!context) return;
        if (chart === null) {
            createChart(context, values, period);
        } else {
            chart.data.labels = Array.from({length: values.length}, (x, i) => i);
            chart.data.datasets[0].data = values
            chart.data.datasets[1].data = createRegressionValues(values, period)
            chart.options.plugins.annotation.annotations = generateAnnotations(values.length, period);
            chart.update()
        }
    }

    onMount(() => {
        context = canvas.getContext('2d');
        render(values, period);
    })

    $: render(values, period);
</script>

<div class="w-full" style="height: 100px">
    <canvas bind:this={canvas}></canvas>
</div>