const net = require("net");

/**
 * TVT / Rasson device service
 *
 * Current purpose:
 * - Validate TVT device configuration
 * - Test direct network connectivity when IP/host is available
 * - Keep NAT2.0 devices ready for the future TVT SDK/P2P connector
 *
 * IMPORTANT:
 * Serial-number NAT2.0 devices cannot be tested by simply
 * opening TCP port 6036 from the public Internet.
 */

function normalizeDevice(device = {}) {
    return {
        id: device.id || null,
        name: device.name || "TVT Device",
        brand: device.brand || "TVT",
        serial: device.serial || device.serialNumber || "",
        host: device.host || device.ip || "",
        port: Number(device.port || 6036),
        username: device.username || "admin",
        password: device.password ?? "",
        connectionType: device.connectionType || "NAT2.0"
    };
}


function validateDevice(device) {
    const d = normalizeDevice(device);

    const errors = [];

    if (!d.serial && !d.host) {
        errors.push("Serial number or IP/host is required");
    }

    if (!d.username) {
        errors.push("Username is required");
    }

    if (!Number.isInteger(d.port) || d.port < 1 || d.port > 65535) {
        errors.push("Invalid port");
    }

    return {
        valid: errors.length === 0,
        errors,
        device: d
    };
}


/**
 * Direct TCP test.
 *
 * This is ONLY useful when the DVR has a reachable IP/domain.
 * It is NOT the NAT2.0 P2P connection itself.
 */
function testDirectConnection(host, port = 6036, timeout = 5000) {
    return new Promise((resolve) => {

        if (!host) {
            return resolve({
                success: false,
                status: "NO_HOST",
                message: "No direct IP/domain was supplied"
            });
        }

        const socket = new net.Socket();

        let finished = false;

        const finish = (result) => {
            if (finished) return;

            finished = true;

            try {
                socket.destroy();
            } catch (_) {}

            resolve(result);
        };

        socket.setTimeout(timeout);

        socket.once("connect", () => {
            finish({
                success: true,
                status: "ONLINE",
                message: `TCP port ${port} is reachable`,
                host,
                port
            });
        });

        socket.once("timeout", () => {
            finish({
                success: false,
                status: "TIMEOUT",
                message: `Connection timeout to ${host}:${port}`,
                host,
                port
            });
        });

        socket.once("error", (error) => {
            finish({
                success: false,
                status: "OFFLINE",
                message: error.message,
                host,
                port
            });
        });

        socket.connect(port, host);
    });
}


/**
 * Main TVT device test.
 */
async function testDevice(device) {

    const validation = validateDevice(device);

    if (!validation.valid) {
        return {
            success: false,
            status: "INVALID",
            errors: validation.errors
        };
    }

    const d = validation.device;

    // NAT2.0 device
    if (
        String(d.connectionType).toUpperCase() === "NAT2.0" ||
        String(d.connectionType).toUpperCase() === "P2P"
    ) {
        return {
            success: true,
            status: "NAT2_READY",
            message:
                "TVT NAT2.0 device configuration is valid. " +
                "P2P/SDK transport is required for remote video.",
            device: {
                name: d.name,
                brand: d.brand,
                serial: d.serial,
                username: d.username,
                connectionType: d.connectionType
            }
        };
    }

    // Direct IP/domain device
    if (d.host) {
        return await testDirectConnection(
            d.host,
            d.port
        );
    }

    return {
        success: false,
        status: "NO_CONNECTION_METHOD",
        message: "No supported connection method was supplied"
    };
}


module.exports = {
    normalizeDevice,
    validateDevice,
    testDirectConnection,
    testDevice
};
