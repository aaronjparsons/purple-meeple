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

export const parseGamePlayerCount = (game: Game) => {
    // If min and max are the same, only display one value
    const min = getValue(game['minplayers']);
    const max = getValue(game['maxplayers']);

    return min === max ? min : `${min}-${max}`;
}

export const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
}