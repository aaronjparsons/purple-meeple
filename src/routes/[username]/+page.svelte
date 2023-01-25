<script lang="ts">
    import { UserGroupIcon } from "@rgossiaux/svelte-heroicons/solid";
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import { RadioGroup, RadioItem, modalStore } from '@skeletonlabs/skeleton';
    import { fade } from 'svelte/transition';
    import { writable, type Writable } from 'svelte/store';
    import { flip } from 'svelte/animate';
    import { page } from '$app/stores';
    import OptionsModal from "$lib/components/OptionsModal.svelte";
    import QRModal from "$lib/components/QRModal.svelte";
    import { getValue, sleep } from "$lib/utils";
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
        const filters = ['playtime', 'playerCount'];
        searchParams.forEach((value: string, key: string) => {
            if (filters.includes(key)) {
                $libraryOptions.filters[key] = value;
            } else {
                $libraryOptions[key] = key === 'includeExpansions' ? value === 'true' : value;
            }
        })
    }

    const handleSort = (col) => {
        let sorted: Game[] = [];

        switch($libraryOptions.selectedSort) {
            case 'release':
                sorted = col.sort((a: Game, b: Game) => {
                    const releasedA = parseInt(getValue(a.yearpublished));
                    const releasedB = parseInt(getValue(b.yearpublished));
                    return releasedA > releasedB ? -1 : 1;
                });
                break;
            case 'geekRating':
                sorted = col.sort((a: Game, b: Game) => {
                    const ratingA = getValue(a.statistics.ratings.bayesaverage);
                    const ratingB = getValue(b.statistics.ratings.bayesaverage);
                    return ratingA > ratingB ? -1 : 1;
                });
                break;
            case 'avgRating':
                sorted = col.sort((a: Game, b: Game) => {
                    const ratingA = getValue(a.statistics.ratings.average);
                    const ratingB = getValue(b.statistics.ratings.average);
                    return ratingA > ratingB ? -1 : 1;
                });
                break;
            case 'weight':
                sorted = col.sort((a: Game, b: Game) => {
                    const ratingA = getValue(a.statistics.ratings.averageweight);
                    const ratingB = getValue(b.statistics.ratings.averageweight);
                    return ratingB > ratingA ? -1 : 1;
                });
                break;
            case 'alphabetical':
            default:
                sorted = col.sort((a: Game, b: Game) => {
                    const nameA = getName(a);
                    const nameB = getName(b);
                    return nameA.localeCompare(nameB);
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
            ...$libraryOptions.filters
        }
        const url = Object.entries(obj).map(([key, value]) => {
            return `${key}=${value}`;
        }).join('&');

        window.history.replaceState(null, '', `?${url}`);
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

    const convertToFloat = (value: string, dec: number = 2) => {
        return parseFloat(value).toFixed(dec);
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
    <div transition:fade class="flex flex-col items-center pt-28 px-4 m-auto sm:max-w-[1020px]">
        Showing {collection.length} games
        <div class="w-full flex justify-end mb-4">
            <button class="btn btn-filled-secondary mr-4" on:click={openQR}>QR</button>
            <button class="btn btn-filled-secondary mr-4" on:click={openOptions}>Options</button>
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
        {#if $displayType === 'grid'}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {#each collection as game (game['@_id'])}
                    <div
                        class="relative rounded-md shadow-lg p-4 h-96 w-80 m-auto bg-cover bg-center"
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
                    class="card card-glass-surface w-full flex rounded-md shadow-md mb-4"
                >
                    <img class="flex-shrink-0 rounded-tl-md rounded-bl-md h-24 w-24 object-cover" src={game.image} alt="game cover" />
                    <div class="p-2">
                        <h3>{getName(game)}</h3>
                        <div class="flex">
                            <div>
                                <p>Geek: {convertToFloat(game.statistics.ratings.bayesaverage['@_value'], 1)}</p>
                                <p>Avg: {convertToFloat(game.statistics.ratings.average['@_value'], 1)}</p>
                            </div>
                            <p>Weight: {convertToFloat(game.statistics.ratings.averageweight['@_value'])}</p>
                        </div>
                    </div>
                </div>
            {/each}
        {/if}
    </div>
{:catch error}
    <div class="h-full flex justify-center items-center">
        <p>{error.status}</p>
        <!-- TODO: Handle 404, 429, general -->
    </div>
{/await}