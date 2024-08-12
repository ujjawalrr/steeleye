import express from "express";
// import Camerafeed from "../models/camerafeed.model.js";

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const camerafeeds = [];
        return res.status(200).json({ message: "Feed got successfully!", camerafeeds })
    } catch (error) {
        return res.status(500).json({ message: "Could not get feed!" })
    }
});

export default router;