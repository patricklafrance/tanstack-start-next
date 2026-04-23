// Critical/lazy split for a route — what goes where:
//
// | Where it runs                                                | Goes in              |
// | ------------------------------------------------------------ | -------------------- |
// | Before render: loader, beforeLoad, search validators, config | Critical (this file) |
// | At render or user interaction: component, mutations, view    | Lazy (.lazy.tsx)     |
//
// Why: TSR runs the loader in parallel with the lazy chunk fetch, and can preload the loader on Link hover.
// Putting loader deps in the lazy file collapses the parallelism — the critical bundle would have to pull
// the lazy chunk in just to resolve the loader.

import * as fs from "node:fs";
import { createServerFn } from "@tanstack/react-start";

const filePath = "count.txt";

async function readCount() {
    return parseInt(await fs.promises.readFile(filePath, "utf-8").catch(() => "0"));
}

export const getCount = createServerFn({
    method: "GET"
}).handler(() => {
    return readCount();
});
