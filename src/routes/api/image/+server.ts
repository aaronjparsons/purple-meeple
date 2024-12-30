import { error } from '@sveltejs/kit'
import type { RequestHandler } from './$types'
import { getYearInReview } from '$lib/yearInReview'

// Svelte Component To Image
import { image_from_component, type RenderOptions } from 'svelte-component-to-image'

// Normal .svelte component
import YearInReview from '$lib/components/YearInReview.svelte'

export const GET: RequestHandler = (async ({url}) => {
    const username = url.searchParams.get('username').toLowerCase();
    const year = url.searchParams.get('year')

    try {
        const payload = await getYearInReview({ username, year });
        const options: RenderOptions = {
            width: 1200,
            height: 600,
            props: {
                username: username,
                stats: payload,
                year: year,
            },
            fonts: [
                {
                    name: 'Delicious Handrawn',
                    url: `${url.origin}/DeliciousHandrawn-Regular.ttf`,
                    weight: 400,
                    style: 'normal'
                }
            ],
            debug: false // you can omit this or set it to true to see logs of data, it can help for debug edge cases
        }

        // pass the component and options to the package
        const image    = await image_from_component(YearInReview, options)
        const response = new Response(image)
        // if(!dev){
        //     // caching on dev will make it hard to see iterations
        //     response.headers.append('Content-Type', 'image/png')
        //     response.headers.append('Cache-Control', 's-maxage=604800, stale-while-revalidate=604800')
        // }
        return response
    } catch (e) {
        console.error(e)
        throw error(500, 'Error trying to generate image from component.',)
    }
}) satisfies RequestHandler