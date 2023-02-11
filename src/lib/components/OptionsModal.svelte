<script lang="ts">
    import { UserGroupIcon, ClockIcon, FireIcon, ScaleIcon } from "@rgossiaux/svelte-heroicons/solid";
    import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
    import { libraryOptions } from "$lib/store";

    const apply = () => {
        if ($modalStore[0].response) {
            $modalStore[0].response(true);
        }
		modalStore.close();
    }
</script>

<div>
    <h1 class="mb-8">Options</h1>
    <SlideToggle bind:checked={$libraryOptions.includeExpansions} size="sm">
        Include expansions
    </SlideToggle>
    <hr class="my-4" />
    <label class="input-label w-1/2">
        <span>Sorting</span>
        <select bind:value={$libraryOptions.selectedSort} name="sort" id="sort">
            <option value="alphabetical">Alphabetical</option>
            <option value="release">Release Date</option>
            <option value="geekRating">BGG Rating</option>
            <option value="weight">Weight</option>
        </select>
    </label>
    <hr class="my-4" />
    <div class="flex space-x-4">
        <label class="input-label w-1/2">
            <span class="align-middle">
                <FireIcon class="inline-block h-6 w-6 mr-2" />Min BGG Rating
            </span>
            <select bind:value={$libraryOptions.filters.geekRating} name="geekRating" id="geekRating">
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
            <select bind:value={$libraryOptions.filters.playerCount} name="playercount" id="playercount">
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
            <select bind:value={$libraryOptions.filters.playtime} name="playtime" id="playtime">
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
            <select bind:value={$libraryOptions.filters.weight} name="weight" id="weight">
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