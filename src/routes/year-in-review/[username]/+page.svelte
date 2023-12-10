<script lang="ts">
    import { page } from '$app/stores';
    import dayjs from 'dayjs';
    import YearInReviewCard from '$lib/components/YearInReviewCard.svelte';
    import { getGameName } from '$lib/utils';

    const username = $page.params.username;

    const fetchPlays = async () => {
        const response = await fetch(`/api/year-in-review?username=${username}`);

        if (response.ok) {
            const res = await response.json();
            return res;
        }
    }

    let playsRequest = fetchPlays();
</script>

{#await playsRequest}
    Loading
{:then stats}
    <div class="p-8 flex justify-center">
        <div class="w-full sm:max-w-[1020px] flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
                <YearInReviewCard>
                    <p>Total Games Played</p>
                    <p class="text-3xl">{ stats.totalPlayed }</p>
                </YearInReviewCard>
                <YearInReviewCard>
                    <p>Unique Games Played</p>
                    <p class="text-3xl">{ stats.uniquePlayed }</p>
                </YearInReviewCard>
            </div>

            <!-- Most played game -->
            <YearInReviewCard>
                <img src={stats.mostPlayedByCount[0].image} class="rounded-md h-36 w-full object-cover" />
                <p class="text-center my-2">Most Played Games</p>
                <div>
                    {#each stats.mostPlayedByCount as game}
                        <div class="flex justify-between">
                            <p>{ getGameName(game) }</p>
                            <p>{ game.playCount }</p>
                        </div>
                    {/each}
                </div>
            </YearInReviewCard>

            <!-- Sessions by playtime -->
            <div class="grid grid-cols-2 gap-4">
                <YearInReviewCard>
                    <p>Total Time Played</p>
                    <p class="text-3xl">{ stats.totalTimePlayed }<span class="text-sm ml-2">minutes</span></p>
                </YearInReviewCard>
                <YearInReviewCard>
                    <p>Days played</p>
                    <p class="text-3xl">{ stats.daysPlayed }</p>
                </YearInReviewCard>
            </div>
            <YearInReviewCard>
                <p>Longest Session</p>
                <p>{ stats.longestPlaySession.length }</p>
                <p>{ stats.longestPlaySession.name }</p>
            </YearInReviewCard>

            <YearInReviewCard>
                <p>Busiest Day</p>
                <p>{ dayjs(stats.daysMostPlayed[0].date).format('MMMM D') }</p>
                <p>{ stats.daysMostPlayed[0].plays.length } games played</p>
            </YearInReviewCard>

            <YearInReviewCard>
                <p>Favorite Categories</p>
                {#each stats.categories as category}
                    <p>{ category.name }</p>
                {/each}
            </YearInReviewCard>
            <YearInReviewCard>
                <p>Favorite Mechanics</p>
                {#each stats.mechanics as mechanic}
                    <p>{ mechanic.name }</p>
                {/each}
            </YearInReviewCard>
        </div>
    </div>
{/await}