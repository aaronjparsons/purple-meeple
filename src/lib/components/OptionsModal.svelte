<script lang="ts">
    import {
        UserGroupSolid,
        ClockSolid,
        FireSolid,
        ScaleSolid,
        ArrowDownSolid,
        ArrowUpSolid,
        PlayCircleSolid,
        BestPlayerCount
    } from './icons';
    import { SlideToggle, getModalStore, RadioGroup, RadioItem, popup } from '@skeletonlabs/skeleton';
    import type { PopupSettings } from "@skeletonlabs/skeleton";
    import { libraryOptions } from '$lib/store';

    const modalStore = getModalStore();
    const localOptions = $state({
        ...$libraryOptions,
        filters: {
            ...$libraryOptions.filters
        }
    })

    const apply = () => {
        if ($modalStore[0].response) {
            $libraryOptions = localOptions;
            $modalStore[0].response(true);
        }
		modalStore.close();
    }

    const geekRatingTooltip: PopupSettings = {
        event: 'hover',
        target: 'geekRatingTooltip',
        placement: 'top'
    };
</script>

<div class="card w-modal p-4 shadow-lg">
    <h1 class="h1 mb-8">Options</h1>
    <div class="flex flex-wrap">
        <!-- <SlideToggle
            bind:checked={localOptions.includeExpansions}
            name="include-expansions"
            size="sm"
            active="bg-secondary-500"
            class="mb-2 mr-6"
        >
            Include expansions
        </SlideToggle> -->
        <span class="flex">
            <SlideToggle
                bind:checked={localOptions.useGeekRating}
                name="use-geek-rating"
                size="sm"
                active="bg-secondary-500"
                class="mr-2"
            >
                Use Geek rating
            </SlideToggle>
            <span use:popup={geekRatingTooltip} class="[&>*]:pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
                </svg>
            </span>
        </span>
    </div>
    <hr class="my-4" />
    <div class="flex items-end space-x-4">
        <label class="label w-1/2">
            <span>Sorting</span>
            <select bind:value={localOptions.selectedSort} class="select" name="sort" id="sort">
                <option value="alphabetical">Alphabetical</option>
                <option value="release">Release Date</option>
                <option value="rating">{ localOptions.useGeekRating ? 'Geek' : 'Avg' } Rating</option>
                <option value="weight">Weight</option>
            </select>
        </label>
        <div class="w-1/2">
            <RadioGroup active="variant-filled-secondary" hover="hover:variant-soft-secondary" class="h-[42px]">
                <RadioItem bind:group={localOptions.sort} name="sort" value="asc">
                    <ArrowUpSolid class="h-6 w-5" />
                </RadioItem>
                <RadioItem bind:group={localOptions.sort} name="sort" value="desc">
                    <ArrowDownSolid class="h-6 w-5" />
                </RadioItem>
            </RadioGroup>
        </div>
    </div>
    <hr class="my-4" />
    <div class="flex space-x-4">
        <label class="label w-1/2">
            <span class="align-middle">
                <FireSolid class="inline-block h-6 w-6 mr-2" />Min { localOptions.useGeekRating ? 'Geek' : 'Avg' } Rating
            </span>
            <select bind:value={localOptions.filters.rating} class="select" name="rating" id="rating">
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
        <label class="label w-1/2 mb-4">
            <span>
                <UserGroupSolid class="inline-block h-6 w-6 mr-2" />
                Player Count
            </span>
            <select bind:value={localOptions.filters.playerCount} class="select" name="playercount" id="playercount">
                <option value="any">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9+</option>
            </select>
        </label>
    </div>
    <div class="flex space-x-4">
        <label class="label w-1/2 mb-4">
            <span>
                <BestPlayerCount class="inline-block mr-2" />
                Best Player Count
            </span>
            <select bind:value={localOptions.filters.bestPlayerCount} class="select" name="bestplayercount" id="bestplayercount">
                <option value="any">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
                <option value="6">6</option>
                <option value="7">7</option>
                <option value="8">8</option>
                <option value="9">9+</option>
            </select>
        </label>
        <label class="input-label w-1/2">
            <span class="align-middle">
                <ClockSolid class="inline-block h-6 w-6 mr-2" />Max Play Time
            </span>
            <select bind:value={localOptions.filters.playtime} class="select" name="playtime" id="playtime">
                <option value="any">Any</option>
                <option value="15">15 mins</option>
                <option value="30">30 mins</option>
                <option value="60">60 mins</option>
                <option value="90">90 mins</option>
                <option value="120">120 mins</option>
                <option value="180">180 mins</option>
                <option value="240">240+ mins</option>
            </select>
        </label>
    </div>
    <div class="flex space-x-4">
        <label class="input-label w-1/2 mb-4">
            <span>
                <ScaleSolid class="inline-block h-6 w-6 mr-2" />
                Max Weight
            </span>
            <select bind:value={localOptions.filters.weight} class="select" name="weight" id="weight">
                <option value="any">Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5</option>
            </select>
        </label>
        <label class="input-label w-1/2 mb-4">
            <span>
                <PlayCircleSolid class="inline-block h-6 w-6 mr-2" />
                Played
            </span>
            <select bind:value={localOptions.filters.played} class="select" name="played" id="played">
                <option value="all">All</option>
                <option value="true">Yes</option>
                <option value="false">No</option>
            </select>
        </label>
    </div>
    <hr class="my-4" />
    <div class="flex justify-end">
        <button class="btn variant-ringed-surface mr-6" onclick={() => modalStore.close()}>Close</button>
        <button class="btn variant-filled-secondary" onclick={apply}>Apply</button>
    </div>
</div>

<div class="card p-2 variant-filled-primary max-w-[200px] shadow-lg" data-popup="geekRatingTooltip">
	<p class="text-center">Toggle between Geek rating or Average rating. (BGG uses a Bayesian average to determine a games geek rating)</p>
	<div class="arrow variant-filled-primary"></div>
</div>