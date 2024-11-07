<script lang="ts">
    import { page } from '$app/stores'

    $effect(() => {
        if (typeof gtag !== 'undefined') {
            gtag('config', 'G-PJKRPZK15K', {
                page_title: document.title,
                page_path: $page.url.pathname,
            })
        }
    });
</script>

<svelte:head>
    <script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-PJKRPZK15K">
    </script>
    <script>
        window.dataLayer = window.dataLayer || []

        function gtag() {
            dataLayer.push(arguments)
        }

        gtag('js', new Date())
        gtag('config', 'G-PJKRPZK15K')
    </script>
</svelte:head>
