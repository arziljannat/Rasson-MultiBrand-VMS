const { spawn } = require("child_process");
const path = require("path");

const activeStreams = new Map();


// --------------------------------------------------
// BUILD RTSP URL
// --------------------------------------------------

function buildRtspUrl(device) {

    if (!device) {
        throw new Error("Device is required");
    }

    const username = encodeURIComponent(
        device.username || "admin"
    );

    const password = encodeURIComponent(
        device.password || ""
    );

    const host =
        device.ip ||
        device.host ||
        device.address;

    if (!host) {
        throw new Error("Device IP/Host is missing");
    }

    const port =
        device.rtspPort ||
        device.port ||
        554;

    const brand =
        String(device.brand || "")
            .toLowerCase();


    // ---------------------------------------------
    // HIKVISION
    // ---------------------------------------------

    if (
        brand === "hikvision" ||
        brand === "hivision"
    ) {

        const channel =
            device.channel || 1;

        const stream =
            device.stream === "sub"
                ? 102
                : 101;

        return (
            `rtsp://${username}:${password}` +
            `@${host}:${port}/Streaming/Channels/` +
            `${channel}${stream === 102 ? "02" : "01"}`
        );
    }


    // ---------------------------------------------
    // DAHUA
    // ---------------------------------------------

    if (brand === "dahua") {

        const channel =
            device.channel || 1;

        const subtype =
            device.stream === "sub"
                ? 1
                : 0;

        return (
            `rtsp://${username}:${password}` +
            `@${host}:${port}/cam/realmonitor` +
            `?channel=${channel}&subtype=${subtype}`
        );
    }


    // ---------------------------------------------
    // GENERIC RTSP
    // ---------------------------------------------

    if (device.rtspPath) {

        return (
            `rtsp://${username}:${password}` +
            `@${host}:${port}` +
            `${device.rtspPath}`
        );

    }


    // ---------------------------------------------
    // XM / TVT
    // ---------------------------------------------

    if (
        brand === "xm" ||
        brand === "xiaongmai" ||
        brand === "xiongmai" ||
        brand === "tvt"
    ) {

        const channel =
            device.channel || 1;

        return (
            `rtsp://${username}:${password}` +
            `@${host}:${port}` +
            `/cam/realmonitor` +
            `?channel=${channel}&subtype=0`
        );

    }


    throw new Error(
        `Unsupported brand: ${device.brand}`
    );

}


// --------------------------------------------------
// GET FFMPEG PATH
// --------------------------------------------------

function getFfmpegPath() {

    if (process.env.FFMPEG_PATH) {
        return process.env.FFMPEG_PATH;
    }

    if (process.platform === "win32") {

        return "ffmpeg.exe";

    }

    return "ffmpeg";

}


// --------------------------------------------------
// START STREAM
// --------------------------------------------------

function startStream(device, streamId) {

    if (!streamId) {
        throw new Error("Stream ID is required");
    }

    if (activeStreams.has(streamId)) {

        return {
            success: true,
            streamId,
            status: "already-running"
        };

    }


    const rtspUrl =
        buildRtspUrl(device);


    const outputDir =
        path.join(
            __dirname,
            "..",
            "public",
            "streams",
            String(streamId)
        );


    const outputFile =
        path.join(
            outputDir,
            "index.m3u8"
        );


    const fs =
        require("fs");

    fs.mkdirSync(
        outputDir,
        {
            recursive: true
        }
    );


    const ffmpeg =
        spawn(
            getFfmpegPath(),
            [
                "-rtsp_transport",
                "tcp",

                "-i",
                rtspUrl,

                "-c:v",
                "copy",

                "-an",

                "-f",
                "hls",

                "-hls_time",
                "2",

                "-hls_list_size",
                "3",

                "-hls_flags",
                "delete_segments",

                outputFile
            ],
            {
                windowsHide: true
            }
        );


    const streamInfo = {

        id: streamId,

        deviceId:
            device.id || null,

        process:
            ffmpeg,

        output:
            `/streams/${streamId}/index.m3u8`,

        startedAt:
            new Date().toISOString(),

        status:
            "starting"

    };


    activeStreams.set(
        streamId,
        streamInfo
    );


    ffmpeg.stderr.on(
        "data",
        data => {

            const message =
                data.toString();

            console.log(
                `[FFmpeg ${streamId}]`,
                message
            );

        }
    );


    ffmpeg.on(
        "spawn",
        () => {

            const stream =
                activeStreams.get(streamId);

            if (stream) {
                stream.status = "running";
            }

        }
    );


    ffmpeg.on(
        "close",
        code => {

            console.log(
                `FFmpeg stream ${streamId} stopped. Code: ${code}`
            );

            activeStreams.delete(
                streamId
            );

        }
    );


    ffmpeg.on(
        "error",
        error => {

            console.error(
                `FFmpeg error for ${streamId}:`,
                error.message
            );

            activeStreams.delete(
                streamId
            );

        }
    );


    return {

        success: true,

        streamId,

        status:
            "starting",

        url:
            `/streams/${streamId}/index.m3u8`

    };

}


// --------------------------------------------------
// STOP STREAM
// --------------------------------------------------

function stopStream(streamId) {

    const stream =
        activeStreams.get(
            streamId
        );


    if (!stream) {

        return {
            success: false,
            message: "Stream is not running"
        };

    }


    try {

        stream.process.kill(
            "SIGTERM"
        );

    } catch (error) {

        console.error(
            error
        );

    }


    activeStreams.delete(
        streamId
    );


    return {

        success: true,

        streamId,

        status:
            "stopped"

    };

}


// --------------------------------------------------
// GET ACTIVE STREAMS
// --------------------------------------------------

function getActiveStreams() {

    const result = [];

    for (
        const [id, stream]
        of activeStreams
    ) {

        result.push({

            id,

            deviceId:
                stream.deviceId,

            output:
                stream.output,

            startedAt:
                stream.startedAt,

            status:
                stream.status

        });

    }

    return result;

}


// --------------------------------------------------
// GET ONE STREAM
// --------------------------------------------------

function getStream(streamId) {

    const stream =
        activeStreams.get(
            streamId
        );


    if (!stream) {
        return null;
    }


    return {

        id:
            stream.id,

        deviceId:
            stream.deviceId,

        output:
            stream.output,

        startedAt:
            stream.startedAt,

        status:
            stream.status

    };

}


module.exports = {

    buildRtspUrl,

    startStream,

    stopStream,

    getActiveStreams,

    getStream

};
