<script lang="ts">
    import { onMount } from 'svelte';
    import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
    import logo from '$lib/assets/purple_meeple_150.png';
    import { Library, libraryOptions } from "$lib/store";

    let QRCodeStyling;
    let qrEl: HTMLElement;
    let qrCode;
    let baseUrl = `${window.location.origin}${window.location.pathname}`;
    let optionsUrl = window.location.href;
    let includeOptions = false;
    const sortingMap = {
        alphabetical: 'Alphabetical',
        release: 'Release Date',
        geekRating: 'BGG Rating',
        weight: 'Weight'
    }
    const qrOptions = {
        width: 275,
        height: 275,
        type: 'svg',
        data: '',
        image: logo,
        margin: 10,
        qrOptions: {
            typeNumber: 0,
            mode: 'Byte',
            errorCorrectionLevel: 'Q'
        },
        imageOptions: {
            hideBackgroundDots: true,
            imageSize: 0.2,
            margin: 5,
            crossOrigin: 'anonymous',
        },
        dotsOptions: {
            type: 'rounded'
        },
        backgroundOptions: {
            color: '#ffffff',
        },
        cornersSquareOptions: {
            color: '#663399',
            type: 'extra-rounded',
        },
        cornersDotOptions: {
            color: '#663399',
            type: 'dot',
        }
    }

    onMount(async () => {
        const qrModule = await import('qr-code-styling');
        QRCodeStyling = qrModule.default;
        genQr();
    })

    const createUrl = () => {
        return includeOptions
            ? `${optionsUrl}&qrRef`
            : `${baseUrl}?qrRef`
    }

    const genQr = () => {
        const url = createUrl();
        const options = {
            ...qrOptions,
            data: url
        };
        qrCode = new QRCodeStyling(options);
        qrCode.append(qrEl);
    }

    const toggleUrl = () => {
        const url = createUrl();
        const options = {
            ...qrOptions,
            data: url
        };
        qrCode.update(options);
    }

    const downloadQr = () => {
        if (gtag) {
            gtag('event', 'qr_download', {
                'username': $Library.username
            });
        }

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
    <p class="text-center mb-2">Download this QR code for quick access to browse your board game library</p>
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
        <button class="btn btn-ringed-surface mr-6" on:click={() => modalStore.close()}>Close</button>
        <button class="btn btn-filled-secondary" on:click={downloadQr}>Download</button>
    </div>
</div>