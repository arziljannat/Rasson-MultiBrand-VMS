const fs = require("fs");
const path = require("path");
const { spawn } = require("child_process");

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
console.log(" RASSON MULTIBRAND VMS - BRIDGE");
console.log("======================================");
console.log("");

console.log("Bridge Name:", config.bridgeName);
console.log("Central Server:", config.centralServer);
console.log("");

if (!config.devices || config.devices.length === 0) {
    console.log("No DVR devices configured.");
    process.exit(0);
}

console.log("Configured DVRs:", config.devices.length);
console.log("");

config.devices.forEach((device, index) => {

    console.log(
        `${index + 1}. ${device.name} | ${device.brand} | ${device.host}:${device.port}`
    );

});

console.log("");
console.log("Bridge configuration loaded successfully.");
console.log("");


// --------------------------------------------------
// DVR RTSP URL
// --------------------------------------------------

function createRtspUrl(device) {

    return `rtsp://${encodeURIComponent(device.username)}:${encodeURIComponent(device.password)}@${device.host}:${device.port}/Streaming/Channels/101`;
}


// --------------------------------------------------
// Test DVR connection
// --------------------------------------------------

function testDevice(device) {

    console.log("--------------------------------------");
    console.log("Testing DVR:");
    console.log(device.name);
    console.log("IP:", device.host);
    console.log("Port:", device.port);
    console.log("");

    const rtspUrl = createRtspUrl(device);

    console.log("RTSP URL:");
    console.log(
        `rtsp://${device.username}:********@${device.host}:${device.port}/Streaming/Channels/101`
    );

    console.log("");

    return rtspUrl;
}


// --------------------------------------------------
// Start
// --------------------------------------------------

for (const device of config.devices) {

    testDevice(device);

}

console.log("--------------------------------------");
console.log("Bridge is ready.");
console.log("");
console.log("Next stage:");
console.log("1. Test DVR RTSP");
console.log("2. Start FFmpeg");
console.log("3. Generate HLS");
console.log("4. Connect stream to central VMS");
console.log("");
