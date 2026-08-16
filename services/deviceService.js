const fs = require("fs");
const path = require("path");

const DEVICES_FILE = path.join(
    __dirname,
    "..",
    "config",
    "devices.json"
);

function ensureDevicesFile() {

    const folder = path.dirname(DEVICES_FILE);

    if (!fs.existsSync(folder)) {
        fs.mkdirSync(folder, {
            recursive: true
        });
    }

    if (!fs.existsSync(DEVICES_FILE)) {

        fs.writeFileSync(
            DEVICES_FILE,
            JSON.stringify({
                devices: []
            }, null, 2),
            "utf8"
        );

    }

}


function loadDevices() {

    ensureDevicesFile();

    try {

        const data = fs.readFileSync(
            DEVICES_FILE,
            "utf8"
        );

        const parsed = JSON.parse(data);

        if (!Array.isArray(parsed.devices)) {
            parsed.devices = [];
        }

        return parsed.devices;

    } catch (error) {

        console.error(
            "Device load error:",
            error
        );

        return [];

    }

}


function saveDevices(devices) {

    ensureDevicesFile();

    fs.writeFileSync(
        DEVICES_FILE,
        JSON.stringify({
            devices
        }, null, 2),
        "utf8"
    );

}


function getAllDevices() {

    return loadDevices();

}


function getDeviceById(id) {

    const devices = loadDevices();

    return devices.find(
        device =>
            String(device.id) === String(id)
    );

}


function addDevice(device) {

    const devices = loadDevices();

    const newDevice = {

        ...device,

        id: Date.now().toString(),

        createdAt:
            new Date().toISOString()

    };

    devices.push(newDevice);

    saveDevices(devices);

    return newDevice;

}


function deleteDevice(id) {

    const devices = loadDevices();

    const filtered =
        devices.filter(
            device =>
                String(device.id) !== String(id)
        );

    saveDevices(filtered);

    return true;

}


module.exports = {

    getAllDevices,

    getDeviceById,

    addDevice,

    deleteDevice,

    saveDevices

};
