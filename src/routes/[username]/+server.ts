import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { sleep } from '$lib/utils';


export const GET = async ({ url }) => {
    const username = url.searchParams.get('username');
    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&want=0&wishlist=0&preordered=0&prevowned=0`;
    const collectionResponse = await fetch(collectionUrl);
    if (collectionResponse.ok) {
        if (collectionResponse.status === 200) {
            const text = await collectionResponse.text();
            const parser = new XMLParser({ ignoreAttributes: false });
            const parsed = parser.parse(text);

            const collection = [];
            const allIds = parsed.items.item.map(thing => thing['@_objectid']);
            const chunkSize = 50;
            // Request details on items in collection (50 at a time)
            for (let i = 0; i < allIds.length; i += chunkSize) {
                const currentChunk = allIds.slice(i, i + chunkSize);
                const url = `https://boardgamegeek.com/xmlapi2/thing?id=${currentChunk}&stats=1&type=boardgame,boardgameexpansion`;
                const chunkResponse = await fetch(url);

                if (chunkResponse.ok) {
                    const text = await chunkResponse.text();
                    const parsedChunk = parser.parse(text);
                    collection.push(...parsedChunk.items.item);
                }

                // Wait 1 seconds between chunks
                await sleep(1000);
            }

            return new Response(JSON.stringify(collection));
        }

        // TODO: Handle rate limited () & fetching soon (202)
    } else {
        throw error(404, 'Not found');
    }

}