// import { dev } from '$app/environment';
// import { handleErrorWithSentry, Replay } from "@sentry/sveltekit";
// import * as Sentry from '@sentry/sveltekit';

// if (dev) {
//     Sentry.init({});
// } else {
//     Sentry.init({
//         dsn: 'https://c980617967ff4243a1a9a32d6074bc71@o4505361360289792.ingest.sentry.io/4505361365204992',
//         tracesSampleRate: 1.0,

//         // This sets the sample rate to be 10%. You may want this to be 100% while
//         // in development and sample at a lower rate in production
//         replaysSessionSampleRate: 0.1,

//         // If the entire session is not sampled, use the below sample rate to sample
//         // sessions when an error occurs.
//         replaysOnErrorSampleRate: 1.0,

//         // If you don't want to use Session Replay, just remove the line below:
//         integrations: [new Replay()],
//     });
// }

// // If you have a custom error handler, pass it to `handleErrorWithSentry`
// export const handleError = handleErrorWithSentry();
