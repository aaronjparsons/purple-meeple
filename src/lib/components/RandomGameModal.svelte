<script lang="ts">
    import { onMount } from 'svelte';
    import { fade } from 'svelte/transition';
    import { modalStore } from '@skeletonlabs/skeleton';
    import { sleep, getRandomInt, getGameName } from '$lib/utils';

    export let currentGameList: Game[] = [];

    let listContainer: HTMLElement;
    let gameList: Game[] = [];
    let translateVal = 0;
    let spinDuration = 2000;
    let modalState = 'start'; // start|spinner|display
    let selectedGame: Game|null = null;

    onMount(async () => {
        buildList();
    })

    const buildList = () => {
        const newList = [];
        const listLength = currentGameList.length;
        for (let i = 0; i <= 25; i++) {
            const random = getRandomInt(listLength);
            newList.push(currentGameList[random]);
        }

        selectedGame = newList[19];
        gameList = newList;
    }

    const spin = async () => {
        modalState = 'spinner';
        await sleep(300);
        startSpinAnimation();
    }

    const startSpinAnimation = async () => {
        // Transition to the 20th item (based on container width)
        translateVal = -3000 + (listContainer.clientWidth / 2 - 75);

        // Wait for spin duration plus small delay after finished
        await sleep(spinDuration + 1000);

        // Show selected game info
        modalState = 'display';
    }
</script>

<style>
</style>

<div>
    <h1>Random game to play</h1>
    <p class="opacity-75 mb-6">Based on current options</p>
    <div
        bind:this={listContainer}
        class="relative w-full mb-6 transition-all"
        style="height: {modalState === 'display' ? 300 : 150}px;"
    >
        {#if modalState === 'start'}
            <div class="flex justify-center">
                <button
                    class="w-36 h-36 outline outline-surface-600 rounded-full font-semibold text-3xl"
                    on:click={spin}
                >
                    Spin
                </button>
            </div>
        {/if}
        {#if modalState === 'spinner'}
            <div transition:fade>
                <div class="relative h-[150px] w-full overflow-hidden whitespace-nowrap">
                    <!-- left overlay -->
                    <div class="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-surface-800 z-10"></div>
                    <!-- right overlay -->
                    <div class="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-surface-800 z-10"></div>
                    <div class="flex space-x-2 transition-transform duration-[2000ms] ease-in-out" style="transform: translateX({translateVal}px);">
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
        {#if modalState === 'display'}
            <div transition:fade class="absolute inset-0 overflow-hidden">
                <div class="flex flex-col items-center">
                    <img src={selectedGame.image} alt="game cover" class="h-[250px]" />
                    <p class="text-center mt-1">asdkn a alskdnalksdn aslkdn alksdn alksnd alsknd a{getGameName(selectedGame)}</p>
                </div>
            </div>
        {/if}
    </div>
    <hr class="my-4" />
    <div class="flex justify-end">
        <button class="btn btn-ringed-surface mr-6" on:click={() => modalStore.close()}>Close</button>
    </div>
</div>