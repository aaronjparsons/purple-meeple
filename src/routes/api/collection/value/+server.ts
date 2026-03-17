import { XMLParser } from 'fast-xml-parser';
import { supabase } from '$lib/supabaseClient';
import { sortAndCompare, sleep } from '$lib/utils';
import { parseGame } from '$lib/parseGame';
import { BGG_BEARER_TOKEN } from "$env/static/private"

export const config = {
    // Use 'nodejs18.x' for Serverless
    runtime: 'edge',
};

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username').toLowerCase();

    let databaseCollection = null;
    let gameIds = [];
    const { data } = await supabase.from('collections').select().eq('username', username);
    if (data && data.length) {
        const row = data[0];
        databaseCollection = row.collection;
        gameIds = Object.keys(databaseCollection);
    }

    const chunkSize = 20;
    const games = [];
    const encoder = new TextEncoder();
    const parser = new XMLParser({ ignoreAttributes: false });

    const customReadable = new ReadableStream({
        async start(controller) {
            try {
                let index = 0;
                let retryDelay = 500;
                while(index < gameIds.length) {
                    const currentChunk = gameIds.slice(index, index + chunkSize);
                    const url = `https://boardgamegeek.com/xmlapi2/thing?id=${currentChunk}&marketplace=1&type=boardgame`;
                    const chunkResponse = await fetch(url, {
                        headers: {
                            'Authorization': `Bearer ${BGG_BEARER_TOKEN}`
                        }
                    });
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
                        index += chunkSize;
                    } else if (chunkResponse.status === 429) {
                        // Rate limited, increase delay between requests
                        retryDelay += 500;
                    }

                    await sleep(retryDelay);
                }


                let eurToUsd = 1.08;
                try {
                    const rateResponse = await fetch('https://open.er-api.com/v6/latest/EUR');
                    if (rateResponse.ok) {
                        const rateData = await rateResponse.json();
                        eurToUsd = rateData.rates.USD;
                    }
                } catch {
                    console.warn('Failed to fetch EUR->USD rate, using fallback rate of', eurToUsd);
                }

                const priceStats = (prices: number[]) => {
                    if (!prices.length) return null;
                    const sorted = [...prices].sort((a, b) => a - b);
                    const mid = Math.floor(sorted.length / 2);
                    const median = sorted.length % 2 === 0
                        ? (sorted[mid - 1] + sorted[mid]) / 2
                        : sorted[mid];
                    return { median };
                };

                const getGameTitle = (game) => {
                    const nameField = game.name;
                    const names = Array.isArray(nameField) ? nameField : [nameField];
                    return names.find(n => n?.['@_type'] === 'primary')?.['@_value'] ?? String(nameField);
                };

                const getPrices = (all: any[], currency: string, multiplier = 1) =>
                    all
                        .filter(l => l?.price?.['@_currency'] === currency)
                        .map(l => parseFloat(l?.price?.['@_value']) * multiplier)
                        .filter(p => !isNaN(p) && p <= 1000);

                const gamesWithoutListings: string[] = [];

                const gameStats = games.map(game => {
                    const listings = game?.marketplacelistings?.listing;
                    const all = listings ? (Array.isArray(listings) ? listings : [listings]) : [];

                    let usdPrices = getPrices(all, 'USD');
                    if (!usdPrices.length) {
                        usdPrices = getPrices(all, 'EUR', eurToUsd);
                    }
                    if (!usdPrices.length) {
                        const title = getGameTitle(game);
                        console.warn(`No USD or EUR listings for: ${title}`);
                        gamesWithoutListings.push(title);
                    }
                    return {
                        id: game['@_id'],
                        USD: priceStats(usdPrices),
                    };
                });

                const withStats = gameStats.filter(g => g.USD !== null);
                const listingStats = withStats.length
                    ? { median: Math.round(withStats.reduce((sum, g) => sum + g.USD.median, 0)) }
                    : null;

                const lastChunk = `last:${JSON.stringify({
                    listingStats,
                    gamesWithoutListings
                })}`
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
}

