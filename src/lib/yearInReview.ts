import { XMLParser } from 'fast-xml-parser';
import { months } from '$lib/utils';
import { BGG_BEARER_TOKEN } from "$env/static/private"

const parseGameData = (games: Game[], groupedByGame) => {
    const images = {};
    let categories = {};
    let mechanics = {};
    for (const game of games) {
        const id = game['@_id'];

        images[id] = game.image;

        if (game.link && Array.isArray(game.link)) {
            for (const link of game.link) {
                if (link['@_type'] === 'boardgamecategory') {
                    if (categories[link['@_id']]) {
                        categories[link['@_id']].playCount += 1;
                    } else {
                        categories[link['@_id']] = {
                            name: link['@_value'],
                            playCount: 1,
                        }
                    }
                }
                if (link['@_type'] === 'boardgamemechanic') {
                    if (mechanics[link['@_id']]) {
                        mechanics[link['@_id']].playCount += 1;
                    } else {
                        mechanics[link['@_id']] = {
                            name: link['@_value'],
                            playCount: 1,
                        }
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

    return [ images, categories, mechanics ];
}

export const getYearInReview = async ({ username, year }) => {
    const playsUrl = `https://boardgamegeek.com/xmlapi2/plays?username=${username}&mindate=${year}-01-01&maxdate=${year}-12-31`;
    const playsResponse = await fetch(playsUrl, {
        headers: {
            'Authorization': `Bearer ${BGG_BEARER_TOKEN}`
        }
    });
    let res = '';

    if (playsResponse.ok) {
        res = await playsResponse.text();
    } else {
        throw new Error(playsResponse.status);
    }

    const parser = new XMLParser({ ignoreAttributes: false });
    const parsed = parser.parse(res);


    if (parsed.div && parsed.div['@_class'] === 'messagebox error') {
        // Bad username
        throw new Error(404);
    }

    // Check total to see if we need to fetch more
    const pageSize = 100;
    const total = parsed.plays['@_total'];

    if (total === '0') {
        // User has no plays logged
        throw new Error(404); // TODO: need diff error??
    }

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
                if (!Array.isArray(currentParsed.plays.play)) {
                    currentParsed.plays.play = [currentParsed.plays.play];
                }
                // Add new page to existing data
                parsed.plays.play = [
                    ...parsed.plays.play,
                    ...currentParsed.plays.play
                ]
                page++;
                currentTotal += 100;
            } else {
                throw new Error(nextPageResponse.status);
            }
        }
    }

    const response = {
        totalPlayed: 0,
        uniquePlayed: 0,
        totalTimePlayed: 0,
        longestPlaySession: {
            id: '',
            name: '',
            length: 0,
            date: ''
        },
        daysMostPlayed: [],
        monthMostPlayed: '',
        daysPlayed: 0,
        mostPlayedByCount: [],
        mostPlayedByTime: [],
    }

    const groupedByGame = {};
    const groupedByDate = {};
    const groupedByMonth = {};
    let top5ByCount = {};
    let top5ByTime = {};

    for (const play of parsed.plays.play) {
        const gameId = play.item['@_objectid'];
        const gameName = play.item['@_name'].replace(/&#039;/g,"'");
        const playTime = parseInt(play['@_length']);
        const playQuantity = parseInt(play['@_quantity']);
        const date = play['@_date'];
        const month = date.split('-')[1];

        response.totalPlayed += playQuantity;

        // Add time to aggregates
        if (playTime) {
            response.totalTimePlayed += playTime;
            if (playTime > response.longestPlaySession.length) {
                response.longestPlaySession = {
                    id: gameId,
                    name: gameName,
                    length: playTime,
                    date: date
                }
            }
        }

        // Group by game
        if (groupedByGame[gameId]) {
            groupedByGame[gameId].playCount += playQuantity;
            groupedByGame[gameId].length += playTime;
        } else {
            groupedByGame[gameId] = {
                playCount: playQuantity,
                length: playTime,
                name: gameName
            }
        }

        // Group by date
        if (groupedByDate[date]) {
            if (groupedByDate[date].games[gameName]) {
                groupedByDate[date].games[gameName] += 1;
            } else {
                groupedByDate[date].games[gameName] = 1;
            }
            groupedByDate[date].count += playQuantity;
        } else {
            groupedByDate[date] = {
                count: playQuantity,
                games: {
                    [gameName]: 1
                }
            }
        }

        // Group by month
        if (groupedByMonth[month]) {
            if (groupedByMonth[month].games[gameName]) {
                groupedByMonth[month].games[gameName] += 1;
            } else {
                groupedByMonth[month].games[gameName] = 1;
            }
            groupedByMonth[month].count += playQuantity;
        } else {
            groupedByMonth[month] = {
                count: playQuantity,
                games: {
                    [gameName]: 1
                }
            }
        }
    }

    // Get top 5 most played (by count)
    top5ByCount = Object.entries(groupedByGame).sort((a, b) => {
        return b[1].playCount - a[1].playCount;
    }).slice(0, 5).map(g => ({ id: g[0], ...g[1] }));

    // Get top 5 most played (by length)
    top5ByTime = Object.entries(groupedByGame).sort((a, b) => {
        return b[1].length - a[1].length;
    }).slice(0, 5).map(g => ({ id: g[0], ...g[1] }));

    // Get days most played
    const daysMostPlayedSorted = Object.entries(groupedByDate).sort((a, b) => {
        return b[1].count - a[1].count;
    });

    const dayMostPlayedCount = daysMostPlayedSorted[0][1].count;

    // If there are multiple days with the same count, use the most recent
    const sortedDays = daysMostPlayedSorted.filter(d => {
        return d[1].count === dayMostPlayedCount;
    });
    const dayMostPlayed = sortedDays[sortedDays.length - 1];

    response.daysMostPlayed = {
        date: dayMostPlayed[0],
        plays: {
            count: dayMostPlayed[1].count,
            games: Object.entries(dayMostPlayed[1].games).map(g => {
                return {
                    name: g[0],
                    count: g[1]
                }
            }).sort((a, b) => {
                return b.count - a.count;
            })
        }
    }

    // Get ids of most played & longest played
    const gameIds = [...new Set([
        ...top5ByCount.map(g => g.id),
        ...top5ByTime.map(g => g.id),
        response.longestPlaySession.id
    ])];
    response.daysPlayed = Object.keys(groupedByDate).length;
    response.uniquePlayed = Object.keys(groupedByGame).length;

    const gamesUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${gameIds}`;
    const gamesResponse = await fetch(gamesUrl, {
        headers: {
            'Authorization': `Bearer ${BGG_BEARER_TOKEN}`
        }
    });
    let images = {};
    let categories = {};
    let mechanics = {};

    if (gamesResponse.ok) {
        const text = await gamesResponse.text();
        const gamesParsed = parser.parse(text);
        [ images, categories, mechanics ] = parseGameData(gamesParsed.items.item, groupedByGame);
    } else {
        throw new Error(gamesResponse.status);
    }


    // Get top 5 most played (by count)
    response.mostPlayedByCount = top5ByCount;
    // Get top 5 most played (by length)
    response.mostPlayedByTime = top5ByTime;

    const monthMostPlayed = Object.entries(groupedByMonth).sort((a, b) => {
        return b[1].count - a[1].count;
    })[0];
    response.monthMostPlayed = {
        month: months[parseInt(monthMostPlayed[0] - 1)],
        plays: {
            count: monthMostPlayed[1].count,
            games: Object.entries(monthMostPlayed[1].games).map(g => {
                return {
                    name: g[0],
                    count: g[1]
                }
            }).sort((a, b) => {
                return b.count - a.count;
            })
        }
    }

    return {
        ...response,
        categories,
        mechanics,
        images,
    };
}