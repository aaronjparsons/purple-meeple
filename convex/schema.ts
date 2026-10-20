import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

export const collectionGame = v.object({
    id: v.string(),
    // fast-xml-parser coerces numeric titles (e.g. "1830") to numbers
    name: v.union(v.string(), v.number()),
    image: v.optional(v.string()),
    numplays: v.number()
});

export default defineSchema({
    collections: defineTable({
        username: v.string(),
        // Stored as an array rather than keyed by game id, since Convex objects
        // are limited to 1024 fields and some collections exceed that
        collection: v.array(collectionGame)
    }).index('by_username', ['username'])
});
