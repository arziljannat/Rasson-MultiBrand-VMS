const express = require("express");

const router = express.Router();

const streamService =
    require("../services/streamService");

const deviceService =
    require("../services/deviceService");


// --------------------------------------------------
// GET ACTIVE STREAMS
// --------------------------------------------------

router.get("/", (req, res) => {

    try {

        const streams =
            streamService.getActiveStreams();

        res.json({
            success: true,
            streams
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


// --------------------------------------------------
// START STREAM
// --------------------------------------------------

router.post("/start", (req, res) => {

    try {

        const {
            deviceId,
            channel,
            stream
        } = req.body;


        if (!deviceId) {

            return res.status(400).json({
                success: false,
                error: "deviceId is required"
            });

        }


        const device =
            deviceService.getDeviceById(
                deviceId
            );


        if (!device) {

            return res.status(404).json({
                success: false,
                error: "Device not found"
            });

        }


        const streamId =
            `${deviceId}-${channel || 1}-${stream || "main"}`;


        const result =
            streamService.startStream(

                {
                    ...device,

                    channel:
                        channel || 1,

                    stream:
                        stream || "main"

                },

                streamId

            );


        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


// --------------------------------------------------
// STOP STREAM
// --------------------------------------------------

router.post("/stop", (req, res) => {

    try {

        const {
            streamId
        } = req.body;


        if (!streamId) {

            return res.status(400).json({
                success: false,
                error: "streamId is required"
            });

        }


        const result =
            streamService.stopStream(
                streamId
            );


        res.json(result);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


// --------------------------------------------------
// GET ONE STREAM
// --------------------------------------------------

router.get("/:streamId", (req, res) => {

    try {

        const stream =
            streamService.getStream(
                req.params.streamId
            );


        if (!stream) {

            return res.status(404).json({
                success: false,
                error: "Stream not found"
            });

        }


        res.json({

            success: true,

            stream

        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            error: error.message
        });

    }

});


module.exports = router;
