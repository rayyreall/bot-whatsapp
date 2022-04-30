"use strict";
(async () => {
    process.on("data", (data) => {
        console.log({ data });
    });
    process.on("message", (m) => {
        console.log({ m });
    });
    setInterval(() => {
        process?.send(Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100);
    }, 1000);
})();
