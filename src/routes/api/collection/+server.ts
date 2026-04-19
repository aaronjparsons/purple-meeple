import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { supabase } from '$lib/supabaseClient';
import { sortAndCompare, sleep } from '$lib/utils';
import { parseGame } from '$lib/parseGame';
import { BGG_BEARER_TOKEN } from "$env/static/private"

export const config = {
    // Use 'nodejs18.x' for Serverless
    runtime: 'edge',
};

const mapPlays = (plays: object) => {
    return Object.entries(plays).map(([key, value]) => {
        return `${key}.${value}`;
    })
}

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username').toLowerCase();

    // Check db for collection
    let databaseCollection = null;
    let updateRequired = false;

    const { data } = await supabase.from('collections').select().eq('username', username);
    if (data && data.length) {
        const row = data[0];
        databaseCollection = row.collection;
    }

    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&excludesubtype=boardgameexpansion&own=1`;
    const collectionResponse = await fetch(collectionUrl, {
        headers: {
            'Authorization': `Bearer ${BGG_BEARER_TOKEN}`
        }
    });
    console.log(`fetching collection - username: ${username}`);

    const parser = new XMLParser({ ignoreAttributes: false });
    let gameIds = [];

    if (collectionResponse.ok) {
        if (collectionResponse.status === 202) {
            // BGG preparing request. Fetch again soon
            if (databaseCollection !== null) {
                // Return db collection with a "updated needed" flag
                updateRequired = true;
                gameIds = Object.keys(databaseCollection);
            } else {
                // First time user, no entry and need to wait for BGG
                // Return 202 so FE will re-attempt
                return new Response(null, { status: 202 });
            }
        }

        if (collectionResponse.status === 200) {
            const text = await collectionResponse.text();
            const parsed = parser.parse(text);

            // No items in collection
            if (parsed.items['@_totalitems'] === '0') {
                error(400, 'No games in BGG collection.');
            }

            const items = Array.isArray(parsed.items.item)
                ? parsed.items.item
                : [parsed.items.item]
            gameIds = items.map(thing => thing['@_objectid']);
            const collection = items.reduce((o, game) => {
                return {
                    ...o,
                    [game['@_objectid']]: { name: game.name['#text'], image: game.image, numplays: game.numplays }
                }
            }, {});
            const plays = items.reduce((o, thing) => {
                return { ...o, [thing['@_objectid']]: thing.numplays }
            }, {});

            if (databaseCollection !== null) {
                // Compare entry with BGG response to see if out of date
                let gamesAreSame = true;
                let playsAreSame = true;

                const dbCollectionGameIds = Object.keys(databaseCollection);
                const dbCollectionPlays = Object.entries(databaseCollection).reduce((o, [key, value]) => {
                    return { ...o, [key]: value.numplays }
                }, {});

                gamesAreSame = sortAndCompare(dbCollectionGameIds, gameIds);
                const mappedEntryPlays = mapPlays(dbCollectionPlays);
                const mappedBggPlays = mapPlays(plays);
                playsAreSame = sortAndCompare(mappedEntryPlays, mappedBggPlays);

                if (!gamesAreSame || !playsAreSame || !databaseCollection) {
                    // Entry out of date, update it
                    // Note: we also check if the dbCollection is null, for backwards compatibility
                    // With existing users who don't have a collection entry in the DB
                    await supabase.from('collections').update({ collection }).eq('username', username);
                    databaseCollection = collection;
                }
            } else {
                if (data && data.length) {
                    // User has an entry in the DB but no collection
                    // Update it with the new collection
                    await supabase.from('collections').update({ collection }).eq('username', username);
                    databaseCollection = collection;
                } else {
                    // First time user, create collection entry in DB
                    await supabase.from('collections').insert([{ username, collection }]);
                    databaseCollection = collection;
                }
            }
        }

        const chunkSize = 20;
        const concurrency = 2;
        const encoder = new TextEncoder();

        const chunks: string[][] = [];
        for (let i = 0; i < gameIds.length; i += chunkSize) {
            chunks.push(gameIds.slice(i, i + chunkSize));
        }

        const fetchChunk = async (chunkIds: string[]): Promise<any[]> => {
            let retries = 0;
            while (true) {
                const chunkUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${chunkIds}&stats=1&type=boardgame`;
                const chunkResponse = await fetch(chunkUrl, {
                    headers: { 'Authorization': `Bearer ${BGG_BEARER_TOKEN}` }
                });
                if (chunkResponse.ok) {
                    const text = await chunkResponse.text();
                    const parsedChunk = parser.parse(text);
                    let res = parsedChunk.items.item;
                    return Array.isArray(res) ? res : [res];
                } else if (chunkResponse.status === 429) {
                    console.log(`Rate limited by BGG API. Retrying chunk after delay...`);
                    retries++;
                    await sleep(500 * retries);
                } else {
                    throw new Error(`BGG API error: ${chunkResponse.status}`);
                }
            }
        };

        const customReadable = new ReadableStream({
            async start(controller) {
                try {
                    let completedGames = 0;
                    const queue = [...chunks];

                    const worker = async (): Promise<any[]> => {
                        const localGames: any[] = [];
                        while (queue.length) {
                            const chunk = queue.shift()!;
                            const chunkGames = await fetchChunk(chunk);
                            localGames.push(...chunkGames);
                            completedGames += chunkGames.length;
                            const percent = Math.round(completedGames / gameIds.length * 100);
                            controller.enqueue(encoder.encode(JSON.stringify(percent) + '\n'));
                        }
                        return localGames;
                    };

                    const workerResults = await Promise.all(
                        Array.from({ length: Math.min(concurrency, chunks.length) }, worker)
                    );
                    const games = workerResults.flat();

                    const parsedCollection = games.map(game => {
                        return parseGame({ ...game, ...(databaseCollection?.[game['@_id']] ?? {}) });
                    });
                    const lastChunk = `last:${JSON.stringify({
                        collection: parsedCollection,
                        updateRequired: updateRequired
                    })}`;
                    controller.enqueue(encoder.encode(lastChunk + '\n'));
                    controller.close();
                } catch (e) {
                    controller.enqueue(encoder.encode('error\n'));
                    controller.close();
                }
            },
        });

        return new Response(customReadable, {
            headers: { 'Content-Type': 'text/json; charset=utf-8' },
            status: 200
        });
    } else {
        error(collectionResponse.status);
    }
}