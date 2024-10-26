import { error } from '@sveltejs/kit';

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username').toLowerCase();

    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`;
    const collectionResponse = await fetch(collectionUrl);

    if (collectionResponse.ok) {
        if (collectionResponse.status === 202) {
            // BGG still preparing
            return new Response(null, { status: 202 });
        } else {
            return new Response(JSON.stringify({ status: 'ready' }), { status: 200 });
        }
    }else {
        throw error(collectionResponse.status);
    }
}