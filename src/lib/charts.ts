import { parseGamePlayerCount } from "./utils";

export const parseChartData = (collection: Game[]) => {
    return collection.reduce((acc, game) => {
        // Get the player counts
        const [min, max] = parseGamePlayerCount(game).split('-'); // eg: 2-4
        const start = parseInt(min);
        const end = max ? Math.min(9, parseInt(max)) : start;

        for (let i = start; i <= end; i++) {
            if (!acc.playerCounts[i]) {
                acc.playerCounts[i] = 0;
            }
            acc.playerCounts[i]++;
        }

        // Get the categories & mechanics
        for (const link of game.link) {
            const type = link['@_type'];
            const id = link['@_value'];

            if (type === 'boardgamecategory') {
                if (!acc.categories[id]) {
                    acc.categories[id] = 0;
                }
                acc.categories[id]++;
            } else if (type === 'boardgamemechanic') {
                if (!acc.mechanics[id]) {
                    acc.mechanics[id] = 0;
                }
                acc.mechanics[id]++;
            }
        }

        return acc;
    }, {
        playerCounts: {},
        categories: {},
        mechanics: {},
    })
}