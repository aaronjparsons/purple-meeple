import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';
import { supabase } from '$lib/supabaseClient';
import { sortAndCompare } from '$lib/utils';

const mapPlays = (plays: object) => {
    return Object.entries(plays).map(([key, value]) => {
        return `${key}.${value}`;
    })
}

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username').toLowerCase();

    // Check db for collection
    let userCollection = null;
    const { data } = await supabase.from('collections').select().eq('username', username);
    if (data && data.length) {
        const row = data[0];
        userCollection = {
            gameIds: row.games,
            plays: row.plays
        }
    }

    const collectionUrl = `https://boardgamegeek.com/xmlapi2/collection?username=${username}&own=1`;
    const collectionResponse = await fetch(collectionUrl);
    console.log(`fetching collection - username: ${username}`);

    if (collectionResponse.ok) {
        if (collectionResponse.status === 202) {
            // BGG preparing request. Fetch again soon
            if (userCollection !== null) {
                // Return db collection with a "updated needed" flag
                return new Response(JSON.stringify({
                    ...userCollection,
                    updateRequired: true
                }));
            } else {
                // First time user, no entry and need to wait for BGG
                // Return 202 so FE will re-attempt
                return new Response(null, { status: 202 });
            }
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

            const items = Array.isArray(parsed.items.item)
                ? parsed.items.item
                : [parsed.items.item]
            const gameIds = items.map(thing => thing['@_objectid']);
            const plays = items.reduce((o, thing) => {
                return { ...o, [thing['@_objectid']]: thing.numplays }
            }, {});

            if (userCollection !== null) {
                // Compare entry with BGG response to see if out of date
                const gamesAreSame = sortAndCompare(userCollection.gameIds, gameIds);
                const mappedEntryPlays = mapPlays(userCollection.plays);
                const mappedBggPlays = mapPlays(plays);
                const playsAreSame = sortAndCompare(mappedEntryPlays, mappedBggPlays);

                if (!gamesAreSame || !playsAreSame) {
                    // Entry out of date, update it
                    const { error } = await supabase.from('collections').update({
                        games: gameIds,
                        plays
                    }).eq('username', username);
                }
            } else {
                // First time user, create collection entry in DB
                const { data, error } = await supabase.from('collections').insert([{
                    username,
                    games: gameIds,
                    plays
                }])

                if (error) {
                    // TODO ?? Just silent fail??
                }
            }

            const res = {
                gameIds,
                plays
            }
            return new Response(JSON.stringify(res));
        }
    } else {
        throw error(collectionResponse.status);
    }
}