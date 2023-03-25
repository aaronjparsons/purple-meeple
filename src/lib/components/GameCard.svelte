<script lang="ts">
    import { UserGroupIcon, ClockIcon, FireIcon, ScaleIcon } from "@rgossiaux/svelte-heroicons/solid";
    import { getGameName, parseGamePlayerCount, getValue, convertToFloat } from "$lib/utils";
    import { ratingKey } from "$lib/store";

    export let game: Game;
</script>

<div class="card card-glass-surface flex flex-col rounded-md shadow-lg w-80">
    <div class="p-4 rounded-t-md truncate h-[56px]">
        {getGameName(game)}
    </div>
    <div class="h-[330px] flex">
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
                <ClockIcon class="inline-block h-6 w-6" />
                <p>{getValue(game.playingtime)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
            <div class="margin-auto text-center min-w-[56px]">
                <ScaleIcon class="inline-block h-6 w-6" />
                <p>{convertToFloat(getValue(game.statistics.ratings.averageweight), 1)}</p>
            </div>
            <hr class="mx-2 opacity-50" />
        </div>
        <div class="w-full rounded-tl-md rounded-br-md shadow-inner">
            <img
                class="w-full h-[330px] object-cover rounded-tl-md rounded-br-md"
                src={game.image}
                alt="{getGameName(game)} cover"
                loading="lazy"
            />
        </div>
    </div>
</div>