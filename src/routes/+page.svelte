<script lang="ts">
    import dayjs from 'dayjs';
    import { goto } from '$app/navigation';
    import logo from '$lib/assets/purple_meeple_150.png';
    import { Library } from "$lib/store";

    let username = $state('');
    let loading = $state(false);
    let error: null|number = $state(null);

    const month = dayjs().month();
    const year = month === 0 ? dayjs().year() - 1 : dayjs().year();

    const handleSubmit = async (event) => {
        console.log(event)
        event.preventDefault();
        loading = true;
        // First validate the username exists
        const response = await fetch(`/api/user?username=${username}`);

        if (response.ok) {
            $Library = {
                ...$Library,
                username,
            }
            goto(`/${username}`);
        } else {
            error = response.status;
        }
        loading = false;
    }
</script>

<svelte:head>
    <title>Purple Meeple</title>
</svelte:head>
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
        <form class="flex flex-col items-center space-y-2" onsubmit={handleSubmit}>
            <input
                bind:value={username}
                class="input"
                type="text"
                name="name"
                required
                pattern="^\S*$"
                title="This field is required & may not contain any spaces"
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
        {#if month === 11 || month === 0}
            <div class="mt-24 text-center">
                <p class=" text-sm sm:text-base">Tracking your plays on BGG? View your yearly stats!</p>
                <a class="font-title font-semibold text-4xl sm:text-5xl cursor-pointer" href="/year-in-review">
                    <p class="bg-gradient-to-br from-blue-500 to-cyan-300 bg-clip-text text-transparent box-decoration-clone">Year in Review</p>
                    <p class="-mt-4 bg-gradient-to-br from-red-500 to-yellow-500 bg-clip-text text-transparent box-decoration-clone">{year}</p>
                </a>
            </div>
        {/if}
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
