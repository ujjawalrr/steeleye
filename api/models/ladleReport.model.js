import mongoose from "mongoose";

const ladleReportSchema = new mongoose.Schema({
    camerId: {
        type: String,
        required: true,
    },
    ladle: {
        type: Number,
        required: true
    },
}, { timestamps: true });

const LadleReport = mongoose.model('LadleReport', ladleReportSchema);

export default LadleReport;