import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'

// BGG's image CDN doesn't send CORS headers, so browser code (e.g. html-to-image
// when exporting Year in Review as a PNG) can't fetch those images cross-origin.
// This re-serves them same-origin so they can be embedded.
const ALLOWED_HOSTS = ['cf.geekdo-images.com', 'geekdo-images.com']

export const GET: RequestHandler = (async ({ url, fetch }) => {
    const imageUrl = url.searchParams.get('url');

    if (!imageUrl) {
        error(400, 'Missing url parameter');
    }

    let parsed: URL;
    try {
        parsed = new URL(imageUrl);
    } catch {
        error(400, 'Invalid url parameter');
    }

    if (!ALLOWED_HOSTS.includes(parsed.hostname)) {
        error(400, 'Host not allowed');
    }

    const response = await fetch(parsed.toString());

    if (!response.ok || !response.body) {
        error(502, 'Failed to fetch image');
    }

    return new Response(response.body, {
        headers: {
            'Content-Type': response.headers.get('Content-Type') ?? 'image/jpeg',
            'Cache-Control': 'public, max-age=604800, immutable'
        }
    });
}) satisfies RequestHandler
