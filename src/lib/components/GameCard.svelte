<script lang="ts">
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import ExtraDataModal from '$lib/components/ExtraDataModal.svelte';
    import { getModalStore } from '@skeletonlabs/skeleton';
    import {
        UserGroupSolid,
        ClockSolid,
        FireSolid,
        ScaleSolid,
        ExternalLinkSolid,
        BestPlayerCount
    } from './icons';
    import { getGameName, parseGamePlayerCount, getValue, convertToFloat, parseBestPlayerCount, getGameLink } from "$lib/utils";
    import { ratingKey } from "$lib/store";

    interface Props {
        game: Game;
    }

    let { game }: Props = $props();

    const modalStore = getModalStore();

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

<div class="card flex flex-col rounded-md shadow-lg h-96 w-80">
    <div class="p-4 rounded-t-md truncate h-[55px]">
        {getGameName(game)}
    </div>
    <div class="h-full flex">
        <div class="flex-col space-y-2">
            <div class="margin-auto text-center min-w-[56px]">
                <FireSolid class="inline-block h-6 w-6" />
                <p>{convertToFloat(game.statistics[$ratingKey], 1)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <UserGroupSolid class="inline-block h-6 w-6" />
                <p>{parseGamePlayerCount(game)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <BestPlayerCount class="inline-block" />
                <p>{parseBestPlayerCount(game)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <ClockSolid class="inline-block h-6 w-6" />
                <p>{game.playingtime}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <ScaleSolid class="inline-block h-6 w-6" />
                <p>{convertToFloat(game.statistics.averageweight, 1)}</p>
            </div>
            <!-- <hr class="mx-2 opacity-50" /> -->
        </div>
        <div
            class="relative flex-grow rounded-tl-md rounded-br-md h-[332px]"
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
            <img
                src={game.image}
                loading="lazy"
                class="rounded-tl-md rounded-br-md object-cover object-center w-full h-[332px]"
            />
            <a
                href={getGameLink(game)}
                target="_blank"
                class="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 p-1 rounded-full"
            >
                <ExternalLinkSolid class="h-5 w-5" />
            </a>
        </div>
    </div>
</div>

<style>
    .card {
        background-color: rgb(var(--color-surface-500) / 0.2);
    }
</style>