export const getValue = (object: { '@_value': string }) => {
    return object['@_value'];
}

export const sleep = (ms: number) => {
    return new Promise(resolveFunc => setTimeout(resolveFunc, ms));
}

export const convertToFloat = (value: string, dec = 2) => {
    return parseFloat(value).toFixed(dec);
}

export const getGameName = (game: Game) => {
    const name = Array.isArray(game.name)
        ? getValue(game.name[0])
        : getValue(game.name);

    return name.replace(/&#039;/g,"'");
}

export const getGameLink = (game: Game) => {
    const id = game['@_id'];
    const type = game['@_type'];
    return `https://boardgamegeek.com/${type}/${id}`;
}

export const parseGamePlayerCount = (game: Game) => {
    // If min and max are the same, only display one value
    const min = getValue(game['minplayers']);
    const max = getValue(game['maxplayers']);

    return min === max ? min : `${min}-${max}`;
}

export const getBestPlayerCounts = (game: Game) => {
    // Return in format:
    // [voteCount, playerCount, votePercentage]

    const poll = game.poll[0];
    let results = poll.results;

    // Games may very rarely only have a single entry, which is structured as
    // an object, instead of an array, so we stick it in an array first
    if (!Array.isArray(results)) {
        results = [results];
    }

    const totalVotes = results.reduce((acc ,cur) => {
        return parseInt(cur.result[0]['@_numvotes']) + acc;
    }, 0)

    return results.map(result => {
        const votes = parseInt(result.result[0]['@_numvotes']);
        const players = result['@_numplayers'];
        const percentage = totalVotes > 0 ? votes / totalVotes * 100 : 0;
        return [votes, players, percentage];
    })
}

export const parseBestPlayerCount = (game: Game) => {
    // Despite the key name, this is actually total voters
    const totalVoters = parseInt(game.poll[0]['@_totalvotes']);

    if (totalVoters === 0) {
        return '-';
    }

    // Using community voted best player counts
    // Pick 2 of the highest voted countsif there is a differential of 20% or less
    // Otherwise only return the single best player count
    const bestPlayerCounts = getBestPlayerCounts(game);
    bestPlayerCounts.sort((a, b) => b[0] - a[0]).slice(0, 2);

    return bestPlayerCounts.length > 1 && bestPlayerCounts[0][2] - bestPlayerCounts[1][2] <= 20
        ? [bestPlayerCounts[0][1], bestPlayerCounts[1][1]].sort((a, b) => a - b).join(',')
        : bestPlayerCounts[0][1];
}

export const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
}

export const sortAndCompare = (a1: string[], a2: string[]) => {
    const sortedA1 = a1.sort();
    const sortedA2 = a2.sort();
    return sortedA1.length == sortedA2.length && sortedA1.every((element, index) => element === sortedA2[index]);
}

export const months = [ "January", "February", "March", "April", "May", "June",
"July", "August", "September", "October", "November", "December" ];