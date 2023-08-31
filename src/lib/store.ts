import { writable, derived } from 'svelte/store';

export const isScreenSmall = writable(false);
export const Library = writable({
    data: [],
    username: '',
    updateRequired: false,
    loaded: false
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