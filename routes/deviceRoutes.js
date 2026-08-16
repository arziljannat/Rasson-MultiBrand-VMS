
const express = require("express");

const router = express.Router();

const deviceService =
    require("../services/deviceService");

const tvtService =
    require("../services/tvtService");


// GET ALL DEVICES

router.get("/", (req, res) => {

    try {

        const devices =
            deviceService.getAllDevices();

        res.json(devices);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to load devices"
        });

    }

});


// GET DEVICE BY ID

router.get("/:id", (req, res) => {

    try {

        const device =
            deviceService.getDeviceById(
                req.params.id
            );

        if (!device) {

            return res.status(404).json({
                success: false,
                error: "Device not found"
            });

        }

        res.json(device);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to load device"
        });

    }

});


// ========================================
// TEST DEVICE BEFORE SAVING
// ========================================

router.post("/test", async (req, res) => {

    try {

        const device = req.body;

        if (!device) {

            return res.status(400).json({
                success: false,
                error: "Device data is required"
            });

        }


        if (!device.name) {

            return res.status(400).json({
                success: false,
                error: "Device name is required"
            });

        }


        const result =
            await tvtService.testDevice(
                device
            );


        res.json(result);

    } catch (error) {

        console.error(
            "TVT test error:",
            error
        );

        res.status(500).json({
            success: false,
            error:
                error.message ||
                "Failed to test device"
        });

    }

});


// ADD DEVICE

router.post("/", (req, res) => {

    try {

        const device =
            req.body;

        if (!device.name) {

            return res.status(400).json({
                success: false,
                error: "Device name is required"
            });

        }

        const newDevice =
            deviceService.addDevice(
                device
            );

        res.json({
            success: true,
            device: newDevice
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to add device"
        });

    }

});


// DELETE DEVICE

router.delete("/:id", (req, res) => {

    try {

        deviceService.deleteDevice(
            req.params.id
        );

        res.json({
            success: true
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: "Failed to delete device"
        });

    }

});


module.exports = router;
