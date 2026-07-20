<script lang="ts">
    import { onMount } from 'svelte';
    import { createVirtualizer } from '@tanstack/svelte-virtual';
    import GameCard from './GameCard.svelte';

    export let collection: Game[] = [];
    export let scrollElement: HTMLElement | null = null;
    export let scrollMargin: number = 0;

    let columns = 1;

    onMount(() => {
        updateColumns();
    });

    const updateColumns = () => {
        const width = window.innerWidth;
        if (width >= 1024) {
            columns = 3;
        } else if (width >= 768) {
            columns = 2;
        } else {
            columns = 1;
        }
    };

    $: rowCount = Math.ceil(collection.length / columns);

    $: virtualizer = createVirtualizer({
        count: rowCount,
        getScrollElement: () => scrollElement,
        estimateSize: () => 400,
        overscan: 5,
        scrollMargin,
    });

    $: $virtualizer.setOptions({
        count: rowCount,
        scrollMargin,
    });

    $: items = $virtualizer.getVirtualItems();
    $: totalSize = $virtualizer.getTotalSize();

    // Preload images for visible items so they're cached before DOM elements mount
    $: {
        for (const item of items) {
            const start = item.index * columns;
            for (const game of collection.slice(start, start + columns)) {
                if (game?.image) {
                    const img = new Image();
                    img.src = game.image;
                }
            }
        }
    }
</script>

<svelte:window on:resize={updateColumns} />

{#if collection.length === 0}
    <p class="col-span-1 md:col-span-2 lg:col-span-3 text-center text-xl py-12">No results based on current filters</p>
{:else}
    <div
        class="w-full relative"
        style="height: {totalSize}px;"
    >
        {#each items as row (row.index)}
            <div
                class="absolute top-0 left-0 w-full will-change-transform"
                style="height: {row.size}px; transform: translateY({row.start - scrollMargin}px);"
            >
                <div class="flex justify-center gap-4">
                    {#each collection.slice(row.index * columns, row.index * columns + columns) as game, index (`${game.id}-${index}`)}
                        <GameCard {game} />
                    {/each}
                </div>
            </div>
        {/each}
    </div>
{/if}
