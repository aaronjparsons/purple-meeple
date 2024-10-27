// import { dev } from '$app/environment';
// import { sequence } from "@sveltejs/kit/hooks";
// import { handleErrorWithSentry, sentryHandle } from "@sentry/sveltekit";
// import * as Sentry from '@sentry/sveltekit';

// if (dev) {
//     Sentry.init({});
// } else {
//     Sentry.init({
//         dsn: 'https://c980617967ff4243a1a9a32d6074bc71@o4505361360289792.ingest.sentry.io/4505361365204992',
//         tracesSampleRate: 1.0,
//     });
// }

// // If you have custom handlers, make sure to place them after `sentryHandle()` in the `sequence` function.
// export const handle = sequence(sentryHandle());

// // If you have a custom error handler, pass it to `handleErrorWithSentry`
// export const handleError = handleErrorWithSentry();
