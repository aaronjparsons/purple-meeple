import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { supabase } from '$lib/supabaseClient';
import { sortAndCompare, sleep } from '$lib/utils';
import { parseGame } from '$lib/parseGame';

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

    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`;
    const collectionResponse = await fetch(collectionUrl);
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
                throw error(400, 'No games in BGG collection.');
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
                    const { error } = await supabase.from('collections').update({
                        collection
                    }).eq('username', username);
                    databaseCollection = collection;
                }
            } else {
                // First time user, create collection entry in DB
                const { data, error } = await supabase.from('collections').insert([{
                    username,
                    collection
                }])

                if (error) {
                    // TODO ?? Just silent fail??
                }
            }
        }

        const chunkSize = 20;
        const games = [];
        const encoder = new TextEncoder();

        const customReadable = new ReadableStream({
            async start(controller) {
                try {
                    let index = 0;
                    while(index < gameIds.length) {
                        const currentChunk = gameIds.slice(index, index + chunkSize);
                        const url = `https://boardgamegeek.com/xmlapi2/thing?id=${currentChunk}&stats=1&type=boardgame,boardgameexpansion`;
                        const chunkResponse = await fetch(url);
                        if (chunkResponse.ok && chunkResponse.status === 200) {
                            const text = await chunkResponse.text();
                            const parsedChunk = parser.parse(text);
                            let res = parsedChunk.items.item;
                            if (!Array.isArray(res)) {
                                res = [res];
                            }
                            games.push(...res);
                            const percent = Math.round(games.length / gameIds.length * 100);
                            controller.enqueue(encoder.encode(JSON.stringify(percent)));
                        }
                        await sleep(500);
                        index += chunkSize;
                    }
                    const parsedCollection = games.map(game => {
                        return parseGame({ ...game, ...databaseCollection[game['@_id']] });
                    })
                    const lastChunk = `last:${JSON.stringify({
                        collection: parsedCollection,
                        updateRequired: updateRequired
                    })}`
                    console.log('last chunk', lastChunk);
                    controller.enqueue(encoder.encode(lastChunk));
                    controller.close();
                } catch (e) {
                    console.log(e)
                    controller.enqueue('error');
                    controller.close();
                }
            },
        });

        return new Response(customReadable, {
            headers: { 'Content-Type': 'text/json; charset=utf-8' },
            status: 200
        });
    } else {
        throw error(collectionResponse.status);
    }
}