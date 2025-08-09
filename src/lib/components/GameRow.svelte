<script lang="ts">
    import { UserGroupIcon, ClockIcon, FireIcon, ScaleIcon, ExternalLinkIcon, PlayIcon } from "@rgossiaux/svelte-heroicons/solid";
    import BestPlayerCountIcon from '$lib/components/icons/BestPlayerCountIcon.svelte';
    import { getGameName, convertToFloat, getValue, parseGamePlayerCount, parseBestPlayerCount, getGameLink } from "$lib/utils";
    import { isScreenSmall, ratingKey } from "$lib/store";

    export let game: Game;

</script>

<div
    class="card w-full max-w-[540px] flex rounded-md shadow-md mb-4"
>
    <div
        class="relative flex-shrink-0 rounded-tl-md rounded-bl-md w-24 h-[120px]"
    >
        <img
            src={game.image}
            loading="lazy"
            class="rounded-tl-md rounded-bl-md object-cover object-center w-24 h-full"
        />
        <a
            href={getGameLink(game)}
            target="_blank"
            class="absolute bottom-2 right-2 bg-gray-800 bg-opacity-70 p-1 rounded-full"
        >
            <ExternalLinkIcon class="h-5 w-5" />
        </a>
    </div>
    <!-- <img class="flex-shrink-0 rounded-tl-md rounded-bl-md w-24 object-cover" src={game.image} alt="game cover" /> -->
    <div class="pt-1 pb-2 px-2 truncate">
        <h3 class="mb-1 truncate">{getGameName(game)}</h3>
        <div class="grid grid-cols-2 grid-rows-2 gap-x-4 gap-y-1 font-light">
            <div class="flex">
                <FireIcon class="w-6 h-6 mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Geek Rating:'}
                    {convertToFloat(game.statistics[$ratingKey], 1)}
                </p>
            </div>
            <div class="flex">
                <UserGroupIcon class="w-6 h-6 mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Player Count:'}
                    {parseGamePlayerCount(game)}
                </p>
            </div>
            <div class="flex">
                <BestPlayerCountIcon class="mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Best Player Count:'}
                    {parseBestPlayerCount(game)}
                </p>
            </div>
            <div class="flex">
                <ClockIcon class="w-6 h-6 mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Play Time:'}
                    {game.playingtime} mins
                </p>
            </div>
            <div class="flex">
                <ScaleIcon class="w-6 h-6 mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Weight:'}
                    {convertToFloat(game.statistics.averageweight)}
                </p>
            </div>
            <div class="flex">
                <PlayIcon class="w-6 h-6 mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Plays:'}
                    {game.numplays}
                </p>
            </div>
        </div>
    </div>
</div>

<style>
    .card {
        background-color: rgb(var(--color-surface-500) / 0.2);
    }
</style>