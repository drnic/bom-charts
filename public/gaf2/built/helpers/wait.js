export function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
// until(() => window.waitForMe, () => console.log('got you'))
// from https://stackoverflow.com/a/48178043/36170
export function until(condition, callback, description) {
    if (!condition()) {
        if (description !== undefined) {
            console.log(`wait.until("${description}"`);
        }
        setTimeout(until.bind(null, condition, callback), 100); /* this checks the flag every 100 milliseconds*/
    }
    else {
        if (description !== undefined) {
            console.log(`wait.until("${description}" - done`);
        }
        callback();
    }
}
export function runEvery(ms, callback) {
    setInterval(callback, ms);
}
