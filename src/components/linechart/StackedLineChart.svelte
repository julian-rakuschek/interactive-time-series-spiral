<script lang="ts">
    import {onMount} from "svelte";
    import {Chart, type ChartDataset, registerables} from "chart.js";
    import type {LineChart} from "$lib/types";

    Chart.register(...registerables);

    export let linecharts: LineChart[] = [];


    let canvas: HTMLCanvasElement;
    let context: CanvasRenderingContext2D | null;
    let chart: Chart | null = null;

    function linechartsToDatasets(linecharts: LineChart[]): ChartDataset<"line", number[]>[] {
        return linecharts.map(lc => ({
            label: String(lc.ring),
            data: lc.values,
            fill: false,
            pointRadius: 0,
            pointHitRadius: 10,
            pointHoverRadius: 0,
            borderColor: lc.color,
            backgroundColor: lc.color,
            order: 10
        }))
    }

    function createChart(ctx: CanvasRenderingContext2D, linecharts: LineChart[]) {
        const default_labels = linecharts.length === 0 ? [] : Array.from({length: linecharts[0].values.length}, (x, i) => i);
        chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: default_labels,
                datasets: linechartsToDatasets(linecharts)
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
                },
                scales: {
                    x: {
                        display: false
                    }
                }
            }
        });
    }

    function render(linecharts: LineChart[]) {
        if (!context) return;
        if (chart === null) {
            createChart(context, linecharts);
        } else {
            chart.data.labels = linecharts.length === 0 ? [] : Array.from({length: linecharts[0].values.length}, (x, i) => i);
            chart.data.datasets = linechartsToDatasets(linecharts);
            chart.update()
        }
    }

    onMount(() => {
        context = canvas.getContext('2d');
        render(linecharts);
    })

    $: render(linecharts);
</script>

<div class="w-full h-[100px]">
    <canvas bind:this={canvas}></canvas>
</div>