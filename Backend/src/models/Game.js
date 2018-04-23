import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    size: String,
    gameToken: String,
    owner: String,
    opponent: String,
    gameDuration: Number,
    gameResult: String,
    state: String,
    turn: Boolean,
    field: [
        String, 
        String, 
        String
    ]
});

export default gameSchema;