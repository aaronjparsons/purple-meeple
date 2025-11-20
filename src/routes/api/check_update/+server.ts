import { error } from '@sveltejs/kit';
import { BGG_BEARER_TOKEN } from "$env/static/private"

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username').toLowerCase();

    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`;
    const collectionResponse = await fetch(collectionUrl, {
        headers: {
            'Authorization': `Bearer ${BGG_BEARER_TOKEN}`
        }
    });

    if (collectionResponse.ok) {
        if (collectionResponse.status === 202) {
            // BGG still preparing
            return new Response(null, { status: 202 });
        } else {
            return new Response(JSON.stringify({ status: 'ready' }), { status: 200 });
        }
    }else {
        error(collectionResponse.status);
    }
}