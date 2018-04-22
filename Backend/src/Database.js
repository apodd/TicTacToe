import mongoose from "mongoose";
import gameSchema from "./models/Game";
import { setCharAt, getCharAt } from "./helpers/StringHelper";
import { checkState } from "./helpers/StateChecker";

export class Database {
    constructor() {
        this.mongoose = mongoose;
        this.mongoose.connect("mongodb://localhost:27017/tictactoedb");
        this.gameModel = this.mongoose.model("Game", gameSchema);
    }

    createGame(userName, gToken, callback) {
        let model = new this.gameModel({ 
            size: "3",
            gameToken: gToken,
            owner: userName,
            opponent: "",
            gameDuration: "0",
            gameResult: "",
            state: "ready",
            turn: false,
            field: [
                "???", 
                "???", 
                "???"
            ]
        });

        model.save((err) => {
            if (err) {
                callback(err, null);
            } else {
                callback(null, model);
            }
        });
    }

    getGameData(token, callback) {
        this.gameModel.find({gameToken : token}, (err, game) =>  {
            if (err) {
                callback(err, null);
            } else {
                callback(null, game);
            }
        });
    }

    setOpponentName(token, opponentName) {
        this.gameModel.findOneAndUpdate({gameToken : token}, {$set:{opponent: opponentName}}, {new: true}, (err, doc) => {
            if(err) {
                console.log(err);
            } else {
                console.log(doc);
            }
        });
    }

    getGamesList(callback) {
        this.gameModel.find({}, (err, game) =>  {
            if (err) {
                callback(err, null);
            } else {
                callback(null, game);
            }
        });
    }

    setGameCell(token, x, y, name, callback) {
        this.gameModel.findOne({gameToken : token}, (err, doc) => {
            let ch = "";

            if (name === doc.owner) {
                ch = "x";
            } else if (name === doc.opponent) {
                ch = "o";
            } else {
                callback(err, null);
            }

            let winner = checkState(doc.field, x - 1, y - 1);
            
            if(err) {
                callback(err, null);
            } else if (doc.size < x || doc.size < y) {
                callback(err, null);
            } else if (doc.state === "done") {
                callback(err, null);
            } else if (getCharAt(doc.field[x - 1], y - 1) === "x" || getCharAt(doc.field[x - 1], y - 1) === "o"){
                callback(err, null);
            } else {
                let field = doc.field;
                field[x - 1] = setCharAt(field[x - 1], y - 1, ch);
                this.gameModel.update({field: field}, (err, raw) => {
                    if (err) {
                        callback(err, null);
                    }
                });
                callback(null, doc);
            }
        });
    }

    getGameState(token, callback) {
        this.gameModel.find({gameToken : token}, (err, game) =>  {
            if (err) {
                callback(err, null);
            } else {
                callback(null, game);
            }
        });
    }
}