<script lang="ts">
    import type { ToastSettings } from '@skeletonlabs/skeleton';
    import { modalStore, toastStore } from '@skeletonlabs/skeleton';
    import updates from '$lib/updates.json';
</script>

<div class="card w-modal p-4 shadow-lg">
    <h1 class="h1 mb-6">Updates</h1>
    <div class="max-h-[450px] overflow-y-auto">
        <div class="flex flex-col gap-y-4">
            {#each updates as update}
                <div>
                    <h4 class="h4">{update.date}</h4>
                    <p>{update.description}</p>
                </div>
            {/each}
        </div>
    </div>
    <div class="flex justify-end mt-4">
        <button class="btn variant-ringed-surface mr-6" on:click|preventDefault={() => modalStore.close()}>
            Close
        </button>
    </div>
</div>