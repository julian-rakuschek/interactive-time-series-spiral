<script lang="ts">
    import { Icon, Play } from "svelte-hero-icons";

    export let title;
    export let open = true;
</script>

<div class="w-full mt-5">
    <button class="flex flex-row px-1 gap-2 items-center rounded-lg cursor-default font-semibold hover:bg-black/10 mb-2" on:click={() => open = !open}>
        <Icon src="{Play}" class="h-4 text-black/70 w-4" style="rotate: {open ? 90 : 0}deg" solid />
        {title}
    </button>
    {#if open}
        <slot />
    {/if}
</div>