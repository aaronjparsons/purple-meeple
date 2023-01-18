<script>
    import "../app.css";
    import { page } from "$app/stores";
    import { Library } from "$lib/store";

    $: logoAtTop = $page.url.pathname !== '/' && $Library.loaded;
</script>

<div class="h-full relative">
    <h1 class="absolute {logoAtTop ? 'top-0 p-8' : 'top-1/3'} w-full text-center text-4xl sm:text-7xl font-bold transition-all">
        BGG-Library
    </h1>
    <div class="h-full overflow-auto">
        <slot />
    </div>
</div>