import { XMLParser } from 'fast-xml-parser';
import { getCachedCollection } from '$lib/convexClient';
import { sleep } from '$lib/utils';
import { BGG_BEARER_TOKEN } from "$env/static/private"

export const config = {
    // Use 'nodejs18.x' for Serverless
    runtime: 'edge',
};

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username').toLowerCase();

    const databaseCollection = await getCachedCollection(username);
    const gameIds = databaseCollection ? Object.keys(databaseCollection) : [];

    const chunkSize = 20;
    const concurrency = 2;
    const encoder = new TextEncoder();
    const parser = new XMLParser({ ignoreAttributes: false });

    const chunks: string[][] = [];
    for (let i = 0; i < gameIds.length; i += chunkSize) {
        chunks.push(gameIds.slice(i, i + chunkSize));
    }

    const customReadable = new ReadableStream({
        async start(controller) {
            try {
                let completedGames = 0;
                const queue = [...chunks];

                const fetchChunk = async (chunkIds: string[]): Promise<any[]> => {
                    let retries = 0;
                    while (true) {
                        const chunkUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${chunkIds}&marketplace=1&type=boardgame`;
                        const chunkResponse = await fetch(chunkUrl, {
                            headers: { 'Authorization': `Bearer ${BGG_BEARER_TOKEN}` }
                        });
                        if (chunkResponse.ok) {
                            const text = await chunkResponse.text();
                            const parsedChunk = parser.parse(text);
                            let res = parsedChunk.items.item;
                            return Array.isArray(res) ? res : [res];
                        } else if (chunkResponse.status === 429) {
                            retries++;
                            await sleep(500 * retries);
                        } else {
                            throw new Error(`BGG API error: ${chunkResponse.status}`);
                        }
                    }
                };

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
}

