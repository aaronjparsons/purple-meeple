<script lang="ts">
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import { RadioGroup, RadioItem, modalStore } from '@skeletonlabs/skeleton';
    import { fade } from 'svelte/transition';
    import { writable, type Writable } from 'svelte/store';
    import { page } from '$app/stores';
    import GameCard from "$lib/components/GameCard.svelte";
    import GameRow from "$lib/components/GameRow.svelte";
    import OptionsModal from "$lib/components/OptionsModal.svelte";
    import QRModal from "$lib/components/QRModal.svelte";
    import { getValue, sleep, getGameName } from "$lib/utils";
    import { Library, libraryOptions } from "$lib/store";

    const displayType: Writable<string> = writable('grid');
    const username = $page.params.username;
    let collection: Game[] = [];

    const filterExpansions = (games: Game[]) => {
        const copy = [...games];
        return copy.filter(game => {
            if (!$libraryOptions.includeExpansions) {
                return game['@_type'] === 'boardgame';
            }
            return true;
        })
    }

    const setLibraryOptions = () => {
        const searchParams = new URLSearchParams(window.location.search);
        const filters = ['playtime', 'playerCount', 'geekRating', 'weight'];
        searchParams.forEach((value: string, key: string) => {
            if (filters.includes(key)) {
                $libraryOptions.filters[key] = value;
            } else {
                $libraryOptions[key] = key === 'includeExpansions' ? value === 'true' : value;
            }
        })
    }

    const handleSort = (col: Game[]) => {
        let sorted: Game[] = [];
        const isAsc = $libraryOptions.sort === 'asc';

        switch($libraryOptions.selectedSort) {
            case 'release':
                sorted = col.sort((a: Game, b: Game) => {
                    const releasedA = parseInt(getValue(a.yearpublished));
                    const releasedB = parseInt(getValue(b.yearpublished));
                    return isAsc
                        ? releasedA > releasedB ? -1 : 1
                        : releasedA > releasedB ? 1 : -1
                });
                break;
            case 'geekRating':
                sorted = col.sort((a: Game, b: Game) => {
                    const ratingA = getValue(a.statistics.ratings.bayesaverage);
                    const ratingB = getValue(b.statistics.ratings.bayesaverage);
                    return isAsc
                        ? ratingA > ratingB ? -1 : 1
                        : ratingA > ratingB ? 1 : -1
                });
                break;
            case 'weight':
                sorted = col.sort((a: Game, b: Game) => {
                    const ratingA = getValue(a.statistics.ratings.averageweight);
                    const ratingB = getValue(b.statistics.ratings.averageweight);
                    return isAsc
                        ? ratingA > ratingB ? -1 : 1
                        : ratingA > ratingB ? 1 : -1
                });
                break;
            case 'alphabetical':
            default:
                sorted = col.sort((a: Game, b: Game) => {
                    const nameA = getGameName(a);
                    const nameB = getGameName(b);
                    return isAsc
                        ? nameA.localeCompare(nameB)
                        : nameB.localeCompare(nameA)
                });
                break;
        }

        return sorted;
    }

    const applyFilters = (col: Game[]) => {
        col = col.filter((game: Game) => {
            if (!$libraryOptions.includeExpansions && game['@_type'] !== 'boardgame') {
                return false;
            }

            if ($libraryOptions.filters.playerCount !== 'any') {
                const playerCount = parseInt($libraryOptions.filters.playerCount);
                const maxplayerCount = parseInt(getValue(game.maxplayers));
                const minplayerCount = parseInt(getValue(game.minplayers));
                if (!(playerCount >= minplayerCount && playerCount <= maxplayerCount)) {
                    return false;
                }
            }
            if ($libraryOptions.filters.playtime !== 'any') {
                const playtime = parseInt($libraryOptions.filters.playtime);
                const maxplaytime = parseInt(getValue(game.maxplaytime));
                if (maxplaytime > playtime) {
                    return false;
                }
            }
            if ($libraryOptions.filters.geekRating !== 'any') {
                const rating = parseInt($libraryOptions.filters.geekRating);
                const geekRating = parseFloat(getValue(game.statistics.ratings.bayesaverage));
                if (geekRating < rating) {
                    return false;
                }
            }
            if ($libraryOptions.filters.weight !== 'any') {
                const weight = parseInt($libraryOptions.filters.weight);
                const avgweight = parseFloat(getValue(game.statistics.ratings.averageweight));
                if (avgweight > weight) {
                    return false;
                }
            }

            return true;
        })

        return col;
    }

    const openQR = () => {
        const modalComponent: ModalComponent = {
            // Pass a reference to your custom component
            ref: QRModal,
            // Add your props as key/value pairs
            props: {  },
        };
        const d: ModalSettings = {
            type: 'component',
            component: modalComponent
        };
        modalStore.trigger(d);
    }

    const openOptions = () => {
        const modalComponent: ModalComponent = {
            // Pass a reference to your custom component
            ref: OptionsModal,
            // Add your props as key/value pairs
            props: {  },
        };
        const d: ModalSettings = {
            type: 'component',
            component: modalComponent,
            response: applyOptions
        };
        modalStore.trigger(d);
    }

    const sortAndFilter = (arr: Game[]) => {
        let copy = [...arr];
        copy = applyFilters(copy);
        copy = handleSort(copy);
        return copy;
    }

    const applyOptions = () => {
        collection = sortAndFilter($Library.data);
        setSearchParams();
    }

    const fetchCollection = async () => {
        // Set options based on search params
        setLibraryOptions();

        // TODO: run this through the applyOptions
        if ($Library.loaded && $Library.username === username) {
            collection = sortAndFilter($Library.data);
            return collection;
        }

        const response = await fetch(`/api?username=${username}`);

        if (response.ok) {
            const res = await response.json();
            $Library = {
                data: res,
                username,
                loaded: true
            };
            collection = sortAndFilter(res);
            await sleep(150);
            console.log($Library.data[0])
            return res;
        }
    }
    let collectionRequest = fetchCollection();

    const setSearchParams = () => {
        const obj = {
            includeExpansions: $libraryOptions.includeExpansions,
            selectedSort: $libraryOptions.selectedSort,
            sort: $libraryOptions.sort,
            ...$libraryOptions.filters
        }
        const url = Object.entries(obj).map(([key, value]) => {
            return `${key}=${value}`;
        }).join('&');

        window.history.replaceState(null, '', `?${url}`);
    }
</script>

{#await collectionRequest}
    <div class="h-full flex flex-col justify-center items-center">
        <lottie-player
            src="https://assets9.lottiefiles.com/packages/lf20_Wy80jjKz4n.json"
            background="transparent"
            speed="1"
            style="width: 300px; height: 300px;"
            loop
            autoplay
        ></lottie-player>
        <h3 class="mt-8">This may take some time if you have a large collection, or if this is the first time loading your collection.</h3>
    </div>
{:then col}
    <div transition:fade class="flex flex-col items-center pt-28 px-4 m-auto sm:max-w-[1020px]">
        Showing {collection.length} games
        <div class="w-full flex justify-end mb-4 h-[42px]">
            <button class="btn btn-base btn-filled-secondary mr-4" on:click={openQR}>QR</button>
            <button class="btn btn-base btn-filled-secondary mr-4" on:click={openOptions}>Options</button>
            <RadioGroup selected={displayType}>
                <RadioItem value="list">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 22 22" stroke="currentColor" stroke-width="2">
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
        {#if $displayType === 'grid'}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each collection as game}
                    <GameCard {game} />
                {/each}
            </div>
        {:else}
            {#each collection as game}
                <GameRow {game} />
            {/each}
        {/if}
    </div>
{:catch error}
    <div class="h-full flex justify-center items-center">
        <p>{error.status}</p>
        <!-- TODO: Handle 404, 429, general -->
    </div>
{/await}