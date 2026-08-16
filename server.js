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
        name: "Rasson MultiBrand VMS",
        status: "online",
        time: new Date().toISOString()
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
    console.error("Server Error:", err);

    res.status(500).json({
        success: false,
        error: err.message || "Internal server error"
    });
});

// --------------------------------------------------
// VERCEL / LOCAL EXPORT
// --------------------------------------------------

module.exports = app;

// Start a normal HTTP server only when running locally.
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(
            `Rasson MultiBrand VMS running on port ${PORT}`
        );
        console.log(
            `http://localhost:${PORT}`
        );
    });
}
