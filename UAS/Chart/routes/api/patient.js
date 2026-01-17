const express = require("express");
const db = require("../../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, category_id, age, city, info, created_at FROM patients ORDER BY id DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load patients" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name, category_id, age, city, info, created_at FROM patients WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load patient" });
    }
});

router.post("/", async (req, res) => {
    try {
        const name = (req.body.name || "").trim();
        const city = (req.body.city || "").trim();
        const info = (req.body.info || "").trim();
        const categoryId = Number(req.body.category_id);
        const age = Number(req.body.age);

        if (!name) {
            return res.status(400).json({ error: "name is required" });
        }
        if (!Number.isInteger(categoryId)) {
            return res.status(400).json({ error: "category_id must be a number" });
        }
        if (!Number.isInteger(age)) {
            return res.status(400).json({ error: "age must be a number" });
        }
        if (!city) {
            return res.status(400).json({ error: "city is required" });
        }

        const [result] = await db.execute(
            "INSERT INTO patients (name, category_id, age, city, info) VALUES (?, ?, ?, ?, ?)",
            [name, categoryId, age, city, info || null]
        );
        const [rows] = await db.query(
            "SELECT id, name, category_id, age, city, info, created_at FROM patients WHERE id = ?",
            [result.insertId]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create patient" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const name = (req.body.name || "").trim();
        const city = (req.body.city || "").trim();
        const info = (req.body.info || "").trim();
        const categoryId = Number(req.body.category_id);
        const age = Number(req.body.age);

        if (!name) {
            return res.status(400).json({ error: "name is required" });
        }
        if (!Number.isInteger(categoryId)) {
            return res.status(400).json({ error: "category_id must be a number" });
        }
        if (!Number.isInteger(age)) {
            return res.status(400).json({ error: "age must be a number" });
        }
        if (!city) {
            return res.status(400).json({ error: "city is required" });
        }

        const [result] = await db.execute(
            "UPDATE patients SET name = ?, category_id = ?, age = ?, city = ?, info = ? WHERE id = ?",
            [name, categoryId, age, city, info || null, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
        const [rows] = await db.query(
            "SELECT id, name, category_id, age, city, info, created_at FROM patients WHERE id = ?",
            [req.params.id]
        );
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update patient" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute(
            "DELETE FROM patients WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Patient not found" });
        }
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete patient" });
    };
});

module.exports = router;
