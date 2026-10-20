import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { collectionGame } from './schema';

// These functions are only meant to be called from our SvelteKit server endpoints,
// so require a shared secret (set via `npx convex env set CONVEX_SERVER_SECRET ...`)
const assertServer = (secret: string) => {
    if (!process.env.CONVEX_SERVER_SECRET || secret !== process.env.CONVEX_SERVER_SECRET) {
        throw new Error('Unauthorized');
    }
};

export const getByUsername = query({
    args: { secret: v.string(), username: v.string() },
    handler: async (ctx, { secret, username }) => {
        assertServer(secret);
        return await ctx.db
            .query('collections')
            .withIndex('by_username', (q) => q.eq('username', username))
            .unique();
    }
});

export const upsert = mutation({
    args: {
        secret: v.string(),
        username: v.string(),
        collection: v.array(collectionGame)
    },
    handler: async (ctx, { secret, username, collection }) => {
        assertServer(secret);
        const existing = await ctx.db
            .query('collections')
            .withIndex('by_username', (q) => q.eq('username', username))
            .unique();
        if (existing) {
            await ctx.db.patch(existing._id, { collection });
        } else {
            await ctx.db.insert('collections', { username, collection });
        }
    }
});
