<script lang="ts">
    import QRCodeStyling, {
        type DrawType,
        type TypeNumber,
        type Mode,
        type ErrorCorrectionLevel,
        type DotType,
        type CornerSquareType,
        type CornerDotType,
    } from 'qr-code-styling';
    import { onMount } from 'svelte';
    import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
    import logo from '$lib/assets/purple_meeple_150.png';
    import { Library, libraryOptions } from "$lib/store";

    let qrEl: HTMLElement;

    let qrCode: QRCodeStyling;
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
    const qrOptions = {
        width: 300,
        height: 300,
        type: 'svg' as DrawType,
        data: '',
        image: logo,
        margin: 10,
        qrOptions: {
            typeNumber: 0 as TypeNumber,
            mode: 'Byte' as Mode,
            errorCorrectionLevel: 'Q' as ErrorCorrectionLevel
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.2,
            margin: 5,
            crossOrigin: 'anonymous',
        },
        dotsOptions: {
            type: 'rounded' as DotType
        },
        backgroundOptions: {
            color: '#ffffff',
        },
        cornersSquareOptions: {
            color: '#663399',
            type: 'extra-rounded' as CornerSquareType,
        },
        cornersDotOptions: {
            color: '#663399',
            type: 'dot' as CornerDotType,
        }
    }

    onMount(() => {
        genQr(selectedUrl);
    })

    const genQr = (text: string) => {
        const options = {
            ...qrOptions,
            data: text
        };
        qrCode = new QRCodeStyling(options);
        qrCode.append(qrEl);
    }

    const toggleUrl = () => {
        selectedUrl = includeOptions ? optionsUrl : baseUrl;
        const options = {
            ...qrOptions,
            data: selectedUrl
        };
        qrCode.update(options);
    }

    const downloadQr = () => {
        qrCode.download({
            name: `${$Library.username}-collection-qr`,
            extension: 'png'
        });
    }
</script>

<div>
    <h1 class="mb-6">QR Code</h1>
    <div class="flex justify-center mb-4">
        <div id="qr-code" bind:this={qrEl}> </div>
    </div>
    <div class="flex flex-col items-center">
        <p class="text-center">Download this QR code for quick access to browse your board game library</p>
        <button class="btn btn-filled-secondary my-2" on:click={downloadQr}>Download</button>
    </div>
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