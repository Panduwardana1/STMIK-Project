const express = require("express");
const db = require("../../config/db");

const router = express.Router();

router.get("/", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name FROM categories ORDER BY id DESC"
        );
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load categories" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const [rows] = await db.query(
            "SELECT id, name FROM categories WHERE id = ?",
            [req.params.id]
        );
        if (rows.length === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to load category" });
    }
});

router.post("/", async (req, res) => {
    try {
        const name = (req.body.name || "").trim();
        if (!name) {
            return res.status(400).json({ error: "name is required" });
        }

        const [result] = await db.execute(
            "INSERT INTO categories (name) VALUES (?)",
            [name]
        );
        const [rows] = await db.query(
            "SELECT id, name FROM categories WHERE id = ?",
            [result.insertId]
        );
        res.status(201).json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to create category" });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const name = (req.body.name || "").trim();
        if (!name) {
            return res.status(400).json({ error: "name is required" });
        }

        const [result] = await db.execute(
            "UPDATE categories SET name = ? WHERE id = ?",
            [name, req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.json({ id: Number(req.params.id), name });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update category" });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const [result] = await db.execute(
            "DELETE FROM categories WHERE id = ?",
            [req.params.id]
        );
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Category not found" });
        }
        res.status(204).end();
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to delete category" });
    }
});

module.exports = router;
