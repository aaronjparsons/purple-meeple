<script>
    import { UserGroupIcon, StarIcon } from "$lib/components/icons/solid";
</script>

<div class="relative h-6 w-6 {$$props.class || ''}">
    <UserGroupIcon class="inline-block" />
    <StarIcon class="absolute top-0 -right-1 h-3 w-3" />
</div>