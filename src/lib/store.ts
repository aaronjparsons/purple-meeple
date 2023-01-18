import { writable } from 'svelte/store';

export const Library = writable({
    data: [],
    username: '',
    loaded: false
});
export const libraryLoaded = writable(false);