import { bggToSimplifiedMechanics } from '$lib/mechanicsMap';

export const parseGame = (game) => {
    const usedMechanics: string[] = [];

    return {
        id: game['@_id'],
        type: game['@_type'],
        description: game.description,
        image: game.image,
        thumbnail: game.thumbnail,
        link: game.link.reduce((o, link) => {
            const type = link['@_type'];
            const value = link['@_value'];
            if (o[type]) {
                o[type].push(value);
            } else {
                o[type] = [value];
            }
            return o;
        }, {}),
        mechanics: game.link.map(link => {
            if (link['@_type'] === 'boardgamemechanic') {
                const mappedName = bggToSimplifiedMechanics[link['@_value']];
                if (mappedName && !usedMechanics.includes(mappedName)) {
                    usedMechanics.push(mappedName);
                    return mappedName;
                }
            }
        }).filter(mechanic => mechanic),
        maxplayers: parseInt(game.maxplayers['@_value']),
        maxplaytime: parseInt(game.maxplaytime['@_value']),
        minage: parseInt(game.minage['@_value']),
        minplayers: parseInt(game.minplayers['@_value']),
        minplaytime: parseInt(game.minplaytime['@_value']),
        name: String(game.name).replace(/&#039;/g,"'"),
        numplays: game.numplays,
        playingtime: parseInt(game.playingtime['@_value']),
        poll: game.poll,
        statistics: Object.entries(game.statistics.ratings).reduce((o, [key, value]) => {
            return { ...o, [key]: value['@_value'] }
        }, {}),
        yearpublished: parseInt(game.yearpublished['@_value']),
    }
}