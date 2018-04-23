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
                err = "can't save model in db";
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

    setOpponentName(token, opponentName, callback) {
        this.gameModel.findOneAndUpdate({gameToken : token}, {$set:{opponent: opponentName}}, {new: true}, (err, doc) => {
            if(err) {
                err = "Can't find by token";
                callback(err, null);
            } else {
                callback(null, doc);
            }
        });
    }

    getGamesList(callback) {
        this.gameModel.find({}, (err, game) =>  {
            if (err) {
                err = "Can't get game list";
                callback(err, null);
            } else {
                callback(null, game);
            }
        });
    }

    setGameCell(token, x, y, name, callback) {
        this.gameModel.findOne({gameToken : token}, (err, doc) => {
            let ch = "";
            
            if (doc === null) {
                err = "Can't find data";
            } else if (name === doc.owner && doc.turn === true) {
                ch = "x";
            } else if (name === doc.opponent && doc.turn === false) {
                ch = "o";
            } else {
                err = "It's not your turn";
            }
            
            if(err) {
                callback(err, null);
            } else if (doc.size < x || doc.size < y) {
                err = "X or Y coordinates are more then field size";
                callback(err, null);
            } else if (doc.state === "done") {
                err = "Game already finished";
                callback(err, null);
            } else if (doc.field[x - 1].charAt(y - 1) === "x" || doc.field[x - 1].charAt(y - 1) === "o"){
                err = "Cell already marked";
                callback(err, null);
            } else {
                let turn;
                let field = doc.field;
                field[x - 1] = setCharAt(field[x - 1], y - 1, ch);

                if (ch === "x") {
                    turn = false;
                } else {
                    turn = true;
                }

                this.gameModel.update({turn: turn}, (err, raw) => {
                    if (err) {
                        callback(err, null);
                    }
                });

                let winner = checkState(field);
                if (winner !== "") {
                    this.gameModel.update({gameResult: winner}, (err, raw) => {
                        if (err) {
                            callback(err, null);
                        }
                    });
                    this.gameModel.update({state: "done"}, (err, raw) => {
                        if (err) {
                            callback(err, null);
                        }
                    });
                }

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