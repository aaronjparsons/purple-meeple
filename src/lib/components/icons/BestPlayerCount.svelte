<script lang="ts">
    import { UserGroupSolid, StarSolid } from "./index.ts";
    interface Props {
        [key: string]: any
    }

    let { ...props }: Props = $props();
</script>

<div class="relative h-6 w-6 {props.class || ''}">
    <UserGroupSolid class="inline-block" />
    <StarSolid class="absolute top-0 -right-1 h-3 w-3" />
</div>