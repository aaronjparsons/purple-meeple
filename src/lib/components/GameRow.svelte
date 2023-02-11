<script lang="ts">
    import { UserGroupIcon, ClockIcon, FireIcon, ScaleIcon } from "@rgossiaux/svelte-heroicons/solid";
    import { getGameName, convertToFloat, getValue, parseGamePlayerCount } from "$lib/utils";
    import { isScreenSmall } from "$lib/store";

    export let game: Game;

</script>

<div
    class="card card-glass-surface w-full max-w-[500px] flex rounded-md shadow-md mb-4"
>
    <div
        class="bg-cover bg-center flex-shrink-0 rounded-tl-md rounded-bl-md w-24"
        style="background-image: url('{game.image}');"
    ></div>
    <!-- <img class="flex-shrink-0 rounded-tl-md rounded-bl-md w-24 object-cover" src={game.image} alt="game cover" /> -->
    <div class="pt-1 pb-2 px-2">
        <h3 class="mb-1">{getGameName(game)}</h3>
        <div class="grid grid-cols-2 grid-rows-2 gap-x-4 gap-y-1 font-light">
            <div class="flex">
                <FireIcon class="w-6 h-6 mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Geek Rating:'}
                    {convertToFloat(getValue(game.statistics.ratings.bayesaverage), 1)}
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
                <ClockIcon class="w-6 h-6 mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Play Time:'}
                    {getValue(game.playingtime)} mins
                </p>
            </div>
            <div class="flex">
                <ScaleIcon class="w-6 h-6 mr-2" />
                <p>
                    {$isScreenSmall ? '' : 'Weight:'}
                    {convertToFloat(getValue(game.statistics.ratings.averageweight))}
                </p>
            </div>
        </div>
    </div>
</div>

