import { error } from '@sveltejs/kit';
import { getYearInReview } from '$lib/yearInReview';

// Notes:
// - Store in DB?
//      - could use this to split the execution into two sections (create base & then supplement & add aggregate)
//      - (could reference back for future years)
//      - Compare against others?? (for certain data points eg: total played, unique played, time played)

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username').toLowerCase();
    const year = url.searchParams.get('year')

    try {
        const payload = await getYearInReview({ username, year });

        return new Response(JSON.stringify(payload));
    } catch (e) {
        error(e.message);
    }
};