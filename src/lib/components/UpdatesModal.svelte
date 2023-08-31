<script lang="ts">
    import type { ToastSettings } from '@skeletonlabs/skeleton';
    import { modalStore, toastStore } from '@skeletonlabs/skeleton';
</script>

<div class="card w-modal p-4 shadow-lg">
    <h1 class="h1 mb-6">Updates</h1>
    <div>
        <h4 class="h4">Aug 30, 2023</h4>
        <p>
            We now store your collections for faster load times. If there is a change detected to your
            collection, or if BGG is busy processing the request, we'll load the last saved version of your collection
            while the update processes in the background.
        </p>
    </div>
    <div class="flex justify-end mt-4">
        <button class="btn variant-ringed-surface mr-6" on:click|preventDefault={() => modalStore.close()}>
            Close
        </button>
    </div>
</div>