import mongoose from "mongoose";
import gameSchema from "./models/Game";
import { setCharAt, getCharAt } from "./helpers/StringHelper";
import { checkState } from "./helpers/StateChecker";
import { MyError } from "./Error";
import timeSchema from "./models/Time";

export class Database {
    constructor() {
        this.mongoose = mongoose;
        this.mongoose.connect("mongodb://localhost:27017/tictactoedb");
        this.gameModel = this.mongoose.model("Game", gameSchema);
        this.timeModel = this.mongoose.model("Time", timeSchema);
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
            ],
            startTime: Date.now()
        });

        model.save((err) => {
            if (err) {
                callback(new MyError("Can't save model in db", "200"), null);
            } else {
                callback(null, model);
            }
        });
    }

    setGameTime(gToken, callback) {
        let time = new this.timeModel({
            gameToken: gToken,
            startTime: Date.now(),
            lastActivityTime: Date.now(),
        });

        time.save((err) => {
            if (err) {
                callback(new MyError("Can't save model in db", "200"), null);
            } else {
                callback(null, time);
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
        this.timeModel.findOne({gameToken: token}, (err, time) => {
            if (err) {
                callback(new MyError("Can't find by token", "404"), null);
            } else {
                this.timeModel.update({lastActivityTime: Date.now()}, (err, raw) => {
                    if (err) {
                        callback(new MyError("Can't find by token", "404"), null);
                    } else {
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
                
                                this.gameModel.update({gameDuration: Date.now() - time.startTime}, (err, raw) => {
                                    if (err) {
                                        callback(new MyError("Can't find by token", "404"), null);
                                    }
                                });
                
                                callback(null, doc);
                            }
                        });
                    }
                });
            }
        });
        
    }

    getGameState(activityTime, startTime, token, callback) {
        let end = Date.now();
        
        this.gameModel.find({gameToken : token}, (err, game) =>  {
            if(end - activityTime > 300000) {
                this.gameModel.update({state: "done"}, (err, raw) => {
                    if (err) {
                        callback(new MyError("Can't find by token", "404"), null);
                    }
                });
            } 

            if (err) {
                callback(new MyError("Can't find by token", "404"), null);
            } else {
                this.gameModel.update({gameDuration: end - startTime}, (err, raw) => {
                    if (err) {
                        callback(new MyError("Can't find by token", "404"), null);
                    }
                });
                callback(null, game);
            }
        });
    }

    /*changeTime(token, callback) {
        this.timeModel.findOne({gameToken: token}, (err, time) => {
            if (err) {
                callback(new MyError("Can't find by token", "404"), null);
            }
            this.timeModel.update({lastActivityTime: Date.now()}, (err, raw) => {
                if (err) {
                    callback(new MyError("Can't find by token", "404"), null);
                } else {
                    callback(null, raw);
                }
            });

        });
    }*/
    
    
    getTime(token, callback) {
        this.timeModel.findOne({gameToken: token}, (err, time) => {
            if (err) {
                callback(new MyError("Can't find by token", "404"), null);
            } else {
                callback(null, time);
            }
        })
    };
    
}