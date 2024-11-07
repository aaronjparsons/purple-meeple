<script lang="ts">
    import '../purp-theme.postcss';
    // import '@skeletonlabs/skeleton/styles/skeleton.css';
    import "../app.css";
    import posthog from 'posthog-js'
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { initializeStores, AppShell, Modal, Toast, storePopup } from '@skeletonlabs/skeleton';
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    import { page } from "$app/stores";
    import { browser, dev  } from '$app/environment';
    import { goto } from '$app/navigation';
    import Analytics from '$lib/components/Analytics.svelte';
    import FeedbackModal from '$lib/components/FeedbackModal.svelte';
    import UpdatesModal from '$lib/components/UpdatesModal.svelte';
    import { Library, isScreenSmall } from "$lib/store";
    import kofi from '$lib/assets/kofi_s_logo_nolabel.webp';
    interface Props {
        children?: import('svelte').Snippet;
    }

    let { children }: Props = $props();

    let wrapper: HTMLElement = $state();
    let showScrollToTopBtn = $state(false);

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });
    initializeStores();

    onMount(() => {
        if (browser) {
            posthog.init(
                'phc_gQBmUSzlk8BpoEssnv5RnlpQqitinyRZKTGBu89tJZH',
                { api_host: "https://us.i.posthog.com" }
            );
            posthog.reset();

            wrapper = document.querySelector('#page');
            wrapper.addEventListener('scroll', handleScroll);
        }
    })

    onDestroy(() => {
        if (browser) {
            wrapper.removeEventListener('scroll', handleScroll);
        }
    })

    const handleScreenWidthChange = () => {
        $isScreenSmall = window.innerWidth <= 570;
    }

    const handleScroll = () => {
        if (wrapper.scrollTop > 500) {
            showScrollToTopBtn = true;
        } else {
            showScrollToTopBtn = false;
        }
    }

    const openFeedback = () => {
        const modalComponent: ModalComponent = {
            // Pass a reference to your custom component
            ref: FeedbackModal,
            // Add your props as key/value pairs
            props: {  },
        };
        const d: ModalSettings = {
            type: 'component',
            component: modalComponent,
            // response: applyOptions
        };
        modalStore.trigger(d);
    }

    const openUpdates = () => {
        const modalComponent: ModalComponent = {
            // Pass a reference to your custom component
            ref: UpdatesModal,
            // Add your props as key/value pairs
            props: {  },
        };
        const d: ModalSettings = {
            type: 'component',
            component: modalComponent,
            // response: applyOptions
        };
        modalStore.trigger(d);
    }
</script>

<svelte:window onresize={handleScreenWidthChange} />
<AppShell class="font-sans">
    {@render children?.()}
    {#if showScrollToTopBtn}
        <button
            transition:fade
            class="fixed bottom-6 right-6 btn-icon btn-icon-lg variant-filled-secondary shadow-md"
            style="padding: 10px;"
            onclick={() => wrapper.scrollTo(0, 0)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
            </svg>
        </button>
    {/if}
    {#snippet pageFooter()}
    
            <div class="flex justify-center items-center">
                <!--<span class="mr-6">Made by X</span> | -->
                <button type="button" class="btn btn-sm !bg-transparent" onclick={openFeedback}>Submit feedback</button>
                <span>|</span>
                <button type="button" class="btn btn-sm !bg-transparent" onclick={openUpdates}>View updates</button>
                <span>|</span>
                <a href='https://ko-fi.com/G2G4TNFSY' target='_blank' class="btn btn-sm !bg-transparent">
                    <img src={kofi} class="w-8 h-8" alt="Buy me a coffee at ko-fi.com" />
                    Buy me a coffee
                </a>
            </div>
        
    {/snippet}
</AppShell>
<Modal />
<Toast zIndex="z-[1000]" />
<!-- <Analytics /> -->

<style>
    :global(.modal) {
        overflow: visible;
    }
</style>