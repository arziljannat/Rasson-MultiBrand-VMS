const express = require("express");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = 5000;

const DEVICES_FILE = path.join(
    __dirname,
    "config",
    "devices.json"
);

// Middleware
app.use(express.json());

app.use(express.static(
    path.join(__dirname, "public")
));


// ========================================
// LOAD DEVICES
// ========================================

function loadDevices() {

    try {

        const data = fs.readFileSync(
            DEVICES_FILE,
            "utf8"
        );

        return JSON.parse(data);

    } catch (error) {

        console.error(
            "Could not load devices:",
            error
        );

        return {
            devices: []
        };
    }
}


// ========================================
// SAVE DEVICES
// ========================================

function saveDevices(data) {

    fs.writeFileSync(
        DEVICES_FILE,
        JSON.stringify(data, null, 2),
        "utf8"
    );
}


// ========================================
// API - GET DEVICES
// ========================================

app.get("/api/devices", (req, res) => {

    const data = loadDevices();

    res.json(data.devices);

});


// ========================================
// API - ADD DEVICE
// ========================================

app.post("/api/devices", (req, res) => {

    const device = req.body;

    if (!device.name) {

        return res.status(400).json({
            error: "Device name is required"
        });

    }

    const data = loadDevices();

    device.id =
        Date.now().toString();

    data.devices.push(device);

    saveDevices(data);

    res.json({
        success: true,
        device
    });

});


// ========================================
// API - DELETE DEVICE
// ========================================

app.delete("/api/devices/:id", (req, res) => {

    const data = loadDevices();

    data.devices =
        data.devices.filter(
            device =>
                device.id !== req.params.id
        );

    saveDevices(data);

    res.json({
        success: true
    });

});


// ========================================
// ROOT
// ========================================

app.get("/", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// ========================================
// START SERVER
// ========================================

app.listen(PORT, () => {

    console.log("");
    console.log("================================");
    console.log(" RASSON MULTI-BRAND VMS");
    console.log("================================");
    console.log("");
    console.log(
        `Server running: http://localhost:${PORT}`
    );
    console.log("");

});
