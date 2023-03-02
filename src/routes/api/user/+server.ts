import { error } from '@sveltejs/kit';
import { XMLParser } from 'fast-xml-parser';

export const GET = async ({ url }) => {
    const username = url.searchParams.get('username');
    const userUrl = `https://boardgamegeek.com/xmlapi2/user?name=${username}`;

    const response = await fetch(userUrl);

    if (response.ok) {
        if (response.status === 200) {
            const text = await response.text();
            const parser = new XMLParser({ ignoreAttributes: false });
            const parsed = parser.parse(text);

            // Invalid username error
            if (parsed.user['@_id'].length === 0) {
                throw error(404);
            }

            // No error, user exists
            return new Response(JSON.stringify({ success: true }));
        }
    } else {
        throw error(response.status);
    }
}