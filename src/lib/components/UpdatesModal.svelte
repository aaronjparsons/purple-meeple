<script lang="ts">
    import type { ToastSettings } from '@skeletonlabs/skeleton';
    import { modalStore, toastStore } from '@skeletonlabs/skeleton';

    // TODO: create a json file for update data
</script>

<div class="card w-modal p-4 shadow-lg">
    <h1 class="h1 mb-6">Updates</h1>
    <div class="max-h-[450px] overflow-y-auto">
        <div class="flex flex-col gap-y-4">
            <div>
                <h4 class="h4">December 8, 2025</h4>
                <p>
                    Fixed an issue that caused an error when loading the Year in Review for some users.'
                </p>
            </div>
            <div>
                <h4 class="h4">March 30, 2025</h4>
                <p>
                    Fixed an issue when loading collections due to duplicate database entries.
                </p>
            </div>
            <div>
                <h4 class="h4">Oct 27, 2024</h4>
                <p>
                    Collections no longer load expansions, to help performance and load times for those with large collections.
                </p>
            </div>
            <div>
                <h4 class="h4">Oct 26, 2024</h4>
                <p>
                    Changes to how game data is loaded, should be faster now.
                </p>
            </div>
            <div>
                <h4 class="h4">Aug 30, 2024</h4>
                <p>
                    Will now display the name & image of the specific version of a game you own. Apologies for the slow loading
                    of games, the BGG API has been very slow lately.
                </p>
            </div>
            <div>
                <h4 class="h4">Jul 23, 2024</h4>
                <p>
                    Sorry for the issues lately. There has been an ongoing problem with the BoardGameGeek API that other developers have also been reporting, where retrieving
                    game data is sometimes corrupt/incomplete. BoardGameGeek have also stated that they are limiting the API to 20 items, so loading game data will take a bit
                    longer now (we used to load 250 at a time). Hoping that only loading 20 games at a time will help with the issue.
                </p>
            </div>
            <div>
                <h4 class="h4">Jan 23, 2024</h4>
                <p>
                    Player Count & Best Player Count filter options bumped up from 6 to 9 (thanks for the suggestion!)
                </p>
            </div>
            <div>
                <h4 class="h4">Dec 31, 2023</h4>
                <p>
                    Added link to BGG page for games & expansions
                </p>
            </div>
            <div>
                <h4 class="h4">Dec 21, 2023</h4>
                <p>
                    Added the Year in Review feature. If you track your plays with BGG, you can view your stats for
                    the year. Available during December & January
                </p>
            </div>
            <div>
                <h4 class="h4">Aug 30, 2023</h4>
                <p>
                    We now store your collections for faster load times. If there is a change detected to your
                    collection, or if BGG is busy processing the request, we'll load the last saved version of your collection
                    while the update processes in the background.
                </p>
            </div>
        </div>
    </div>
    <div class="flex justify-end mt-4">
        <button class="btn variant-ringed-surface mr-6" on:click|preventDefault={() => modalStore.close()}>
            Close
        </button>
    </div>
</div>