<script lang="ts">
    import { onMount } from 'svelte';
    import { getModalStore } from '@skeletonlabs/skeleton';
    import { sleep, getRandomInt, getGameName } from '$lib/utils';

    interface Props {
        game: Game;
    }

    let { game }: Props = $props();

    const modalStore = getModalStore();

    onMount(async () => {
        const results = game.poll[0].results;
        const best = results.map(result => {
            const players = result['@_numplayers'];
            const bestVotes = result.result[0]['@_numvotes'];
            return [players, bestVotes];
        })
        console.warn(best);
    })
</script>

<style>
</style>

<div>
    <h1>{ getGameName(game) }</h1>

    <hr class="my-4" />
    <div class="flex justify-end">
        <button class="btn btn-ringed-surface" onclick={() => modalStore.close()}>Close</button>
    </div>
</div>