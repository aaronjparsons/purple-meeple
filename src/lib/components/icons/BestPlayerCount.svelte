<script>
    import { UserGroupSolid, StarSolid } from "./index.ts";
</script>

<div class="relative h-6 w-6 {$$props.class || ''}">
    <UserGroupSolid class="inline-block" />
    <StarSolid class="absolute top-0 -right-1 h-3 w-3" />
</div>