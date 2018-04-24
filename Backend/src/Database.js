import mongoose from "mongoose";
import gameSchema from "./models/Game";
import { setCharAt, getCharAt } from "./helpers/StringHelper";
import { checkState } from "./helpers/StateChecker";
import { MyError } from "./Error";

export class Database {
    constructor() {
        this.mongoose = mongoose;
        this.mongoose.connect("mongodb://localhost:27017/tictactoedb");
        this.gameModel = this.mongoose.model("Game", gameSchema);
        this.timer = 0;
        this.lastTime = 0;
    }

    createGame(userName, gToken, callback) {
        this.timer = new Date().getTime();

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
                callback(new MyError("Can't save model in db", "200"), null);
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
                callback(new MyError("Can't find by token", "404"), null);
            } else {
                this.gameModel.update({state: "playing"}, (err, raw) => {
                    if (err) {
                        callback(err, null);
                    }
                });
                callback(null, doc);
            }
        });
    }

    getGamesList(callback) {
        this.gameModel.find({}, (err, game) =>  {
            if (err) {
                callback(new MyError("Can't find by token", "404"), null);
            } else {
                callback(null, game);
            }
        });
    }

    setGameCell(token, x, y, name, callback) {
        this.lastTime = new Date().getTime();
        this.gameModel.findOne({gameToken : token}, (err, doc) => {
            let ch = "";
            let myErr;
            
            if (doc === null) {
                myErr = new MyError("Can't find data", "100");
            } else if (name === doc.owner && doc.turn === true) {
                ch = "x";
            } else if (name === doc.opponent && doc.turn === false) {
                ch = "o";
            } else {
                myErr = new MyError("It's not your turn", "100");
            }
            
            if(myErr) {
                callback(myErr, null);
            } else if (doc.size < x || doc.size < y) {
                callback(new MyError("X or Y coordinates are more then field size", "101"), null);
            } else if (doc.state === "done") {
                callback(new MyError("Game already finished", "102"), null);
            } else if (doc.field[x - 1].charAt(y - 1) === "x" || doc.field[x - 1].charAt(y - 1) === "o"){
                callback(new MyError("Cell already marked", "103"), null);
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
                        callback(new MyError("Can't find by token", "404"), null);
                    }
                });

                let winner = checkState(field);
                if (winner !== "") {
                    this.gameModel.update({gameResult: winner}, (err, raw) => {
                        if (err) {
                            callback(new MyError("Can't find by token", "404"), null);
                        }
                    });
                    this.gameModel.update({state: "done"}, (err, raw) => {
                        if (err) {
                            callback(new MyError("Can't find by token", "404"), null);
                        }
                    });
                }

                this.gameModel.update({field: field}, (err, raw) => {
                    if (err) {
                        callback(new MyError("Can't find by token", "404"), null);
                    }
                });
                callback(null, doc);
            }
        });
    }

    getGameState(token, callback) {
        let end = new Date().getTime();
        
        this.gameModel.find({gameToken : token}, (err, game) =>  {
            if(end - this.lastTime > 300000) {
                this.gameModel.update({state: "done"}, (err, raw) => {
                    if (err) {
                        callback(new MyError("Can't find by token", "404"), null);
                    }
                });
            }

            if (err) {
                callback(err, null);
            } else {
                this.gameModel.update({gameDuration: end - this.timer}, (err, raw) => {
                    if (err) {
                        callback(new MyError("Can't find by token", "404"), null);
                    }
                });
                callback(null, game);
            }
        });
    }
}