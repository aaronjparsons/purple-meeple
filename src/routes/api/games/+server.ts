import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';


export const POST = async ({ request }) => {
    const req = await request.json();
    const parser = new XMLParser({ ignoreAttributes: false });

    console.log(`Fetching ${req.gameIds.length} games for ${req.username}`);
    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${req.gameIds}&stats=1&type=boardgame,boardgameexpansion`;
    const chunkResponse = await fetch(url);
    console.log('Chunk response - ', chunkResponse.status);
    const games = [];
    if (chunkResponse.ok && chunkResponse.status === 200) {
        console.log('Get chunk text start');
        const text = await chunkResponse.text();
        console.log('Get chunk text end');
        const parsedChunk = parser.parse(text);
        if (Array.isArray(parsedChunk.items.item)) {
            games.push(...parsedChunk.items.item);
        } else {
            games.push(parsedChunk.items.item)
        }
    } else {
        console.log('Chunk error - ', chunkResponse.status)
        error(chunkResponse.status);
    }

    return new Response(JSON.stringify({games}));
}