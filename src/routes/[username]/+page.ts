import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';

export async function load({ params, fetch }) {
    const url = `https://boardgamegeek.com/xmlapi2/collection?username=${params.username}&want=0&wishlist=0&stats=1`;
    const response = await fetch(url);
    if (response.ok) {
        const text = await response.text();
        const parser = new XMLParser({ ignoreAttributes: false });
        const parsed = parser.parse(text);

        return {
            username: params.username,
            collection: parsed.items.item
        };
    } else {
        throw error(404, 'Not found');
    }

}