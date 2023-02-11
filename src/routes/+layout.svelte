<script>
    // import '@skeletonlabs/skeleton/themes/theme-skeleton.css';
    import '../purp-theme.postcss';
    import '@skeletonlabs/skeleton/styles/all.css';
    import "../app.css";
    import { Modal } from '@skeletonlabs/skeleton';
    import { onMount, onDestroy } from 'svelte';
    import { page } from "$app/stores";
    import { browser } from '$app/environment';
    import { Library, isScreenSmall } from "$lib/store";

    $: logoAtTop = $page.url.pathname !== '/' && $Library.loaded;

    onMount(() => {
        if (browser) {
            window.addEventListener('resize', handleScreenWidthChange);
        }
    })

    onDestroy(() => {
        if (browser) {
            window.removeEventListener('resize', handleScreenWidthChange);
        }
    })

    const handleScreenWidthChange = () => {
        $isScreenSmall = window.innerWidth <= 525;
    }
</script>

<div class="h-full relative">
    <h1 class="absolute {logoAtTop ? 'top-0 p-8' : 'top-1/3'} w-full text-center text-4xl sm:text-7xl font-bold transition-all">
        BGG-Library
    </h1>
    <div class="h-full overflow-auto">
        <slot />
    </div>
</div>
<Modal />