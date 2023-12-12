<script lang="ts">
    import { page } from '$app/stores';
    import dayjs from 'dayjs';
    import logo from '$lib/assets/purple_meeple_150.png';
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
    <div class="h-full flex flex-col justify-center items-center p-8">
        <lottie-player
            src="https://assets9.lottiefiles.com/packages/lf20_Wy80jjKz4n.json"
            background="transparent"
            speed="1"
            style="width: 300px; height: 300px;"
            loop
            autoplay
        ></lottie-player>
    </div>
{:then stats}
    <div class="w-full flex justify-center my-4">
        <img class="h-8 w-8 mt-5 sm:h-14 sm:w-14 sm:mt-4 mr-2 -rotate-12" alt="Purple Meeple logo" src={logo} />
        <h1 class="font-title text-center text-4xl sm:text-6xl font-bold my-4">Purple Meeple</h1>
    </div>
    <div class="p-8 flex justify-center">
        <div class="w-full sm:max-w-[720px] flex flex-col gap-4">
            <div class="grid grid-cols-2 gap-4">
                <YearInReviewCard>
                    <p class="sm:text-xl">Total Games Played</p>
                    <p class="text-7xl">{ stats.totalPlayed }</p>
                </YearInReviewCard>
                <YearInReviewCard>
                    <p class="sm:text-xl">Unique Games Played</p>
                    <p class="text-7xl">{ stats.uniquePlayed }</p>
                </YearInReviewCard>
            </div>

            <!-- Most played game -->
            <YearInReviewCard>
                <div class="flex flex-col sm:flex-row">
                    <img src={stats.images[stats.mostPlayedByCount[0].id]} class="rounded-md w-72" />
                    <div class="flex-grow flex justify-center">
                        <div class="ml-4">
                            <p class="sm:text-3xl text-center my-2">Most Played Games</p>
                            <hr class="my-4" />
                            <div class="space-y-1">
                                {#each stats.mostPlayedByCount as game}
                                    <div class="flex justify-between text-xl">
                                        <p>{@html game.name }</p>
                                        <p>{ game.playCount }</p>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            </YearInReviewCard>

            <YearInReviewCard>
                <div class="flex flex-col sm:flex-row-reverse">
                    <img src={stats.images[stats.mostPlayedByTime[0].id]} class="rounded-md w-72" />
                    <div class="flex-grow flex justify-center">
                        <div class="mr-4">
                            <p class="sm:text-3xl text-center my-2">Most Played Games</p>
                            <hr class="my-4" />
                            <div class="space-y-1">
                                {#each stats.mostPlayedByTime as game}
                                    <div class="flex justify-between text-xl">
                                        <p>{@html game.name }</p>
                                        <p>{ game.length }</p>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            </YearInReviewCard>

            <div class="grid grid-cols-2 gap-4">
                <YearInReviewCard>
                    <p class="sm:text-xl">Favorite Categories</p>
                    {#each stats.categories as category}
                        <p>{ category.name }</p>
                    {/each}
                </YearInReviewCard>
                <YearInReviewCard>
                    <p class="sm:text-xl">Favorite Mechanics</p>
                    {#each stats.mechanics as mechanic}
                        <p>{ mechanic.name }</p>
                    {/each}
                </YearInReviewCard>
            </div>

            <YearInReviewCard>
                <p class="sm:text-xl">Days played</p>
                <p class="text-5xl">{ stats.daysPlayed }</p>
            </YearInReviewCard>

            <div class="grid grid-cols-2 gap-4">
                <YearInReviewCard>
                    <p class="sm:text-xl">Busiest Day</p>
                    <p class="text-5xl">{ dayjs(stats.daysMostPlayed[0].date).format('MMMM D') }</p>
                    <p>{ stats.daysMostPlayed[0].plays.length } games played</p>
                </YearInReviewCard>
                <YearInReviewCard>
                    <p class="sm:text-xl">Busiest Month</p>
                    <p class="text-5xl">{ stats.monthMostPlayed.month }</p>
                    <p>{ stats.monthMostPlayed.playCount } games played</p>
                </YearInReviewCard>
            </div>

            <YearInReviewCard>
                <p class="sm:text-xl">Total Time Played</p>
                <p class="text-5xl">{ stats.totalTimePlayed }<span class="text-sm ml-2">minutes</span></p>
            </YearInReviewCard>
            <YearInReviewCard>
                <p class="sm:text-xl">Longest Session</p>
                <p class="text-5xl">{ stats.longestPlaySession.length }<span class="text-sm ml-2">minutes</span></p>
                <p>{ stats.longestPlaySession.name }</p>
            </YearInReviewCard>
        </div>
    </div>
{/await}