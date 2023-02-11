import { writable } from 'svelte/store';

export const isScreenSmall = writable(false);
export const Library = writable({
    data: [],
    username: '',
    loaded: false
});
export const libraryLoaded = writable(false);
export const libraryOptions = writable({
    includeExpansions: false,
    selectedSort: 'alphabetical',
    filters: {
        playtime: 'any',
        playerCount: 'any',
        weight: 'any',
        geekRating: 'any'
    }
})