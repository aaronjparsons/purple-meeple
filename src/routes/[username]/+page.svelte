<script lang="ts">
    import { UserGroupIcon } from "@rgossiaux/svelte-heroicons/solid";
    import { fade } from 'svelte/transition';
    import { page } from '$app/stores';
    import { getValue, sleep } from "$lib/utils";
    import { Library } from "$lib/store";

    const username = $page.params.username;
    let displayType = 'grid';
    let includeExpansions = false;

    const fetchCollection = async () => {
        if ($Library.loaded && $Library.username === username) {
            return $Library.data;
        }

        const response = await fetch(`/api?username=${username}&expansions=${includeExpansions}`);

        if (response.ok) {
            const res = await response.json();
            $Library = {
                data: res,
                username,
                loaded: true
            };
            await sleep(150);
            return res;
        }
    }
    let collection = fetchCollection();

    const toggleDisplay = () => {
        displayType = displayType === 'grid' ? 'list' : 'grid';
    }

    const handleIncludeExpansions = () => {
        console.log('hello', includeExpansions)

    }

    const getName = (game) => {
        const name = Array.isArray(game.name)
            ? getValue(game.name[0])
            : getValue(game.name);

        return name.replace(/&#039;/g,"'");
    }

    const parsePlayerCount = (game) => {
        // If min and max are the same, only display one value
        const min = getValue(game['minplayers']);
        const max = getValue(game['maxplayers']);

        return min === max ? min : `${min}-${max}`;
    }
</script>

{#await collection}
    <div class="flex justify-center items-center">
        loading...
    </div>
{:then col}
    <div transition:fade class="flex flex-col items-center pt-28 px-8">
        {username}
        <div class="flex items-center">
            <input bind:checked={includeExpansions} type="checkbox" name="includeExpansions" id="includeExpansions" on:change={handleIncludeExpansions} />
            <label for="includeExpansions">Include expansions</label>
            <!-- Display toggle buttons -->
            <div class="flex ml-6">
                <button class="px-2 py-1 rounded-tl rounded-bl border border-gray-600" on:click={toggleDisplay}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                    </svg>
                </button>
                <button class="px-2 py-1 rounded-tr rounded-br border-t border-r border-b border-gray-600" on:click={toggleDisplay}>
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </button>
            </div>
        </div>
        {#if displayType === 'grid'}
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-screen-xl">
                {#each col as game}
                    <div
                        class="relative rounded-md shadow-lg p-4 h-96 w-80 m-0 m-auto bg-cover bg-center"
                        style="background-image: url('{game.image}');"
                    >
                        <div class="absolute top-0 left-0 right-0 py-2 px-4 rounded-t-md bg-gradient-to-r via-dark-shade from-dark-shade opacity-90">
                            <p class="text-gray-100 font-semibold text-lg">
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
            {#each col as game}
                <div class="w-full sm:max-w-[950px] flex rounded-md shadow-md mb-4">
                    <img class="rounded-tl-md rounded-bl-md h-24 w-24 object-cover" src={game.image} alt="game cover" />
                    {getName(game)}
                </div>
            {/each}
        {/if}
    </div>
{:catch error}

{/await}