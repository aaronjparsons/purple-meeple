<script lang="ts">
    import { UserGroupIcon, ClockIcon, FireIcon, ScaleIcon, ArrowSmDownIcon, ArrowSmUpIcon } from "@rgossiaux/svelte-heroicons/solid";
    import { SlideToggle, modalStore, RadioGroup, RadioItem, tooltip } from '@skeletonlabs/skeleton';
    import { onMount, onDestroy } from 'svelte';
    import { writable } from 'svelte/store';
    import { libraryOptions, isScreenSmall } from '$lib/store';

    const localOptions = {
        ...$libraryOptions,
        filters: {
            ...$libraryOptions.filters
        }
    }
    const sortDir = writable(localOptions.sort);
    let sortDirUnsubscribe = () => {};

    onMount(() => {
        sortDirUnsubscribe = sortDir.subscribe(value => {
            localOptions.sort = value;
        })
    })

    onDestroy(() => {
        sortDirUnsubscribe();
    })

    const apply = () => {
        if ($modalStore[0].response) {
            $libraryOptions = localOptions;
            $modalStore[0].response(true);
        }
		modalStore.close();
    }
</script>

<div>
    <h1 class="mb-8">Options</h1>
    <div class="flex flex-wrap {$isScreenSmall ? 'space-y-2' : 'space-x-6'}">
        <SlideToggle bind:checked={localOptions.includeExpansions} size="sm">
            Include expansions
        </SlideToggle>
        <span class="flex">
            <SlideToggle bind:checked={localOptions.useGeekRating} size="sm" class="mr-2">
                Use Geek rating
            </SlideToggle>
            <span use:tooltip={{ content: 'BGG uses a Bayesian average to determine a games geek rating' }}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
            </span>
        </span>
    </div>
    <hr class="my-4" />
    <div class="flex items-end space-x-4">
        <label class="input-label w-1/2">
            <span>Sorting</span>
            <select bind:value={localOptions.selectedSort} name="sort" id="sort">
                <option value="alphabetical">Alphabetical</option>
                <option value="release">Release Date</option>
                <option value="rating">{ localOptions.useGeekRating ? 'Geek' : 'Avg' } Rating</option>
                <option value="weight">Weight</option>
            </select>
        </label>
        <div class="w-1/2">
            <RadioGroup selected={sortDir} class="h-[42px]">
                <RadioItem value="asc">
                    <ArrowSmUpIcon class="h-4 w-4" />
                </RadioItem>
                <RadioItem value="desc">
                    <ArrowSmDownIcon class="h-4 w-4" />
                </RadioItem>
            </RadioGroup>
        </div>
    </div>
    <hr class="my-4" />
    <div class="flex space-x-4">
        <label class="input-label w-1/2">
            <span class="align-middle">
                <FireIcon class="inline-block h-6 w-6 mr-2" />Min { localOptions.useGeekRating ? 'Geek' : 'Avg' } Rating
            </span>
            <select bind:value={localOptions.filters.rating} name="rating" id="rating">
                <option value="any">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9</option>
            </select>
        </label>
        <label class="input-label w-1/2 mb-4">
            <span>
                <UserGroupIcon class="inline-block h-6 w-6 mr-2" />
                Player Count
            </span>
            <select bind:value={localOptions.filters.playerCount} name="playercount" id="playercount">
                <option value="any">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6+">6+</option>
            </select>
        </label>
    </div>
    <div class="flex space-x-4">
        <label class="input-label w-1/2">
            <span class="align-middle">
                <ClockIcon class="inline-block h-6 w-6 mr-2" />Max Play Time
            </span>
            <select bind:value={localOptions.filters.playtime} name="playtime" id="playtime">
                <option value="any">Any</option>
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="60">60 mins</option>
                <option value="90">90 mins</option>
                <option value="120">120 mins</option>
                <option value="180">180 mins</option>
                <option value="240+">240+ mins</option>
            </select>
        </label>
        <label class="input-label w-1/2 mb-4">
            <span>
                <ScaleIcon class="inline-block h-6 w-6 mr-2" />
                Max Weight
            </span>
            <select bind:value={localOptions.filters.weight} name="weight" id="weight">
                <option value="any">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </label>
    </div>
    <hr class="my-4" />
    <div class="flex justify-end">
        <button class="btn btn-ringed-surface mr-6" on:click={() => modalStore.close()}>Close</button>
        <button class="btn btn-filled-secondary" on:click={apply}>Apply</button>
    </div>
</div>