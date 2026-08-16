const fs = require("fs");
const path = require("path");
const net = require("net");

const configPath = path.join(__dirname, "config.json");

if (!fs.existsSync(configPath)) {
    console.error("ERROR: config.json not found.");
    process.exit(1);
}

const config = JSON.parse(
    fs.readFileSync(configPath, "utf8")
);

console.log("");
console.log("======================================");
console.log(" RASSON MULTIBRAND VMS - DVR BRIDGE");
console.log("======================================");
console.log("");

console.log("Bridge:", config.bridgeName);
console.log("Central Server:", config.centralServer);
console.log("");

if (!config.devices || config.devices.length === 0) {
    console.log("No DVR devices configured.");
    process.exit(0);
}

function testPort(device) {

    return new Promise((resolve) => {

        console.log("--------------------------------------");
        console.log("Testing:", device.name);
        console.log("Brand:", device.brand);
        console.log("IP:", device.host);
        console.log("RTSP Port:", device.port);
        console.log("");

        const socket = new net.Socket();

        socket.setTimeout(5000);

        socket.connect(device.port, device.host, () => {

            console.log("SUCCESS: DVR RTSP port is reachable.");
            console.log("");

            socket.destroy();
            resolve(true);

        });

        socket.on("timeout", () => {

            console.log("FAILED: Connection timed out.");
            console.log("");

            socket.destroy();
            resolve(false);

        });

        socket.on("error", (error) => {

            console.log("FAILED:", error.message);
            console.log("");

            socket.destroy();
            resolve(false);

        });

    });
}

async function start() {

    console.log(
        "Configured DVRs:",
        config.devices.length
    );

    console.log("");

    for (const device of config.devices) {

        await testPort(device);

    }

    console.log("--------------------------------------");
    console.log("DVR network test completed.");
    console.log("");

}

start();
