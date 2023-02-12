<script lang="ts">
    import QRCode from 'qrcode';
    import { onMount } from 'svelte';
    import { SlideToggle, modalStore } from '@skeletonlabs/skeleton';
    import { libraryOptions } from "$lib/store";

    let qrCode = '';

    onMount(() => {
        generateQR(window.location.href);
    })

    const generateQR = async (text: string) => {
        try {
            qrCode = await QRCode.toDataURL(text);
        } catch (err) {
            console.error(err)
        }
    }
</script>

<div>
    <h1 class="mb-8">QR</h1>
    <div class="flex justify-center mb-4">
        <img src={qrCode} alt="BGG Library QR code" />
    </div>
    <div class="flex justify-end">
        <button class="btn btn-ringed-surface" on:click={() => modalStore.close()}>Close</button>
    </div>
</div>