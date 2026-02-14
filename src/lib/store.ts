import { writable, derived } from 'svelte/store';

export const isScreenSmall = writable(false);
export const Library = writable({
    data: [],
    username: '',
    updateRequired: false,
    loaded: false,
    gameCount: 0,
});
export const libraryLoaded = writable(false);
export const libraryOptions = writable({
    includeExpansions: false,
    useGeekRating: true,
    selectedSort: 'alphabetical',
    sort: 'asc',
    filters: {
        playtime: 'any',
        playerCount: 'any',
        bestPlayerCount: 'any',
        weight: 'any',
        rating: 'any',
        played: 'all'
    }
})
export const ratingKey = derived(
	libraryOptions,
	$libraryOptions => $libraryOptions.useGeekRating ? 'bayesaverage' : 'average'
);
export const libraryStats = writable({
    initialized: false,
    mechanics: {},
    playerCounts: {
        '1': [],
        '2': [],
        '3': [],
        '4': [],
        '5': [],
        '6': [],
        '7': [],
        '8': [],
        '9+': []
    },
    leastCommon: {
        game: null,
        owned: Infinity
    },
    mostCommon: {
        game: null,
        owned: 0
    },
    mostPlayed: {
        game: '',
        count: 0
    },
    topDesigner: {
        name: '',
        count: 0
    },
    weights: {
        '1-2': 0,
        '2-3': 0,
        '3-4': 0,
        '4-5': 0,
    }
});