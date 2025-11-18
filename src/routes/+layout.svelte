<script lang="ts">
    import '../purp-theme.postcss';
    import '@skeletonlabs/skeleton/styles/skeleton.css';
    import "../app.css";
    import posthog from 'posthog-js'
    import { computePosition, autoUpdate, offset, shift, flip, arrow } from '@floating-ui/dom';
    import { AppShell, Modal, Toast, storePopup, modalStore } from '@skeletonlabs/skeleton';
    import type { ModalSettings, ModalComponent } from '@skeletonlabs/skeleton';
    import { onMount, onDestroy } from 'svelte';
    import { fade } from 'svelte/transition';
    import { page } from "$app/stores";
    import { browser, dev  } from '$app/environment';
    import { goto } from '$app/navigation';
    import Analytics from '$lib/components/Analytics.svelte';
    import FeedbackModal from '$lib/components/FeedbackModal.svelte';
    import UpdatesModal from '$lib/components/UpdatesModal.svelte';
    import TempRegistrationModal from '$lib/components/TempRegistrationModal.svelte';
    import { Library, isScreenSmall } from "$lib/store";
    import kofi from '$lib/assets/kofi_s_logo_nolabel.webp';

    let wrapper: HTMLElement;
    let showScrollToTopBtn = false;

    storePopup.set({ computePosition, autoUpdate, offset, shift, flip, arrow });

    const handleScreenWidthChange = () => {
        $isScreenSmall = window.innerWidth <= 570;
    }

    onMount(() => {
        if (browser) {
            posthog.init(
                'phc_gQBmUSzlk8BpoEssnv5RnlpQqitinyRZKTGBu89tJZH',
                { api_host: "https://us.i.posthog.com" }
            );
            posthog.reset();

            wrapper = document.querySelector('#page');
            wrapper.addEventListener('scroll', handleScroll);
            handleScreenWidthChange();
        }
    })

    onDestroy(() => {
        if (browser) {
            wrapper.removeEventListener('scroll', handleScroll);
        }
    })

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

    // Temporary modal to inform users of BGG registration status
    // Remove once approved
    const openRegistrationModal = () => {
        const modalComponent: ModalComponent = {
            // Pass a reference to your custom component
            ref: TempRegistrationModal,
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
    openRegistrationModal();
</script>

<svelte:window on:resize={handleScreenWidthChange} />
<AppShell class="font-sans">
    <slot />
    {#if showScrollToTopBtn}
        <button
            transition:fade
            class="fixed bottom-6 right-6 btn-icon btn-icon-lg variant-filled-secondary shadow-md"
            style="padding: 10px;"
            on:click={() => wrapper.scrollTo(0, 0)}
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 19.5v-15m0 0l-6.75 6.75M12 4.5l6.75 6.75" />
            </svg>
        </button>
    {/if}
    <svelte:fragment slot="pageFooter">
        <div class="flex justify-center items-center">
            <!--<span class="mr-6">Made by X</span> | -->
            <button type="button" class="btn btn-sm !bg-transparent" on:click={openFeedback}>Submit feedback</button>
            <span>|</span>
            <button type="button" class="btn btn-sm !bg-transparent" on:click={openUpdates}>View updates</button>
            <span>|</span>
            <a href='https://ko-fi.com/G2G4TNFSY' target='_blank' class="btn btn-sm !bg-transparent">
                <img src={kofi} class="w-8 h-8" alt="Buy me a coffee at ko-fi.com" />
                Buy me a coffee
            </a>
        </div>
    </svelte:fragment>
</AppShell>
<Modal />

<!-- TEMP: Remove after BGG approval. Block click events -->
<div class="fixed inset-0 z-[10000]"></div>
<!--  -->

<Toast zIndex="z-[1000]" />
<!-- <Analytics /> -->

<style>
    :global(.modal) {
        overflow: visible;
    }
</style>