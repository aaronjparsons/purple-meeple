<script lang="ts">
    import { page } from '$app/stores';
    import dayjs from 'dayjs';
    import logo from '$lib/assets/purple_meeple_150.png';
    import YearInReview from '$lib/components/YearInReview.svelte';

    const username = $page.params.username;
    let displayName = '';
    const year = dayjs().month() === 0 ? dayjs().year() - 1 : dayjs().year();

    const setDisplayName = () => {
        const lastLetter = username.charAt(username.length - 1);
        displayName = lastLetter.toLowerCase() === 's' ? `${username}'` : `${username}'s`;
    }

    const fetchPlays = async () => {
        const response = await fetch(`/api/year-in-review?username=${username}&year=${year}`);

        if (response.ok) {
            const res = await response.json();
            return res;
        } else {
            return Promise.reject(response)
        }
    }

    let playsRequest = fetchPlays();
    setDisplayName();
</script>

<svelte:head>
    <title>{ displayName } Year in Review ({year}) - Purple Meeple</title>
</svelte:head>
<div class="w-full flex justify-center my-4">
    <a href="/">
        <div class="flex justify-center">
            <img class="h-8 w-8 mt-5 sm:h-14 sm:w-14 sm:mt-4 mr-2 -rotate-12" alt="Purple Meeple logo" src={logo} />
            <h1 class="font-title text-center text-4xl sm:text-6xl font-bold my-4">Purple Meeple</h1>
        </div>
    </a>
</div>
{#await playsRequest}
    <div class="h-full flex flex-col justify-center items-center p-8">
        <lottie-player
            src="https://assets9.lottiefiles.com/packages/lf20_Wy80jjKz4n.json"
            background="transparent"
            speed="1"
            style="width: 300px; height: 300px;"
            loop
            autoplay
        ></lottie-player>
    </div>
{:then stats}
    <YearInReview {username} {stats} {year} />
{:catch error}
    <p class="text-lg sm:text-2xl text-center mt-20 px-6">
        {#if error.status === 404}
            Unable to retrieve play data for the user {username}, for the year {year}
        {:else}
            An error occurred while collecting your play stats. Please refresh to try again
        {/if}
    </p>
{/await}