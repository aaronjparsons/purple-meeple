<script lang="ts">
    import { page } from '$app/state';
    import { tick } from 'svelte';
    import dayjs from 'dayjs';
    import logo from '$lib/assets/purple_meeple_150.png';
    import YearInReview from '$lib/components/YearInReview.svelte';

    const username = page.params.username;
    let displayName = '';
    const year = dayjs().month() === 0 ? dayjs().year() - 1 : dayjs().year();
    let downloadingImage = false;

    // Fixed width for the export render, wide enough to trigger the component's
    // `sm:` (640px) breakpoint so the downloaded image is always the "desktop"
    // layout, regardless of the actual device/viewport that triggered it.
    const EXPORT_WIDTH = 900;

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

    const downloadImage = async (stats: any) => {
        if (downloadingImage) return;
        downloadingImage = true;

        // Render into a hidden, fixed-width same-origin iframe rather than the
        // live page, so the `sm:` breakpoint (and thus the whole layout) is
        // consistent no matter what device/viewport triggered the download.
        const iframe = document.createElement('iframe');
        iframe.style.position = 'fixed';
        iframe.style.top = '-100000px';
        iframe.style.left = '-100000px';
        iframe.style.width = `${EXPORT_WIDTH}px`;
        iframe.style.height = '3000px';
        iframe.setAttribute('aria-hidden', 'true');

        let component: YearInReview | null = null;
        let restoreGetComputedStyle: (() => void) | null = null;

        try {
            document.body.appendChild(iframe);

            const iframeDoc = iframe.contentDocument;
            const iframeWindow = iframe.contentWindow;
            if (!iframeDoc || !iframeWindow) throw new Error('Unable to access capture iframe');

            // Carry over the classes/attributes our theme CSS selectors key off of.
            iframeDoc.documentElement.className = document.documentElement.className;
            Array.from(document.body.attributes).forEach((attr) => {
                iframeDoc.body.setAttribute(attr.name, attr.value);
            });

            // Copy the app's stylesheets so Tailwind/Skeleton classes resolve inside the iframe.
            iframeDoc.head.innerHTML = document.head.innerHTML;
            await Promise.all(
                Array.from(iframeDoc.head.querySelectorAll('link[rel="stylesheet"]')).map(
                    (link) =>
                        new Promise<void>((resolve) => {
                            link.addEventListener('load', () => resolve());
                            link.addEventListener('error', () => resolve());
                        })
                )
            );

            const wrapper = iframeDoc.createElement('div');
            iframeDoc.body.appendChild(wrapper);

            component = new YearInReview({
                target: wrapper,
                props: { username, stats, year }
            });

            await tick();
            if (iframeDoc.fonts?.ready) await iframeDoc.fonts.ready;

            // Match the app's themed background.
            const bodyStyles = iframeWindow.getComputedStyle(iframeDoc.body);
            wrapper.style.backgroundColor = bodyStyles.backgroundColor;
            wrapper.style.backgroundImage = bodyStyles.backgroundImage;
            wrapper.style.backgroundPosition = bodyStyles.backgroundPosition;
            wrapper.style.backgroundSize = bodyStyles.backgroundSize;
            wrapper.style.backgroundRepeat = bodyStyles.backgroundRepeat;

            // BGG's image CDN blocks cross-origin, so route game cover
            // images through our own same-origin proxy just for this capture.
            const imageLoadPromises: Promise<void>[] = [];
            wrapper.querySelectorAll('img').forEach((img) => {
                const originalSrc = img.src;
                try {
                    const hostname = new URL(originalSrc).hostname;
                    if (hostname.endsWith('geekdo-images.com')) {
                        img.src = `/api/image-proxy?url=${encodeURIComponent(originalSrc)}`;
                    }
                } catch {
                    // not a valid absolute URL - leave src as-is
                }

                // Reassigning `src` above restarts loading, and images that were
                // already mid-flight may not be finished either - wait for both
                // cases so the capture doesn't race the proxied images loading.
                if (!img.complete) {
                    imageLoadPromises.push(
                        new Promise<void>((resolve) => {
                            img.addEventListener('load', () => resolve(), { once: true });
                            img.addEventListener('error', () => resolve(), { once: true });
                        })
                    );
                }
            });
            await Promise.all(imageLoadPromises);

            // html-to-image reads styles via the bare `window` global in a few spots
            // instead of the node's own ownerDocument view, which breaks for elements
            // living in a different document (our iframe). Patch around it for the
            // duration of the capture.
            const originalGetComputedStyle = window.getComputedStyle;
            window.getComputedStyle = ((elt: Element, pseudo?: string | null) => {
                const view = elt.ownerDocument?.defaultView;
                // Delegate to the element's own window only when it's a *different*
                // window (e.g. our iframe) - otherwise call the native function
                // directly, since `window.getComputedStyle` is this very patch.
                if (view && view !== window) {
                    return view.getComputedStyle(elt, pseudo);
                }
                return originalGetComputedStyle.call(window, elt, pseudo);
            }) as typeof window.getComputedStyle;
            restoreGetComputedStyle = () => {
                window.getComputedStyle = originalGetComputedStyle;
            };

            const { toPng } = await import('html-to-image');
            const dataUrl = await toPng(wrapper, {
                pixelRatio: 2,
                cacheBust: true,
                imagePlaceholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBTAA7'
            });

            const link = document.createElement('a');
            link.download = `${username}-year-in-review-${year}.png`;
            link.href = dataUrl;
            link.click();
        } catch (e) {
            console.error(e);
        } finally {
            restoreGetComputedStyle?.();
            component?.$destroy();
            iframe.remove();
            downloadingImage = false;
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
    <button
        class="fixed top-6 right-6 btn-icon btn-icon-lg variant-filled-tertiary shadow-md"
        style="padding: 10px;"
        title="Download your Year in Review image"
        on:click={() => downloadImage(stats)}
    >
        {#if downloadingImage}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 animate-spin">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
            </svg>
        {/if}
    </button>
{:catch error}
    <p class="text-lg sm:text-2xl text-center mt-20 px-6">
        {#if error.status === 404}
            Unable to retrieve play data for the user {username}, for the year {year}
        {:else}
            An error occurred while collecting your play stats. Please refresh to try again
        {/if}
    </p>
{/await}