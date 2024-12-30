<script lang="ts">
    import { onMount } from 'svelte';
    import { fly } from 'svelte/transition';
    import dayjs from 'dayjs';
    import YearInReviewCard from '$lib/components/YearInReviewCard.svelte';

    export let username = '';
    export let stats = {};
    export let year = 0;

    let hasTimeBasedStats = true;

    onMount(() => {
        hasTimeBasedStats = stats.totalTimePlayed > 0;
    });
</script>

<div class="p-8 flex justify-center" id="container">
    <div class="w-full sm:max-w-[720px] flex flex-col gap-4">
        <div class="w-full flex flex-col items-center font-title font-semibold text-5xl sm:text-6xl mb-4" in:fly={{ delay: 0, y: -50 }}>
            <p class="bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">Year in Review</p>
            <p class="-mt-4 bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent box-decoration-clone">{year}</p>
            <p class="pb-4 bg-gradient-to-br from-pink-500 to-violet-500 bg-clip-text text-transparent box-decoration-clone">{username}</p>
        </div>

        <div class="grid grid-cols-2 gap-4 text-center sm:text-left" in:fly={{ delay: 100, y: -50 }}>
            <YearInReviewCard bgClass="bg-gradient-to-br variant-gradient-primary-secondary">
                <p class="sm:text-xl">Total Games Played</p>
                <p class="text-5xl sm:text-7xl">{ stats.totalPlayed }</p>
            </YearInReviewCard>
            <YearInReviewCard bgClass="bg-gradient-to-br variant-gradient-primary-secondary">
                <p class="sm:text-xl">Unique Games Played</p>
                <p class="text-5xl sm:text-7xl">{ stats.uniquePlayed }</p>
            </YearInReviewCard>
        </div>

        <!-- Most played game -->
        <div in:fly={{ delay: 200, y: -50 }}>
            <YearInReviewCard bgClass="variant-ghost-tertiary">
                <div class="flex flex-col sm:flex-row items-center sm:items-start">
                    <img
                        src={stats.images[stats.mostPlayedByCount[0].id]}
                        class="rounded-md w-72"
                        alt={stats.mostPlayedByCount[0].name}
                    />
                    <div class="flex-grow flex justify-center">
                        <div class="ml-4">
                            <p class="text-xl sm:text-3xl text-center my-2">Most Played <span class="text-sm sm:text-base">(Play Count)</span></p>
                            <hr class="my-4" />
                            <div class="space-y-1">
                                {#each stats.mostPlayedByCount as game}
                                    <div class="flex justify-between text-lg sm:text-xl space-x-4">
                                        <p>{@html game.name }</p>
                                        <p>{ game.playCount }</p>
                                    </div>
                                {/each}
                            </div>
                        </div>
                    </div>
                </div>
            </YearInReviewCard>
        </div>

        {#if hasTimeBasedStats}
            <div in:fly={{ delay: 300, y: -50 }}>
                <YearInReviewCard>
                    <div class="flex flex-col sm:flex-row-reverse items-center sm:items-start">
                        <img
                            src={stats.images[stats.mostPlayedByTime[0].id]}
                            class="rounded-md w-72"
                            alt={stats.mostPlayedByTime[0].name}
                        />
                        <div class="flex-grow flex justify-center">
                            <div class="mr-4">
                                <p class="text-xl sm:text-3xl text-center my-2">Most Played <span class="text-sm sm:text-base">(Play Time)</span></p>
                                <hr class="my-4" />
                                <div class="space-y-1">
                                    {#each stats.mostPlayedByTime as game}
                                        <div class="flex justify-between text-lg sm:text-xl space-x-4">
                                            <p>{@html game.name }</p>
                                            <p class="whitespace-nowrap">{ game.length } <span class="text-sm">mins</span></p>
                                        </div>
                                    {/each}
                                </div>
                            </div>
                        </div>
                    </div>
                </YearInReviewCard>
            </div>
        {/if}

        <div in:fly={{ delay: 400, y: -50 }}>
            <YearInReviewCard bgClass={hasTimeBasedStats ? 'variant-ghost-tertiary' : 'variant-ghost-surface'}>
                <p class="text-xl sm:text-3xl text-center sm:text-left">Based on your most played games</p>
                <hr class="my-4" />
                <div class="w-full flex flex-col sm:flex-row text-center sm:text-left gap-y-4">
                    <div class="flex-grow">
                        <p class="text-2xl">Top Categories:</p>
                        {#each stats.categories as category}
                            <p>- { category.name }</p>
                        {/each}
                    </div>
                    <div class="h-full border-r border-gray-200"></div>
                    <div class="flex-grow">
                        <p class="text-2xl">Top Mechanics:</p>
                        {#each stats.mechanics as mechanic}
                            <p>- { mechanic.name }</p>
                        {/each}
                    </div>
                </div>
            </YearInReviewCard>
        </div>

        <div in:fly={{ delay: 500, y: -50 }}>
            <YearInReviewCard bgClass={hasTimeBasedStats ? 'variant-ghost-surface' : 'variant-ghost-tertiary'}>
                <p class="sm:text-xl">Days played</p>
                <p class="text-5xl">{ stats.daysPlayed }</p>
            </YearInReviewCard>
        </div>

        <div in:fly={{ delay: 600, y: -50 }}>
            <div class="card flex rounded-md shadow-lg variant-ghost-surface">
                <YearInReviewCard bgClass="flex-shrink-0 flex flex-col justify-center items-start bg-gradient-to-br variant-gradient-primary-secondary">
                    <p class="sm:text-xl">Busiest Day</p>
                    <p class="text-2xl sm:text-5xl">{ dayjs(stats.daysMostPlayed.date).format('MMMM D') }</p>
                    <div class="flex justify-between">
                        <p>{ stats.daysMostPlayed.plays.count } games played</p>
                    </div>
                </YearInReviewCard>
                <div class="flex-grow p-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {#each stats.daysMostPlayed.plays.games as game}
                        <div class="flex space-x-2">
                            <p class="flex-grow truncate">{game.name}</p>
                            <p><span class="text-xs mr-0.5">x</span>{game.count}</p>
                        </div>
                    {/each}
                </div>
            </div>
        </div>

        <div in:fly={{ delay: 700, y: -50 }}>
            <div class="card flex rounded-md shadow-lg variant-ghost-surface">
                <div class="flex-grow p-4 grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1">
                    {#each stats.monthMostPlayed.plays.games as game}
                        <div class="flex space-x-2">
                            <p class="flex-grow truncate">{game.name}</p>
                            <p><span class="text-xs mr-0.5">x</span>{game.count}</p>
                        </div>
                    {/each}
                </div>
                <YearInReviewCard bgClass="flex-shrink-0 flex flex-col justify-center items-end bg-gradient-to-br variant-gradient-primary-secondary">
                    <p class="sm:text-xl">Busiest Month</p>
                    <p class="text-2xl sm:text-5xl">{ stats.monthMostPlayed.month }</p>
                    <p>{ stats.monthMostPlayed.plays.count } games played</p>
                </YearInReviewCard>
            </div>
        </div>

        {#if hasTimeBasedStats}
            <div in:fly={{ delay: 800, y: -50 }}>
                <YearInReviewCard bgClass="variant-ghost-tertiary">
                    <p class="sm:text-xl">Total Time Played</p>
                    <p class="text-5xl">{ stats.totalTimePlayed }<span class="text-sm ml-2">minutes</span></p>
                </YearInReviewCard>
            </div>
            <div in:fly={{ delay: 900, y: -50 }}>
                <YearInReviewCard>
                    <div class="flex flex-col sm:flex-row-reverse items-center sm:items-start">
                        <img
                            src={stats.images[stats.longestPlaySession.id]}
                            class="rounded-md w-72"
                            alt={stats.longestPlaySession.name}
                        />
                        <div class="flex-grow flex justify-center">
                            <div class="mr-4">
                                <p class="text-xl sm:text-3xl text-center my-2">Longest Play Session</p>
                                <hr class="my-4" />
                                <p class="text-center text-xl sm:text-2xl mb-6">{ stats.longestPlaySession.name }</p>
                                <p class="text-center text-6xl">{ stats.longestPlaySession.length }</p>
                                <p class="text-center text-sm sm:text-lg">minutes</p>
                            </div>
                        </div>
                    </div>
                </YearInReviewCard>
            </div>
        {/if}
    </div>
</div>