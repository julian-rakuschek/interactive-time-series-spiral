<script lang="ts">
    import type {LineChart, RegressionResult} from "$lib/types";
    import {linecharts} from "$lib/stores";
    import BasicLineChart from "../linechart/BasicLineChart.svelte";
    import {computeRegressionWithIndices} from "$lib/helper/util";
    let regressionResult: RegressionResult;

    export let values: number[] = [];
    let active_indices: number[] = [];

    linecharts.subscribe(l => {
        active_indices = l.flatMap(lc => lc.indices);
        const lineChartValues = l.flatMap(lc => lc.values);
        regressionResult = computeRegressionWithIndices(lineChartValues, active_indices)
    })
</script>
<BasicLineChart {values} {regressionResult} {active_indices}  />
<p>Regression Parameters</p>
<p class="text-sm"><b>Gradient: </b> {regressionResult.gradient}</p>
<p class="text-sm"><b>Intercept:</b> {regressionResult.intercept}</p>