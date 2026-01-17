require("dotenv").config();
const express = require("express");
const methodOverride = require("method-override");
const path = require("path");

const db = require("./config/db");
const webRoutes = require("./routes/web");
const apiCategories = require("./routes/api/categories")
const apiPatient = require("./routes/api/patient")

const app = express();

// Connection testing
(async () => {
    try {
        const conn = await db.getConnection();
        console.log(" Database OK dehh");
        conn.release();
    } catch (error) {
        console.error("Connection Invalid");
        console.error(error.message, error);
        process.exit(1);
        throw error
    }
})();

// Middleware
app.use(express.urlencoded({ extended: true}));
app.use(express.json());
app.use(methodOverride("_method"));
app.use("/src", express.static(path.join(__dirname, "src")));
app.use("/public", express.static(path.join(__dirname, "public")));
app.use("/vendor/d3", express.static(path.join(__dirname, "node_modules", "d3", "dist")));
app.use("/vendor/chartjs", express.static(path.join(__dirname, "node_modules", "chart.js", "dist")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", webRoutes);
app.use("/api/categories", apiCategories);
app.use("/api/patients", apiPatient);

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`http://localhost:${port}`);
})
