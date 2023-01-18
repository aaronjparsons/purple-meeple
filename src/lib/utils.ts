export const getValue = (object: { '@_value': string }) => {
    return object['@_value'];
}

export const sleep = (ms: number) => {
    return new Promise(resolveFunc => setTimeout(resolveFunc, ms));
}