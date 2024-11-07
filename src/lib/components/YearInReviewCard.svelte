<script lang="ts">
    interface Props {
        bgClass?: string;
        children?: import('svelte').Snippet;
    }

    let { bgClass = 'variant-ghost-surface', children }: Props = $props();
</script>

<div class="card rounded-md shadow-lg p-4 {bgClass}">
    {@render children?.()}
</div>