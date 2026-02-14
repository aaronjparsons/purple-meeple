<script lang="ts">
    import { onMount, tick } from "svelte";
    import Chart from "chart.js/auto";
    import { bggToSimplifiedMechanics } from "$lib/mechanicsMap";
    import { libraryStats, isScreenSmall } from "$lib/store";

    export let collection: Game[] = [];

    let playerCountChartCanvas: HTMLCanvasElement;
    let weightChartCanvas: HTMLCanvasElement;
    let mechanicsChartCanvas: HTMLCanvasElement;

    const createPlayerCountChart = () => {
        new Chart(playerCountChartCanvas, {
            type: "bar",
            data: {
                labels: Object.keys($libraryStats.playerCounts),
                datasets: [{
                    label: "# of games",
                    data: Object.values($libraryStats.playerCounts).map(games => games.length),
                    backgroundColor: "rgba(82, 225, 149, 1)",
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: "#fff"
                        },
                        title: {
                            display: true,
                            text: "Player count",
                            color: "#fff",
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: "#fff",
                            stepSize: 10
                        },
                        title: {
                            display: true,
                            text: "# of games",
                            color: "#fff",
                        }
                    }
                }
            }
        });
    }

    const createWeightChart = () => {
        new Chart(weightChartCanvas, {
            type: "bar",
            data: {
                labels: Object.keys($libraryStats.weights),
                datasets: [{
                    label: "# of games",
                    data: Object.values($libraryStats.weights),
                    backgroundColor: "rgba(82, 225, 149, 1)",
                }]
            },
            options: {
                plugins: {
                    legend: {
                        display: false
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: "#fff"
                        },
                        title: {
                            display: true,
                            text: "Weight",
                            color: "#fff",
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: "#fff",
                            stepSize: 10
                        },
                        title: {
                            display: true,
                            text: "# of games",
                            color: "#fff",
                        }
                    }
                }
            }
        });
    }

    const createMechanicsChart = () => {
        new Chart(mechanicsChartCanvas, {
            type: "bar",
            data: {
                labels: Object.keys($libraryStats.mechanics),
                datasets: [{
                    label: "# of games",
                    data: Object.values($libraryStats.mechanics).map(mechanic => mechanic.length),
                    backgroundColor: "rgba(82, 225, 149, 1)",
                }]
            },
            options: {
                indexAxis: 'y',
                plugins: {
                    legend: {
                        display: false
                    }
                },
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: "#fff",
                            stepSize: 10,
                        },
                        title: {
                            display: true,
                            text: "# of games",
                            color: "#fff",
                        }
                    },
                    y: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            autoSkip: false,
                            color: "#fff",
                        },
                        title: {
                            display: true,
                            text: "Mechanic",
                            color: "#fff",
                        }
                    }
                }
            }
        });
    }

    onMount(async () => {
        if (!$libraryStats.initialized) {
            const dedupedMechanics = new Set(Object.values(bggToSimplifiedMechanics));
            $libraryStats.mechanics = [...dedupedMechanics].reduce((acc, mechanic) => {
                acc[mechanic] = [];
                return acc;
            }, {});
            const designers: Record<string, number> = {};

            collection.forEach(game => {
                game.mechanics.forEach(mechanic => {
                    $libraryStats.mechanics[mechanic].push(game);
                })

                if (game.minplayers > 0 && game.maxplayers > 0) {
                    for (let i = game.minplayers; i <= Math.min(game.maxplayers, 9); i++) {
                        const key = i === 9 ? "9+" : i.toString();
                        $libraryStats.playerCounts[key].push(game);
                    }
                }

                const weight = Number(game.statistics.averageweight);
                for (let [range, value] of Object.entries($libraryStats.weights)) {
                    const [min, max] = range.split('-');
                    if (weight > Number(min) && weight < Number(max)) {
                        $libraryStats.weights[range]++;
                    }
                }

                if (designers.hasOwnProperty(game.link.boardgamedesigner)) {
                    designers[game.link.boardgamedesigner]++;
                } else {
                    designers[game.link.boardgamedesigner] = 1;
                }

                const owned = Number(game.statistics.owned);
                if (owned < $libraryStats.leastCommon.owned) {
                    $libraryStats.leastCommon.game = game;
                    $libraryStats.leastCommon.owned = owned;
                }
                if (owned > $libraryStats.mostCommon.owned) {
                    $libraryStats.mostCommon.game = game;
                    $libraryStats.mostCommon.owned = owned;
                }

                const plays = game.numplays;
                if (plays > $libraryStats.mostPlayed.count) {
                    $libraryStats.mostPlayed.count = plays;
                    $libraryStats.mostPlayed.game = game;
                }
            })



            const topDesigner = Object.entries(designers).reduce((max, [name, count]) =>
                count > max.count ? { name, count } : max,
                { name: '', count: 0 }
            );
            $libraryStats.topDesigner = topDesigner;

            $libraryStats.initialized = true;
        }


        await tick();

        createPlayerCountChart();
        createWeightChart();
        createMechanicsChart();

        console.log('libraryStats:', $libraryStats);
    })
</script>

{#if !$libraryStats.initialized}
    <p>Loading stats...</p>
{:else}
    <div class="w-full grid grid-cols-2 gap-4">
        <div class="card rounded-md shadow-lg p-4 variant-ghost-tertiary col-span-2 sm:col-span-1">
            <div class="flex flex-col sm:flex-row items-center sm:items-start">
                <img
                    src={$libraryStats.mostCommon.game.image}
                    class="rounded-md w-32"
                    alt={$libraryStats.mostCommon.game.name}
                />
                <div class="flex-grow flex justify-center">
                    <div class="w-full ml-4">
                        <p class="text-xl sm:text-2xl text-center my-2">Most Common Game</p>
                        <hr class="my-2" />
                        <p class="text-xl sm:text-2xl text-center my-2">{$libraryStats.mostCommon.game.name}</p>
                        <p class="text-center">Owned by {$libraryStats.mostCommon.owned.toLocaleString()} BGG users</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="card rounded-md shadow-lg p-4 variant-ghost-tertiary col-span-2 sm:col-span-1">
            <div class="flex flex-col-reverse sm:flex-row items-center sm:items-start">
                <div class="flex-grow flex justify-center">
                    <div class="w-full ml-4">
                        <p class="text-xl sm:text-2xl text-center my-2">Rarest Game</p>
                        <hr class="my-2" />
                        <p class="text-xl sm:text-2xl text-center my-2">{$libraryStats.leastCommon.game.name}</p>
                        <p class="text-center">Owned by {$libraryStats.leastCommon.owned.toLocaleString()} BGG users</p>
                    </div>
                </div>
                <img
                    src={$libraryStats.leastCommon.game.image}
                    class="rounded-md w-32"
                    alt={$libraryStats.leastCommon.game.name}
                />
            </div>
        </div>

        <div class="card rounded-md shadow-lg p-4 variant-ghost-tertiary col-span-2 sm:col-span-1">
            <div class="flex-grow flex justify-center">
                <div class="w-full ml-4">
                    <p class="text-xl sm:text-2xl text-center my-2">Favorite Designer(s)</p>
                    <hr class="my-2" />
                    <p class="text-xl sm:text-2xl text-center my-2">{$libraryStats.topDesigner.name}</p>
                    <p class="text-center">{$libraryStats.topDesigner.count} games owned</p>
                </div>
            </div>
        </div>

        <div class="card rounded-md shadow-lg p-4 variant-ghost-tertiary col-span-2 sm:col-span-1">
            <div class="flex flex-col-reverse sm:flex-row items-center sm:items-start">
                <div class="flex-grow flex justify-center">
                    <div class="w-full ml-4">
                        <p class="text-xl sm:text-2xl text-center my-2">Most Played Game</p>
                        <hr class="my-2" />
                        {#if $libraryStats.mostPlayed.count > 0}
                            <p class="text-xl sm:text-2xl text-center my-2">{$libraryStats.mostPlayed.game.name}</p>
                            <p class="text-center">{$libraryStats.mostPlayed.count.toLocaleString()} plays</p>
                        {:else}
                            <p class="text-center my-2">You do not have any plays logged</p>
                        {/if}
                    </div>
                </div>
                {#if $libraryStats.mostPlayed.count > 0}
                    <img
                        src={$libraryStats.mostPlayed.game.image}
                        class="rounded-md w-32"
                        alt={$libraryStats.mostPlayed.game.name}
                    />
                {/if}
            </div>
        </div>

        <div class="card rounded-md shadow-lg p-4 variant-ghost-tertiary col-span-2">
            <p class="text-xl sm:text-2xl text-center my-2">Player Count Distribution</p>
            <canvas bind:this={playerCountChartCanvas}></canvas>
        </div>

        <div class="card rounded-md shadow-lg p-4 variant-ghost-tertiary col-span-2">
            <p class="text-xl sm:text-2xl text-center my-2">Weight Distribution</p>
            <canvas bind:this={weightChartCanvas}></canvas>
        </div>

        <div class="card rounded-md shadow-lg p-4 variant-ghost-tertiary col-span-2">
            <p class="text-xl sm:text-2xl text-center my-2">Mechanics Distribution</p>
            <canvas height={$isScreenSmall ? 500 : 300} bind:this={mechanicsChartCanvas}></canvas>
        </div>
    </div>
{/if}