<script lang="ts">
    import QRCode from 'qrcode';
    import { onMount } from 'svelte';
    import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
    import { libraryOptions } from "$lib/store";

    let qrCode = '';
    let baseUrl = `${window.location.origin}${window.location.pathname}`;
    let optionsUrl = window.location.href;
    let selectedUrl = baseUrl;
    let includeOptions = false;
    const sortingMap = {
        alphabetical: 'Alphabetical',
        release: 'Release Date',
        geekRating: 'BGG Rating',
        weight: 'Weight'
    }

    onMount(() => {
        generateQR(selectedUrl);
    })

    const generateQR = async (text: string) => {
        try {
            qrCode = await QRCode.toDataURL(text);
        } catch (err) {
            console.error(err)
        }
    }

    const toggleUrl = () => {
        selectedUrl = includeOptions ? optionsUrl : baseUrl;
        generateQR(selectedUrl);
    }
</script>

<div>
    <h1 class="mb-6">QR Code</h1>
    <div class="flex justify-center mb-4">
        <img src={qrCode} alt="BGG Library QR code" />
    </div>
    <p class="mb-2 text-center">Save this QR code for quick access to browse your board game library</p>
    <hr class="mb-4" />
    <div class="flex flex-col items-center">
        <p>Current Options:</p>
        <div class="grid grid-cols-2 gap-x-12 capitalize text-sm mt-2 mb-6">
            <span>Sorting: <span class="font-light">{sortingMap[$libraryOptions.selectedSort]}</span></span>
            <span>Rating Type: <span class="font-light">{ $libraryOptions.useGeekRating ? 'Geek' : 'Avg' }</span></span>
            <span>Min { $libraryOptions.useGeekRating ? 'Geek' : 'Avg' } Rating: <span class="font-light">{$libraryOptions.filters.rating}</span></span>
            <span>Max Playtime: <span class="font-light">{$libraryOptions.filters.playtime}</span></span>
            <span>Player count: <span class="font-light">{$libraryOptions.filters.playerCount}</span></span>
            <span>Max Weight: <span class="font-light">{$libraryOptions.filters.weight}</span></span>
        </div>
        <SlideToggle
            name="slider-example"
            bind:checked={includeOptions}
            on:change={toggleUrl}
        >
            Apply current options to QR
        </SlideToggle>
    </div>
    <hr class="my-4" />
    <div class="flex justify-end">
        <button class="btn btn-ringed-surface" on:click={() => modalStore.close()}>Close</button>
    </div>
</div>