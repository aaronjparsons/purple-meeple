import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';


export const GET = async ({ url }) => {
    const username = url.searchParams.get('username');
    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`;
    const collectionResponse = await fetch(collectionUrl);
    console.log(`fetching collection - username: ${username}`);

    if (collectionResponse.ok) {
        if (collectionResponse.status === 202) {
            // BGG preparing request. Fetch again soon
            return new Response(null, { status: 202 });
        }

        if (collectionResponse.status === 200) {
            const text = await collectionResponse.text();
            const parser = new XMLParser({ ignoreAttributes: false });
            const parsed = parser.parse(text);

            // Invalid username error
            if (parsed.errors && parsed.errors.error) {
                const msg = parsed.errors.error.message;
                if (msg === 'Invalid username specified') {
                    throw error(404);
                }
            }

            const allIds = parsed.items.item.map(thing => thing['@_objectid']);
            const res = {
                gameIds: allIds
            }
            return new Response(JSON.stringify(res));
        }
    } else {
        throw error(collectionResponse.status);
    }
}