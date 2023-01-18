<script lang="ts">
    import { goto } from '$app/navigation';

    let username = '';

    const handleSubmit = () => {
        goto(`/${username}`);
    }
</script>

<div class="h-full flex flex-col justify-center items-center p-8">
    <div class="w-full md:w-[750px]">
        <p class="text-center mb-6">
            Enter your BGG username to view your board game library. Create a QR code with preset options, filters & sorting for quick access in the future.
        </p>
        <div class="flex flex-col items-center space-y-2">
            <input
                bind:value={username}
                type="text"
                name="name"
                class="rounded-md border-gray-300 px-4 focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="BGG Username"
            >
            <button
                class="rounded-md bg-indigo-500 px-4 py-1 text-white"
                on:click={handleSubmit}
            >
                Submit
            </button>
        </div>
    </div>
</div>
