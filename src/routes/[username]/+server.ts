import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { sleep } from '$lib/utils';


export const GET = async ({ url }) => {
    const username = url.searchParams.get('username');
    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&want=0&wishlist=0&preordered=0&prevowned=0`;
    let collectionResponse = await fetch(collectionUrl);
    console.log('fetching collections')
    if (collectionResponse.ok) {
        if (collectionResponse.status === 202) {
            // TODO: This should probably loop until successful??
            // BGG preparing request. Fetch again soon
            console.log('202 - bgg preparing, wait 1500ms and fetch again')
            await sleep(1500);
            collectionResponse = await fetch(collectionUrl);

            if (!collectionResponse.ok) {
                throw error(collectionResponse.status, 'error...');
            }
        }

        if (collectionResponse.status === 200) {
            console.log('collection fetched, fetching chunks')
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
    } else {
        throw error(collectionResponse.status, 'error...');
    }
}