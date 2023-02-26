<script lang="ts">
    import { goto } from '$app/navigation';

    let username = '';

    const handleSubmit = () => {
        goto(`/${username.toLowerCase()}`);
    }
</script>

<div class="h-full flex flex-col justify-center items-center p-8">
    <div class="w-full md:w-[750px]">
        <p class="text-center mb-6">
            Enter your BGG username to view your board game library. Create a QR code with preset options, filters & sorting for quick access in the future.
        </p>
        <form class="flex flex-col items-center space-y-2" on:submit|preventDefault={handleSubmit}>
            <input
                bind:value={username}
                type="text"
                name="name"
                placeholder="BGG Username"
            >
            <button
                class="btn btn-filled-primary btn-base"
                type="submit"
            >
                Submit
            </button>
        </form>
    </div>
</div>
