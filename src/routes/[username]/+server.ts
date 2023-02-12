import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { sleep } from '$lib/utils';


export const GET = async ({ url }) => {
    const username = url.searchParams.get('username');
    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`;
    let collectionResponse = await fetch(collectionUrl);
    console.log('fetching collections')
    if (collectionResponse.ok) {
        if (collectionResponse.status === 202) {
            // BGG preparing request. Fetch again soon
            while (collectionResponse.status === 202) {
                console.log('202 - bgg preparing, wait 10s and fetch again')
                await sleep(10000);
                collectionResponse = await fetch(collectionUrl);
                if (!collectionResponse.ok) {
                    throw error(collectionResponse.status, 'error...');
                }
            }
        }

        if (collectionResponse.status === 200) {
            const text = await collectionResponse.text();
            const parser = new XMLParser({ ignoreAttributes: false });
            const parsed = parser.parse(text);
            console.log(`collection fetched (${parsed.items.item.length} items), fetching chunks`)

            // Invalid username error
            if (parsed.errors && parsed.errors.error) {
                const msg = parsed.errors.error.message;
                if (msg === 'Invalid username specified') {
                    throw error(404);
                }
            }

            const collection = [];
            const allIds = parsed.items.item.map(thing => thing['@_objectid']);
            const chunkSize = 250;
            // Request details on items in collection (250 at a time)
            for (let i = 0; i < allIds.length; i += (chunkSize + 1)) {
                console.log(`fetching items ${i}-${i + chunkSize}`);
                const currentChunk = allIds.slice(i, i + chunkSize);
                const url = `https://boardgamegeek.com/xmlapi2/thing?id=${currentChunk}&stats=1&type=boardgame,boardgameexpansion`;
                const chunkResponse = await fetch(url);

                if (chunkResponse.ok) {
                    const text = await chunkResponse.text();
                    const parsedChunk = parser.parse(text);
                    collection.push(...parsedChunk.items.item);
                }

                // Wait 2 seconds between chunks
                await sleep(2000);
            }

            return new Response(JSON.stringify(collection));
        }
    } else {
        throw error(collectionResponse.status, 'error...');
    }
}