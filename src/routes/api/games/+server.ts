import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { sleep } from '$lib/utils';


export const POST = async ({ request }) => {
    const req = await request.json();
    console.log(`collection fetched - username: ${req.username} (${req.gameIds.length} items), fetching chunks`)
    const collection = [];
    const chunkSize = 300;
    const parser = new XMLParser({ ignoreAttributes: false });
    // Request details on items in collection (300 at a time)
    for (let i = 0; i < req.gameIds.length; i += (chunkSize + 1)) {
        console.log(`fetching items ${i}-${i + chunkSize}`);
        const currentChunk = req.gameIds.slice(i, i + chunkSize);
        const url = `https://boardgamegeek.com/xmlapi2/thing?id=${currentChunk}&stats=1&type=boardgame,boardgameexpansion`;
        const chunkResponse = await fetch(url);

        if (chunkResponse.ok) {
            const text = await chunkResponse.text();
            const parsedChunk = parser.parse(text);
            if (Array.isArray(parsedChunk.items.item)) {
                collection.push(...parsedChunk.items.item);
            } else {
                collection.push(parsedChunk.items.item)
            }
        } else {
            console.log('Chunk error - ', chunkResponse.status)
            throw error(chunkResponse.status);
        }

        // Wait 2 seconds between chunks
        await sleep(2000);
    }

    return new Response(JSON.stringify(collection));
}