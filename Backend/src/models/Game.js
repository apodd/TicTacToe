import mongoose from "mongoose";

const gameSchema = new mongoose.Schema({
    size: { type: String, required: true},
    gameToken: String,
    owner: { type: String, required: true},
    opponent: String,
    gameDuration: String,
    gameResult: String,
    state: String,
    turn: Boolean,
    field: [
        String, 
        String, 
        String
    ]
});

class GameClass {
    get getToken() {
        return this.gameToken;
        //return "${this.gameToken}";
    }
}

gameSchema.loadClass(GameClass);

export default gameSchema;