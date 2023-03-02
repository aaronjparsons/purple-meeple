<script lang="ts">
    // import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
    import '../purp-theme.postcss';
    import '@skeletonlabs/skeleton/styles/all.css';
    import "../app.css";
    import { Modal } from '@skeletonlabs/skeleton';
    import { Toast } from '@skeletonlabs/skeleton';
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    import { page } from "$app/stores";
    import { browser } from '$app/environment';
    import { goto } from '$app/navigation';
    import Analytics from '$lib/components/Analytics.svelte';
    import { Library, isScreenSmall } from "$lib/store";

    let wrapper: HTMLElement;
    let showScrollToTopBtn = false;

    $: logoAtTop = $page.url.pathname !== '/' && $Library.loaded;

    onMount(() => {
        if (browser) {
            wrapper.addEventListener('scroll', handleScroll);
        }
    })

    onDestroy(() => {
        if (browser) {
            wrapper.removeEventListener('scroll', handleScroll);
        }
    })

    const handleScreenWidthChange = () => {
        $isScreenSmall = window.innerWidth <= 525;
    }

    const handleScroll = () => {
        if (wrapper.scrollTop > 500) {
            showScrollToTopBtn = true;
        } else {
            showScrollToTopBtn = false;
        }
    }

    const handleLogoClick = () => {
        if (logoAtTop) {
            goto('/');
        }
    }
</script>

<svelte:window on:resize={handleScreenWidthChange} />
<div class="h-full relative">
    <h1
        class="absolute {logoAtTop ? 'top-0 p-8' : 'top-1/3'} w-full text-center text-4xl sm:text-7xl font-bold transition-all"
        on:click={handleLogoClick}
    >
        BGG-Library
    </h1>
    <div bind:this={wrapper} class="h-full overflow-auto">
        <slot />
    </div>
    {#if showScrollToTopBtn}
        <button
            transition:fade
            class="fixed bottom-6 right-6 btn-icon btn-icon-lg btn-filled-secondary shadow-md"
            style="padding: 10px;"
            on:click={() => wrapper.scrollTo(0, 0)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
            </svg>
        </button>
    {/if}
</div>
<Modal />
<Toast />
<!-- <Analytics /> -->