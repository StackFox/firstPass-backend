import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import Users from "./models/Users.js";
import dotenv from "dotenv";
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB connected"))
    .catch((err) => console.error("MongoDB connection error:", err));

const app = express();

const corsOptions = {
    origin: process.env.REACT_URI,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

let lastSyncTime = new Date(); // Initialize the last sync time

// backend status
app.get("/api/status", async (req, res) => {
    try {
        const now = new Date();
        const timeDifference = Math.floor((now - lastSyncTime) / 60000); // Difference in minutes

        const total = await Users.countDocuments();
        res.json({
            status: "🟢Connected",
            isConnected: true,
            lastSync: `${timeDifference} minute(s) ago`,
            total
        });
        lastSyncTime = now;
    } catch (err) {
        res.json({
            error: err.message,
            status: "🔴Disconnected",
            isConnected: false,
        });
    }
})

// add passwords
app.post("/api/passwords", async (req, res) => {
    try {
        const user = await Users.create(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        res.status(400).json({ error: error.message });
    }
});

// fetch passwords
app.get("/api/passwords", async (req, res) => {
    try {
        const users = await Users.find();
        res.json(users);
    } catch (err) {
        res.status(400).json({ error: "Unable to get passwords" });
    }
});

// edit a password
app.put("/api/passwords/:id", async (req, res) => {
    try {
        const { site, username, password } = req.body;

        const updated = await Users.findByIdAndUpdate(
            req.params.id,
            { site, username, password },
            { new: true }
        );
        if (!updated) {
            return res.status(404).json({ message: "Users not found" });
        }
        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

// delete a password
app.delete("/api/passwords/:id", async (req, res) => {
    try {
        const deleted = await Users.findByIdAndDelete(req.params.id);
        if (!deleted) return res.status(404).json({ error: "Users not found" });
        res.json({ message: "Deleted", id: req.params.id });
    } catch (err) {
        res.status(400).json({ error: "Unable to delete user" });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`App is listening on port ${PORT}`);
});