let devices = [];

let currentLayout = 16;


// ========================================
// LOAD DEVICES
// ========================================

async function loadDevices() {

    try {

        const response =
            await fetch("/api/devices");

        devices =
            await response.json();

        renderDevices();

        renderCameras();

    } catch (error) {

        console.error(
            "Failed to load devices:",
            error
        );

    }

}


// ========================================
// RENDER DEVICE LIST
// ========================================

function renderDevices() {

    const list =
        document.getElementById(
            "deviceList"
        );

    list.innerHTML = "";

    document.getElementById(
        "deviceCount"
    ).textContent =
        `${devices.length} Devices`;


    devices.forEach(device => {

        const item =
            document.createElement("div");

        item.className =
            "device-item";


        item.innerHTML = `

            <div class="device-name">
                ${escapeHtml(device.name)}
            </div>

            <div class="device-brand">
                ${escapeHtml(device.brand)}
            </div>

        `;


        list.appendChild(item);

    });

}


// ========================================
// RENDER CAMERA GRID
// ========================================

function renderCameras() {

    const grid =
        document.getElementById(
            "cameraGrid"
        );

    grid.innerHTML = "";


    const total =
        Math.max(
            currentLayout,
            devices.length
        );


    for (
        let i = 0;
        i < total;
        i++
    ) {

        const camera =
            document.createElement("div");

        camera.className =
            "camera";


        camera.innerHTML = `

            <div class="no-signal">
                No Signal
            </div>

            <div class="camera-label">
                Camera ${i + 1}
            </div>

            <div class="camera-status">
                ●
            </div>

        `;


        grid.appendChild(camera);

    }

}


// ========================================
// LAYOUT
// ========================================

function setLayout(number) {

    currentLayout = number;

    const grid =
        document.getElementById(
            "cameraGrid"
        );


    let columns = 4;


    if (number === 4) {

        columns = 2;

    }

    else if (number === 9) {

        columns = 3;

    }

    else if (number === 16) {

        columns = 4;

    }


    grid.style.gridTemplateColumns =
        `repeat(${columns}, 1fr)`;


    renderCameras();

}


// ========================================
// ADD DEVICE MODAL
// ========================================

function openAddDevice() {

    document
        .getElementById(
            "addDeviceModal"
        )
        .classList
        .remove("hidden");

}


function closeAddDevice() {

    document
        .getElementById(
            "addDeviceModal"
        )
        .classList
        .add("hidden");

}


// ========================================
// TEST DEVICE CONNECTION
// ========================================

async function testDeviceConnection() {

    const device = {

        name:
            document
                .getElementById("deviceName")
                .value
                .trim(),

        brand:
            document
                .getElementById("deviceBrand")
                .value,

        type:
            document
                .getElementById("deviceType")
                .value,

        connectionType:
            document
                .getElementById("connectionType")
                .value,

        serial:
            document
                .getElementById("deviceSerial")
                .value
                .trim(),

        ip:
            document
                .getElementById("deviceIP")
                .value
                .trim(),

        port:
            document
                .getElementById("devicePort")
                .value
                .trim(),

        username:
            document
                .getElementById("deviceUsername")
                .value,

        password:
            document
                .getElementById("devicePassword")
                .value,

        channels:
            Number(
                document
                    .getElementById("deviceChannels")
                    .value
            )

    };


    if (!device.name) {

        alert("Device name required");

        return;

    }


    if (
        !device.serial &&
        !device.ip
    ) {

        alert(
            "Enter Serial Number / Device ID or IP Address"
        );

        return;

    }


    try {

        /*
         * For testing a device before saving,
         * we first save it temporarily through
         * the existing API.
         */

        const addResponse =
            await fetch(
                "/api/devices",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(device)
                }
            );


        const addResult =
            await addResponse.json();


        if (
            !addResult.success ||
            !addResult.device
        ) {

            alert(
                addResult.error ||
                "Unable to create test device"
            );

            return;

        }


        const deviceId =
            addResult.device.id;


        const testResponse =
            await fetch(
                `/api/devices/${deviceId}/test`,
                {
                    method: "POST"
                }
            );


        const result =
            await testResponse.json();


        if (result.status === "NAT2_READY") {

            alert(
                "NAT2.0 device configuration is valid.\n\n" +
                "Actual P2P video connection will be added in the next stage."
            );

            return;

        }


        if (result.success) {

            alert(
                result.message ||
                "Connection successful"
            );

            return;

        }


        alert(
            result.message ||
            result.error ||
            "Connection failed"
        );


    } catch (error) {

        console.error(
            "Test connection error:",
            error
        );

        alert(
            "Server connection failed"
        );

    }

}


// ========================================
// SAVE DEVICE
// ========================================

async function saveDevice() {

    const device = {

        name:
            document
                .getElementById(
                    "deviceName"
                )
                .value
                .trim(),

        brand:
            document
                .getElementById(
                    "deviceBrand"
                )
                .value,

        type:
            document
                .getElementById(
                    "deviceType"
                )
                .value,

        connectionType:
            document
                .getElementById(
                    "connectionType"
                )
                .value,

        serial:
            document
                .getElementById(
                    "deviceSerial"
                )
                .value
                .trim(),

        ip:
            document
                .getElementById(
                    "deviceIP"
                )
                .value
                .trim(),

        port:
            document
                .getElementById(
                    "devicePort"
                )
                .value
                .trim(),

        username:
            document
                .getElementById(
                    "deviceUsername"
                )
                .value,

        password:
            document
                .getElementById(
                    "devicePassword"
                )
                .value,

        channels:
            Number(
                document
                    .getElementById(
                        "deviceChannels"
                    )
                    .value
            )

    };


    if (!device.name) {

        alert(
            "Device name required"
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/devices",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(device)
                }
            );


        const result =
            await response.json();


        if (!result.success) {

            alert(
                result.error ||
                "Failed to add device"
            );

            return;

        }


        closeAddDevice();


        // Clear form

        document
            .getElementById(
                "deviceName"
            )
            .value = "";

        document
            .getElementById(
                "deviceSerial"
            )
            .value = "";

        document
            .getElementById(
                "deviceIP"
            )
            .value = "";

        document
            .getElementById(
                "devicePort"
            )
            .value = "";

        document
            .getElementById(
                "deviceUsername"
            )
            .value = "";

        document
            .getElementById(
                "devicePassword"
            )
            .value = "";

        document
            .getElementById(
                "deviceChannels"
            )
            .value = "";


        await loadDevices();


    } catch (error) {

        console.error(error);

        alert(
            "Server connection failed"
        );

    }

}


// ========================================
// HTML ESCAPE
// ========================================

function escapeHtml(value) {

    return String(value)

        .replaceAll(
            "&",
            "&amp;"
        )

        .replaceAll(
            "<",
            "&lt;"
        )

        .replaceAll(
            ">",
            "&gt;"
        )

        .replaceAll(
            '"',
            "&quot;"
        )

        .replaceAll(
            "'",
            "&#039;"
        );

}


// ========================================
// START
// ========================================

loadDevices();
