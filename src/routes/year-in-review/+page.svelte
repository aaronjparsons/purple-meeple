<script lang="ts">
    import dayjs from 'dayjs';
    import { goto } from '$app/navigation';
    import logo from '$lib/assets/purple_meeple_150.png';

    let username = '';
    let error: null|number = null;
    let loading = false;
    const month = dayjs().month();
    const year = month === 0 ? dayjs().year() - 1 : dayjs().year();

    const handleSubmit = async () => {
        loading = true;
        // First validate the username exists
        const response = await fetch(`/api/user?username=${username}`);

        if (response.ok) {
            goto(`/year-in-review/${username}`);
        } else {
            error = response.status;
        }
        loading = false;
    }
</script>

<svelte:head>
    <title>Year in Review ({year}) - Purple Meeple</title>
</svelte:head>
<div class="h-full flex flex-col justify-center items-center p-8">
    <div class="flex justify-center">
        <img class="h-8 w-8 mt-5 sm:h-14 sm:w-14 sm:mt-4 mr-2 -rotate-12" alt="Purple Meeple logo" src={logo} />
        <h1 class="font-title text-center text-4xl sm:text-6xl font-bold my-4">Purple Meeple</h1>
    </div>
    <div class="font-title font-semibold text-5xl sm:text-7xl my-4 text-center">
        <p class="bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">Year in Review</p>
        <p class="-mt-4 bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent box-decoration-clone">{year}</p>
    </div>
    <div class="w-full md:w-[750px]">
        <p class="text-center mb-6">
            Enter your BoardGameGeek username to view stats of your logged plays over the past year!
        </p>
        <form class="flex flex-col items-center space-y-2" on:submit|preventDefault={handleSubmit}>
            <input
                bind:value={username}
                class="input"
                type="text"
                name="name"
                required
                placeholder="BoardGameGeek username"
            >
            <button
                class="btn variant-filled-primary"
                disabled={loading}
                type="submit"
            >
                { loading ? 'Loading...' : 'Submit' }
            </button>
        </form>
    </div>
    {#if error}
        <aside class="alert variant-ghost-primary mt-6">
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