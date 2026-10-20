import { ConvexHttpClient } from 'convex/browser';
import { PUBLIC_CONVEX_URL } from '$env/static/public';
import { CONVEX_SERVER_SECRET } from '$env/static/private';
import { api } from '../../convex/_generated/api';

const convex = new ConvexHttpClient(PUBLIC_CONVEX_URL);

// Cache failures shouldn't break collection loading, so both helpers swallow errors
export const getCachedCollection = async (username: string) => {
    try {
        const row = await convex.query(api.collections.getByUsername, {
            secret: CONVEX_SERVER_SECRET,
            username
        });
        if (!row) return null;
        return Object.fromEntries(row.collection.map(({ id, ...game }) => [id, game]));
    } catch (e) {
        console.error('Failed to read collection from Convex', e);
        return null;
    }
};

export const saveCollection = async (username: string, collection: Record<string, any>) => {
    try {
        await convex.mutation(api.collections.upsert, {
            secret: CONVEX_SERVER_SECRET,
            username,
            collection: Object.entries(collection).map(([id, game]) => ({ id, ...game }))
        });
    } catch (e) {
        console.error('Failed to save collection to Convex', e);
    }
};
