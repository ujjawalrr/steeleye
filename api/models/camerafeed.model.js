import mongoose from "mongoose";

const camerafeedSchema = new mongoose.Schema({
    camerId: {
        type: String,
        required: true,
    },
    ladle: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const Camerafeed = mongoose.model('Camerafeed', camerafeedSchema);

export default Camerafeed;