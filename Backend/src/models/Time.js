import mongoose from "mongoose";

const timeSchema = new mongoose.Schema({
    gameToken: String,
    startTime: Number,
    lastActivityTime: Number
});

export default timeSchema;