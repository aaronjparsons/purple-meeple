<script lang="ts">
    import { captureException } from '@sentry/sveltekit'
    import { page } from '$app/state';
    import { libraryStats } from '$lib/store';
    import { ProgressBar } from '@skeletonlabs/skeleton';

    const username = page.params.username;
    let gameLoadingProgress = 0;

    const getCollectionValues = async () => {
        if ($libraryStats.initialized && $libraryStats.listingStats) {
            return $libraryStats.listingStats;
        }

        const response = await fetch(`/api/collection/value?username=${username}`);
        if (response.ok) {
            let collectionAccumulator = '';
            let isLast = false;
            let reader = response.body.getReader();
            let result;
            let decoder = new TextDecoder();
            let finalResponse;
            while (!result?.done) {
                try {
                    result = await reader.read();
                    if (result.value) {
                        let chunk = decoder.decode(result.value);

                        if (chunk === 'error') {
                            captureException(new Error('collection value stream failed'));
                            return Promise.reject({ status: response.status, message: 'An error ocurred while loading listing data' })
                        }

                        if (chunk.substring(0, 4) === 'last') {
                            isLast = true;
                            chunk = chunk.split('last:')[1];
                        }

                        if (isLast) {
                            collectionAccumulator += chunk;
                        } else {
                            gameLoadingProgress = parseInt(chunk);
                        }
                    }
                } catch (e) {
                    // Error occurred while reading stream
                    captureException(e);
                    return Promise.reject({ status: response.status, message: 'An error ocurred while loading listing data' })
                }
            }
            finalResponse = JSON.parse(collectionAccumulator);
            libraryStats.set({
                ...$libraryStats,
                listingStats: finalResponse.listingStats,
                gamesWithoutListings: finalResponse.gamesWithoutListings
            });
            return finalResponse;
        }
    }

    const formatCurrency = (value: number, currency: string) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value);

    let values = getCollectionValues();
</script>

<div class="card rounded-md shadow-lg p-4 variant-ghost-tertiary col-span-2">
    <p class="text-xl sm:text-2xl text-center my-2">Collection Value</p>
    <hr class="my-2" />
    {#await values}
        <div class="flex flex-col justify-center items-center space-y-2">
            <p class="text-center text-sm mt-2">Fetching marketplace listings... {gameLoadingProgress}%</p>
            <div class="w-2/3">
                <ProgressBar value={gameLoadingProgress} max={100} meter="bg-surface-900-50-token transition-[width]" />
            </div>
            <p class="text-xs text-center opacity-60">This may take a while depending on your collection size.</p>
        </div>
    {:then collectionValue}
        <p class="text-xl sm:text-2xl text-center my-2">{formatCurrency($libraryStats.listingStats.median, 'USD')} USD</p>
        <p class="text-sm text-center opacity-60 mt-2">Estimated value based on the median of current BoardGameGeek marketplace listings.</p>
        {#if $libraryStats.gamesWithoutListings?.length}
            <hr class="my-2" />
            <p class="text-xs text-center opacity-60">The following {$libraryStats.gamesWithoutListings.length} {$libraryStats.gamesWithoutListings.length === 1 ? 'game has' : 'games have'} no listings and are not included in the total:</p>
            <p class="text-xs text-center opacity-60 mt-1">{$libraryStats.gamesWithoutListings.join(', ')}</p>
        {/if}
    {:catch error}
        <p class="text-xl sm:text-2xl text-center my-2">Error loading collection value</p>
    {/await}
</div>