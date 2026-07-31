<script lang="ts">
    import { onMount } from 'svelte';
    import { modalStore } from '@skeletonlabs/skeleton';
    import GameRow from './GameRow.svelte';
    import { sleep, getRandomInt, getGameName } from '$lib/utils';

    export let mechanic: string = '';
    export let games: Game[];

</script>

<style>
</style>

<div class="card w-modal p-4 shadow-lg">
    <h1 class="h1 mb-6">{mechanic}</h1>

    <div class="flex flex-col items-center max-h-[60vh] overflow-y-auto">
        {#each games as game}
            <GameRow {game} />
        {/each}
    </div>

    <div class="flex justify-end mt-4">
        <button class="btn variant-ringed-surface mr-6" on:click|preventDefault={() => modalStore.close()}>
            Close
        </button>
    </div>
</div>