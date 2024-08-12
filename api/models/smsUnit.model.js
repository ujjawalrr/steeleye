import mongoose from "mongoose";

const smsUnitSchema = new mongoose.Schema({
    unitId: {
        type: String,
        required: true,
        unique: true
    },
}, { timestamps: true });

const SmsUnit = mongoose.model('SmsUnit', smsUnitSchema);

export default SmsUnit;