<script lang="ts">
    import { onMount, tick } from 'svelte';
    import { fade } from 'svelte/transition';
    import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
    import { Library } from "$lib/store";
    import { sleep, getRandomInt } from '$lib/utils';

    export let currentGameList: Game[] = [];

    let listContainer: HTMLElement;
    let gameList: Game[] = [];
    let mounted = false;
    let spinning = false;
    let hasSpun = false;
    let translateVal = 0;
    let spinDuration = 2000;

    $: spinBtnText = spinning
        ? 'Spinning...'
        : hasSpun ? 'Spin again' : 'Spin';

    onMount(async () => {
        buildList();

        // Let modal animation complete
        await sleep(150);
        mounted = true;
    })

    const buildList = () => {
        const newList = [];
        const listLength = currentGameList.length;
        for (let i = 0; i <= 25; i++) {
            const random = getRandomInt(listLength);
            newList.push(currentGameList[random]);
        }

        gameList = newList;
    }

    const spin = async () => {
        if (hasSpun) {
            buildList();
            // TODO: reset
        }

        spinning = true;
        // Transition to the 20th item (based on container width)
        translateVal = -3000 + (listContainer.clientWidth / 2 - 75);
        await sleep(spinDuration);
        spinning = false;
        hasSpun = true;

        // Show selected game info
    }

</script>

<style>
</style>

<div>
    <h1>Random game to play</h1>
    <p class="opacity-75 mb-6">Based on current options</p>
    <div bind:this={listContainer} class="h-[150px] w-full mb-6">
        {#if mounted}
            <div transition:fade>
                <div class="relative h-[150px] w-full overflow-hidden whitespace-nowrap">
                    <!-- left overlay -->
                    <div class="absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-surface-800 z-10"></div>
                    <!-- right overlay -->
                    <div class="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-surface-800 z-10"></div>
                    <div class="flex space-x-2 transition-transform duration-[{spinDuration}ms] ease-in-out" style="transform: translateX({translateVal}px);">
                        {#each gameList as game}
                            <div
                                class="h-[150px] w-[150px] flex-shrink-0 bg-cover bg-center rounded-md"
                                style="background-image: url('{game.image}');"
                            />
                        {/each}
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <hr class="my-4" />
    <div class="flex justify-end">
        <button class="btn btn-ringed-surface mr-6" on:click={() => modalStore.close()}>Close</button>
        <button class="btn btn-filled-secondary" disabled={spinning} on:click={spin}>{spinBtnText}</button>
    </div>
</div>