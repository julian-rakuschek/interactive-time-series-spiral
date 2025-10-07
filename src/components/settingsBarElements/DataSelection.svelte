<script lang="ts">
    import {toast} from "@zerodevx/svelte-toast";
    import {toastError, toastSuccess} from "$lib/helper/toastThemes";
    import {text_to_csv} from "$lib/helper/datasetHelper";
    import {datasets} from "$lib/stores";
    import {onMount} from "svelte";
    import Dropzone from "svelte-file-dropzone";

    export let selected_dataset: string;
    export let selected_channel: string;

    let available_datasets: string[] = []
    let available_channel: string[] = [];

    async function handleFileDrop(acceptedFiles: File[]) {
        if (acceptedFiles.length === 0) return;
        const file = acceptedFiles[0]
        if (!file.name.endsWith("csv")) {
            toast.push('Only CSV files are allowed.', {theme: toastError})
            return;
        }
        try {
            const text = await file.text();
            const data = text_to_csv(text);
            const key = file.name.toLowerCase().replace(".csv", "")
            datasets.update((d) => {
                d[key] = data
                return d
            });
            available_datasets = [...available_datasets, key];
            selected_dataset = key;
            updateChannelList(selected_dataset)
            toast.push('Dataset was loaded and selected.', {theme: toastSuccess})
        } catch (e) {
            console.log(e)
            toast.push(`An error occured while loading the CSV file: ${e}`, {theme: toastError})
        }
    }

    function updateChannelList(selected: string) {
        if (!selected || !$datasets[selected] || $datasets[selected].length === 0) return;
        const sample = $datasets[selected][0].values
        available_channel = Object.keys(sample)
        selected_channel = available_channel[0];

    }

    datasets.subscribe((d) => {
        if (!selected_dataset) {
            available_datasets = Object.keys(d);
            selected_dataset = available_datasets[0];
            updateChannelList(selected_dataset)
        }
    })

    onMount(() => {
        available_datasets = Object.keys($datasets);
        selected_dataset = available_datasets[0];
        updateChannelList(selected_dataset)
    })

    $: updateChannelList(selected_dataset);
</script>

<div class="flex flex-col gap-1">
    <Dropzone on:drop={(e) => handleFileDrop(e.detail.acceptedFiles)} multiple={false}
              containerClasses="bg-indigo-100 rounded-xl text-indigo-800 text-sm p-4 outline-2 outline-indigo-800 outline-dotted -outline-offset-6 cursor-default"
              disableDefaultStyles>
        <p class="text-indigo-800 font-semibold">Drop a custom CSV file here</p>
        <p class="text-indigo-800 text-xs italic">The file will not leave your browser and will not be processed on
            a server. This also means that you should not select a huge file unless you want to fry your
            computer.</p>

    </Dropzone>
    <p class="text-black/80 text-sm">Existing datasets:</p>
    <select bind:value={selected_dataset}
            class="block px-2 py-1 w-full text-sm text-indigo-800 bg-indigo-100 rounded-lg border-none appearance-none focus:outline-none focus:ring-0">
        {#each available_datasets as dataset}
            <option selected={selected_dataset === dataset}>{dataset}</option>
        {/each}
    </select>
    <p class="text-black/80 text-sm">Channel:</p>
    <select bind:value={selected_channel}
            class="block px-2 py-1 w-full text-sm text-indigo-800 bg-indigo-100 rounded-lg border-none appearance-none focus:outline-none focus:ring-0">
        {#each available_channel as channel}
            <option selected={selected_channel === channel}>{channel}</option>
        {/each}
    </select>
</div>