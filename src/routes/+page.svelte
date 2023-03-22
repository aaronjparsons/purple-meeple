<script lang="ts">
    import { goto } from '$app/navigation';
    import logo from '$lib/assets/purple_meeple_150.png';

    let username = '';
    let loading = false;
    let error: null|number = null;

    const handleSubmit = async () => {
        loading = true;
        // First validate the username exists
        const response = await fetch(`/api/user?username=${username}`);

        if (response.ok) {
            goto(`/${username.toLowerCase()}`);
        } else {
            error = response.status;
        }
        loading = false;
    }
</script>

<div class="h-full flex flex-col justify-center items-center p-8">
    <div class="flex">
        <img class="h-10 w-10 sm:h-20 sm:w-20 mt-2 mr-2 -rotate-12" alt="Purple Meeple logo" src={logo} />
        <h1 class="w-full font-title text-center text-5xl sm:text-8xl font-bold mb-8">
            Purple Meeple
        </h1>
    </div>
    <div class="w-full md:w-[750px]">
        <p class="text-center mb-6">
            Enter your BoardGameGeek username to view your board game library. Create a QR code with preset options, filters & sorting for quick access in the future.
        </p>
        <form class="flex flex-col items-center space-y-2" on:submit|preventDefault={handleSubmit}>
            <input
                bind:value={username}
                type="text"
                name="name"
                placeholder="BoardGameGeek username"
            >
            <button
                class="btn btn-filled-primary btn-base"
                disabled={loading}
                type="submit"
            >
                { loading ? 'Loading...' : 'Submit' }
            </button>
        </form>
    </div>
    {#if error}
        <aside class="alert mt-6">
            <div class="alert-message">
                <p>
                    {#if error === 404}
                        Unable to find a user with that username
                    {:else if error === 429}
                        BGG has received a lot of requests and is busy. Please try again in a couple minutes
                    {:else}
                        There was an unknown error. Please try again later
                    {/if}
                </p>
            </div>
        </aside>
    {/if}
</div>
