<script lang="ts">
    import { UserGroupIcon } from "@rgossiaux/svelte-heroicons/solid";
    import { RadioGroup, RadioItem, SlideToggle } from '@skeletonlabs/skeleton';
    import { fade } from 'svelte/transition';
    import { writable, type Writable } from 'svelte/store';
    import { flip } from 'svelte/animate';
    import { page } from '$app/stores';
    import { getValue, sleep } from "$lib/utils";
    import { Library } from "$lib/store";

    const displayType: Writable<string> = writable('grid');
    const username = $page.params.username;
    let collection: Game[] = [];
    let includeExpansions = false;
    let selectedSort = 'alphabetical';
    let filters = {
        playtime: 'any',
        playerCount: 'any',
    }

    const filterExpansions = (games: Game[]) => {
        const copy = [...games];
        return copy.filter(game => {
            if (!includeExpansions) {
                return game['@_type'] === 'boardgame';
            }
            return true;
        })
    }

    const fetchCollection = async () => {
        if ($Library.loaded && $Library.username === username) {
            return filterExpansions($Library.data);
        }

        const response = await fetch(`/api?username=${username}&expansions=${includeExpansions}`);

        if (response.ok) {
            const res = await response.json();
            $Library = {
                data: res,
                username,
                loaded: true
            };
            collection = filterExpansions(res);
            await sleep(150);
            console.log($Library.data[0])
            return res;
        }
    }
    let collectionRequest = fetchCollection();

    const handleFilterExpansions = () => {
        collection = filterExpansions($Library.data);
    }

    const handleSort = () => {
        const copy = [...collection];
        let sorted: Game[] = [];

        switch(selectedSort) {
            case 'release':
                sorted = copy.sort((a: Game, b: Game) => {
                    const releasedA = parseInt(getValue(a.yearpublished));
                    const releasedB = parseInt(getValue(b.yearpublished));
                    return releasedA > releasedB ? -1 : 1;
                });
                break;
            case 'geekRating':
                sorted = copy.sort((a: Game, b: Game) => {
                    const ratingA = getValue(a.statistics.ratings.bayesaverage);
                    const ratingB = getValue(b.statistics.ratings.bayesaverage);
                    return ratingA > ratingB ? -1 : 1;
                });
                break;
            case 'avgRating':
                sorted = copy.sort((a: Game, b: Game) => {
                    const ratingA = getValue(a.statistics.ratings.average);
                    const ratingB = getValue(b.statistics.ratings.average);
                    return ratingA > ratingB ? -1 : 1;
                });
                break;
            case 'weight':
                sorted = copy.sort((a: Game, b: Game) => {
                    const ratingA = getValue(a.statistics.ratings.averageweight);
                    const ratingB = getValue(b.statistics.ratings.averageweight);
                    return ratingA > ratingB ? -1 : 1;
                });
                break;
            case 'alphabetical':
            default:
                sorted = copy.sort((a: Game, b: Game) => {
                    const nameA = getName(a);
                    const nameB = getName(b);
                    return nameA.localeCompare(nameB);
                });
                break;
        }
        collection = sorted;
    }

    const applyFilters = () => {
        const copy = [...$Library.data]; // TODO: This resets sorting...

        collection = copy.filter((game: Game) => {
            if (filters.playerCount !== 'any') {
                const playerCount = parseInt(filters.playerCount);
                const maxplayerCount = parseInt(getValue(game.maxplayers));
                const minplayerCount = parseInt(getValue(game.minplayers));
                if (!(playerCount >= minplayerCount && playerCount <= maxplayerCount)) {
                    return false;
                }
            }
            if (filters.playtime !== 'any') {
                const playtime = parseInt(filters.playtime);
                const maxplaytime = parseInt(getValue(game.maxplaytime));
                if (maxplaytime > playtime) {
                    return false;
                }
            }

            return true;
        })
    }

    const getName = (game: Game) => {
        const name = Array.isArray(game.name)
            ? getValue(game.name[0])
            : getValue(game.name);

        return name.replace(/&#039;/g,"'");
    }

    const parsePlayerCount = (game: Game) => {
        // If min and max are the same, only display one value
        const min = getValue(game['minplayers']);
        const max = getValue(game['maxplayers']);

        return min === max ? min : `${min}-${max}`;
    }
</script>

{#await collectionRequest}
    <div class="h-full flex justify-center items-center">
        <lottie-player
            src="https://assets9.lottiefiles.com/packages/lf20_Wy80jjKz4n.json"
            background="transparent"
            speed="1"
            style="width: 300px; height: 300px;"
            loop
            autoplay
        ></lottie-player>
    </div>
{:then col}
    <div transition:fade class="flex flex-col items-center pt-28 px-4">
        {username}
        <div class="flex items-center space-x-4">
            <span class="flex items-center">
                <label for="sort" class="mr-2">Sort:</label>
                <select bind:value={selectedSort} name="sort" id="sort" on:change={handleSort}>
                    <option value="alphabetical">Alphabetical</option>
                    <option value="release">Release Date</option>
                    <option value="geekRating">Geek Rating</option>
                    <option value="avgRating">Average Rating</option>
                    <option value="weight">Weight</option>
                </select>
            </span>
            <SlideToggle bind:checked={includeExpansions} size="sm" on:change={handleFilterExpansions}>
                Include expansions
            </SlideToggle>
            <!-- Display toggle buttons -->
            <RadioGroup selected={displayType}>
                <RadioItem value="list">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                </RadioItem>
                <RadioItem value="grid">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </RadioItem>
            </RadioGroup>
        </div>
        <div class="flex items-center space-x-4">
            <div>
                <span class="flex items-center">
                    <label for="playercount" class="flex-shrink-0 mr-2">Player Count</label>
                    <select bind:value={filters.playerCount} name="playercount" id="playercount">
                        <option value="any">Any</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                        <option value="6+">6+</option>
                    </select>
                </span>
            </div>
            <div>
                <span class="flex items-center">
                    <label for="playtime" class="flex-shrink-0 mr-2">Max Play Time</label>
                    <select bind:value={filters.playtime} name="playtime" id="playtime">
                        <option value="any">Any</option>
                        <option value="15">15 mins</option>
                        <option value="30">30 mins</option>
                        <option value="60">60 mins</option>
                        <option value="90">90 mins</option>
                        <option value="120">120 mins</option>
                        <option value="180">180 mins</option>
                        <option value="240+">240+ mins</option>
                    </select>
                </span>
            </div>
            <button class="btn btn-filled-secondary" on:click={applyFilters}>Apply Filters</button>
        </div>
        {#if $displayType === 'grid'}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-xl">
                {#each collection as game (game['@_id'])}
                    <div
                        class="relative rounded-md shadow-lg p-4 h-96 w-80 m-0 m-auto bg-cover bg-center"
                        style="background-image: url('{game.image}');"
                    >
                        <div class="absolute top-0 left-0 right-0 py-2 px-4 rounded-t-md bg-gradient-to-r via-dark-shade from-dark-shade opacity-90">
                            <p class="unstyled text-gray-100 font-semibold text-lg">
                                {getName(game)}
                            </p>
                        </div>
                        <div class="absolute bottom-0 left-0 right-0">
                            <p>
                                {parsePlayerCount(game)}
                                <UserGroupIcon class="h-6 w-6" />
                            </p>
                        </div>
                    </div>
                {/each}
            </div>
        {:else}
            {#each collection as game (game['@_id'])}
                <div
                    class="card card-glass-surface w-full sm:max-w-[950px] flex rounded-md shadow-md mb-4"
                >
                    <img class="flex-shrink-0 rounded-tl-md rounded-bl-md h-24 w-24 object-cover" src={game.image} alt="game cover" />
                    {getName(game)}
                </div>
            {/each}
        {/if}
    </div>
{:catch error}
    <p>{error}</p>
{/await}