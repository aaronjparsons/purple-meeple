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

            if (parsed?.html?.head?.title.includes('404')) {
                // Handle 404 html response
                error(404);
            }

            if (parsed?.user['@_id'].length === 0) {
                // Handle no username (may be a deprecated response)
                error(404);
            }

            // No error, user exists
            return new Response(JSON.stringify({ success: true }));
        }
    } else {
        error(response.status);
    }
}