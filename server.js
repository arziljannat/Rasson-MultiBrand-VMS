const express = require("express");
const path = require("path");

const deviceRoutes = require("./routes/deviceRoutes");
const streamRoutes = require("./routes/streamRoutes");

const app = express();

const PORT = process.env.PORT || 3000;


// --------------------------------------------------
// MIDDLEWARE
// --------------------------------------------------

app.use(express.json());

app.use(express.urlencoded({
    extended: true
}));


// --------------------------------------------------
// STATIC FRONTEND
// --------------------------------------------------

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);


// --------------------------------------------------
// API ROUTES
// --------------------------------------------------

app.use(
    "/api/devices",
    deviceRoutes
);

app.use(
    "/api/streams",
    streamRoutes
);


// --------------------------------------------------
// HEALTH CHECK
// --------------------------------------------------

app.get("/api/health", (req, res) => {

    res.json({

        success: true,

        name:
            "Rasson MultiBrand VMS",

        status:
            "online",

        time:
            new Date().toISOString()

    });

});


// --------------------------------------------------
// FRONTEND FALLBACK
// --------------------------------------------------

app.get("*", (req, res) => {

    res.sendFile(
        path.join(
            __dirname,
            "public",
            "index.html"
        )
    );

});


// --------------------------------------------------
// ERROR HANDLER
// --------------------------------------------------

app.use((err, req, res, next) => {

    console.error(
        "Server Error:",
        err
    );

    res.status(500).json({

        success: false,

        error:
            "Internal server error"

    });

});


// --------------------------------------------------
// START SERVER
// --------------------------------------------------

app.listen(
    PORT,
    () => {

        console.log(
            `Rasson MultiBrand VMS running on port ${PORT}`
        );

        console.log(
            `http://localhost:${PORT}`
        );

    }
);
