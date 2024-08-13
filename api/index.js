import express from 'express';
// import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import camerafeedRouter from './routes/camerafeed.route.js';

dotenv.config();

// mongoose
//     .connect(process.env.MONGO_URL)
//     .then(() => {
//         console.log("Connected to Mongo DB!")
//     })
//     .catch((err) => {
//         console.log(err);
//     });

const app = express();

app.use(express.json());

app.use(cookieParser());

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server is running!");
});

app.use("/api/camerafeeds", camerafeedRouter);