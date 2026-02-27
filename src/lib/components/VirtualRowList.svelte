<script lang="ts">
    import { createVirtualizer } from '@tanstack/svelte-virtual';
    import GameRow from './GameRow.svelte';

    export let collection: Game[] = [];
    export let scrollElement: HTMLElement | null = null;
    export let scrollMargin: number = 0;

    $: virtualizer = createVirtualizer({
        count: collection.length,
        getScrollElement: () => scrollElement,
        estimateSize: () => 136,
        overscan: 8,
        scrollMargin,
    });

    $: $virtualizer.setOptions({
        count: collection.length,
        scrollMargin,
    });

    $: items = $virtualizer.getVirtualItems();
    $: totalSize = $virtualizer.getTotalSize();

    // Preload images for visible items so they're cached before DOM elements mount
    $: {
        for (const item of items) {
            const game = collection[item.index];
            if (game?.image) {
                const img = new Image();
                img.src = game.image;
            }
        }
    }
</script>

{#if collection.length === 0}
    <p class="text-center text-xl py-12">No results based on current filters</p>
{:else}
    <div
        class="w-full relative"
        style="height: {totalSize}px;"
    >
        {#each items as row (row.index)}
            <div
                class="absolute top-0 left-0 w-full flex justify-center will-change-transform"
                style="height: {row.size}px; transform: translateY({row.start - scrollMargin}px);"
            >
                <GameRow game={collection[row.index]} />
            </div>
        {/each}
    </div>
{/if}
