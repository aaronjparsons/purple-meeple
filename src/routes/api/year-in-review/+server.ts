import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';

// Notes:
// - Execution time can be long, need to optimize/split up
//      - Possible to split up base play parsing & "parseGameData" (seems to be where most time is)
// - Remove categories??
// - Add "best friend"?
// - Add favorite designer?
// - Store in DB?
//      - could use this to split the execution into two sections (create base & then supplement & add aggregate)
//      - (could reference back for future years)

const parseGameData = (games: Game[], groupedByGame) => {
    let categories = {};
    let mechanics = {};
    const grouped = {};
    for (const game of games) {
        const id = game['@_id'];
        const gameObject = {
            name: game.name,
            image: game.image,
            playCount: groupedByGame[id].playCount
        }

        grouped[id] = gameObject;

        for (const link of game.link) {
            if (link['@_type'] === 'boardgamecategory') {
                if (categories[link['@_id']]) {
                    categories[link['@_id']].playCount += 1;
                    if (gameObject.playCount > categories[link['@_id']].game.playCount) {
                        categories[link['@_id']].game = gameObject;
                    }
                } else {
                    categories[link['@_id']] = {
                        name: link['@_value'],
                        playCount: 1,
                        game: gameObject
                    }
                }
            }
            if (link['@_type'] === 'boardgamemechanic') {
                if (mechanics[link['@_id']]) {
                    mechanics[link['@_id']].playCount += 1;
                    if (gameObject.playCount > mechanics[link['@_id']].game.playCount) {
                        mechanics[link['@_id']].game = gameObject;
                    }
                } else {
                    mechanics[link['@_id']] = {
                        name: link['@_value'],
                        playCount: 1,
                        game: gameObject
                    }
                }
            }
        }
    }

    categories = Object.values(categories).sort((a, b) => {
        return b.playCount - a.playCount
    }).slice(0, 3);
    mechanics = Object.values(mechanics).sort((a, b) => {
        return b.playCount - a.playCount
    }).slice(0, 3);

    return [ grouped, categories, mechanics ];
}

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username').toLowerCase();

    const playsUrl = `https://boardgamegeek.com/xmlapi2/plays?username=${username}&mindate=2023-01-01&maxdate=2023-12-31`;
    const playsResponse = await fetch(playsUrl);
    let res = '';

    if (playsResponse.ok) {
        res = await playsResponse.text();
    } else {
        throw error(playsResponse.status);
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(res);

    if (parsed.div && parsed.div['@_class'] === 'messagebox error') {
        // Bad username
        throw error(404);
    }

    // Check total to see if we need to fetch more
    const pageSize = 100;
    const total = parsed.plays['@_total'];

    if (total > pageSize) {
        // We have more than 100, grab each page 100 at a time
        let page = 2;
        let currentTotal = 100;
        while (currentTotal < total) {
            const nextPageUrl = `${playsUrl}&page=${page}`;
            const nextPageResponse = await fetch(nextPageUrl);
            let currentRes = '';

            if (nextPageResponse.ok) {
                currentRes = await nextPageResponse.text();
                const currentParsed = parser.parse(currentRes);
                // Add new page to existing data
                parsed.plays.play = [
                    ...parsed.plays.play,
                    ...currentParsed.plays.play
                ]
                page++;
                currentTotal += 100;
            } else {
                throw error(nextPageResponse.status);
            }
        }
    }

    let groupedByGame = {};
    const groupedByDate = {};

    const response = {
        totalPlayed: parseInt(parsed.plays['@_total']),
        uniquePlayed: 0,
        totalTimePlayed: 0,
        longestPlaySession: {
            name: '',
            length: 0,
            date: ''
        },
        daysMostPlayed: [],
        daysPlayed: 0,
        mostPlayedByCount: [],
    }

    for (const play of parsed.plays.play) {
        const gameId = play.item['@_objectid'];
        const gameName = play.item['@_name'];
        const playTime = parseInt(play['@_length']);
        const date = play['@_date'];

        // Add time to aggregates
        if (playTime) {
            response.totalTimePlayed += playTime;
            if (playTime > response.longestPlaySession.length) {
                response.longestPlaySession = {
                    name: gameName,
                    length: playTime,
                    date: date
                }
            }
        }

        // Group by game
        if (groupedByGame[gameId]) {
            groupedByGame[gameId].playCount += 1;
        } else {
            groupedByGame[gameId] = {
                playCount: 1,
                name: gameName
            }
        }

        // Group by date
        if (groupedByDate[date]) {
            groupedByDate[date].push({
                id: gameId,
                length: playTime,
            });
        } else {
            groupedByDate[date] = [{
                id: gameId,
                length: playTime,
            }]
        }
    }

    const gameIds = Object.keys(groupedByGame);
    response.daysPlayed = Object.keys(groupedByDate).length;
    response.uniquePlayed = gameIds.length;

    const gamesUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameIds}`;
    const gamesResponse = await fetch(gamesUrl);
    let categories = {};
    let mechanics = {};

    if (gamesResponse.ok) {
        const text = await gamesResponse.text();
        const gamesParsed = parser.parse(text);
        [ groupedByGame, categories, mechanics ] = parseGameData(gamesParsed.items.item, groupedByGame);
    } else {
        // TODO:
    }


    // Get top 5 most played (by count)
    response.mostPlayedByCount = Object.entries(groupedByGame).sort((a, b) => {
        return b[1].playCount - a[1].playCount;
    }).slice(0, 5).map(g => g[1]);

    // Get days most played
    const daysMostPlayedSorted = Object.entries(groupedByDate).sort((a, b) => {
        return b[1].length - a[1].length;
    });
    const dayMostPlayedCount = daysMostPlayedSorted[0][1].length;
    response.daysMostPlayed = daysMostPlayedSorted.filter(d => {
        return d[1].length === dayMostPlayedCount;
    }).map(d => {
        return {
            date: d[0],
            plays: d[1]
        }
    });

    return new Response(JSON.stringify({
        ...response,
        categories,
        mechanics
    }));
};