<script lang="ts">
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import ExtraDataModal from '$lib/components/ExtraDataModal.svelte';
    import { modalStore } from '@skeletonlabs/skeleton';
    import { UserGroupIcon, ClockIcon, FireIcon, ScaleIcon, StarIcon } from "@rgossiaux/svelte-heroicons/solid";
    import BestPlayerCountIcon from '$lib/components/icons/BestPlayerCountIcon.svelte';
    import { getGameName, parseGamePlayerCount, getValue, convertToFloat, parseBestPlayerCount } from "$lib/utils";
    import { ratingKey } from "$lib/store";

    export let game: Game;

    const handleGameSelect = (game: Game) => {
        const modalComponent: ModalComponent = {
            // Pass a reference to your custom component
            ref: ExtraDataModal,
            // Add your props as key/value pairs
            props: { game },
        };
        const d: ModalSettings = {
            type: 'component',
            component: modalComponent
        };
        modalStore.trigger(d);
    }
</script>

<div class="card card-glass-surface flex flex-col rounded-md shadow-lg h-96 w-80">
    <div class="p-4 rounded-t-md truncate">
        {getGameName(game)}
    </div>
    <div class="h-full flex">
        <div class="flex-col space-y-2">
            <div class="margin-auto text-center min-w-[56px]">
                <FireIcon class="inline-block h-6 w-6" />
                <p>{convertToFloat(getValue(game.statistics.ratings[$ratingKey]), 1)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <UserGroupIcon class="inline-block h-6 w-6" />
                <p>{parseGamePlayerCount(game)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <BestPlayerCountIcon class="inline-block" />
                <p>{parseBestPlayerCount(game)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <ClockIcon class="inline-block h-6 w-6" />
                <p>{getValue(game.playingtime)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <ScaleIcon class="inline-block h-6 w-6" />
                <p>{convertToFloat(getValue(game.statistics.ratings.averageweight), 1)}</p>
            </div>
            <!-- <hr class="mx-2 opacity-50" /> -->
        </div>
        <div
            class="flex-grow bg-cover bg-center rounded-tl-md rounded-br-md shadow-inner"
            style="background-image: url('{game.image}');"
        >
            <!-- Extra info modal - Hidden until fully implemented -->
            <!-- <button class="absolute bottom-1 right-2" on:click={() => handleGameSelect(game)}>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    class="w-7 h-7"
                >
                    <path stroke-linecap="round" stroke-linejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
            </button> -->
        </div>
    </div>
</div>