export const parseGame = (game) => {
    return {
        id: game['@_id'],
        type: game['@_type'],
        description: game.description,
        image: game.image,
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
        maxplayers: parseInt(game.maxplayers['@_value']),
        maxplaytime: parseInt(game.maxplaytime['@_value']),
        minage: parseInt(game.minage['@_value']),
        minplayers: parseInt(game.minplayers['@_value']),
        minplaytime: parseInt(game.minplaytime['@_value']),
        name: game.name.replace(/&#039;/g,"'"),
        numplays: game.numplays,
        playingtime: parseInt(game.playingtime['@_value']),
        poll: game.poll,
        statistics: Object.entries(game.statistics.ratings).reduce((o, [key, value]) => {
            return { ...o, [key]: value['@_value'] }
        }, {}),
        yearpublished: parseInt(game.yearpublished['@_value']),
    }
}