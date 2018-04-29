import express from "express";
import { Database } from "../Database";
import { TokenGenerator } from "../TokenGenerator";
import { options } from "../models/Response";
import { checkState } from "../helpers/StateChecker";
import { setOptions } from "../helpers/StringHelper";

let router = express.Router();
const db = new Database();

router.post("/games/join", (req, res) => {
    res.header("Content-Type", 'application/json');

    let optionsJoin = Object.assign({}, options);
    
    if(TokenGenerator.decodeGameToken(req.body.gameToken) !== undefined) {
        let accessToken = TokenGenerator.createAccessToken(req.body.userName, req.body.gameToken);
        optionsJoin.accessToken = accessToken;

        db.getGameData(req.body.gameToken, (err, game) => {
            if (err) {
                setOptions(optionsJoin, "error", err.code, err.message);
            } else {
                setOptions(optionsJoin, "ok", "0", "ok");
            }
            game.forEach(element => {
                if (element.opponent === "" || req.body.userName !== "") {
                    db.setOpponentName(req.body.gameToken, req.body.userName, (err, doc) => {
                        if (err) {
                            setOptions(optionsJoin, "error", err.code, err.message);
                        } else {
                            db.setGameTime(req.body.gameToken, (err) => {
                                if (err) {
                                    setOptions(optionsJoin, "error", err.code, err.message);
                                } else {
                                    setOptions(optionsJoin, "ok", "0", "ok");
                                }
                            });
                        }
                    });
                    res.send(optionsJoin);
                } else {
                    setOptions(optionsNew, "error", "202", "Empty username");
                    res.send(optionsJoin);
                }
            });
        });
    } else {
        setOptions(optionsJoin, "error", "404", "Can't decode token");
        res.send(optionsJoin);
    }
    
});

router.post("/games/new", (req, res) => {
    res.header("Content-Type", 'application/json');

    let gameToken = TokenGenerator.createGameToken();
    let accessToken = TokenGenerator.createAccessToken(req.body.userName, gameToken);

    let optionsNew = Object.assign({}, options);
    if (req.body.userName === ""){
        setOptions(optionsNew, "error", "202", "Empty username");
        res.send(optionsNew);
    } else {
        optionsNew.accessToken = accessToken;
        optionsNew.gameToken = gameToken;
        db.createGame(req.body.userName, gameToken, (err) => {
            if (err) {
                setOptions(optionsNew, "error", err.code, err.message);
            } else {
                setOptions(optionsNew, "ok", "0", "ok");
            }
            res.send(optionsNew);
        });
    }
});

router.get("/games/list", (req, res) => {
    res.header("Content-Type", 'application/json');

    let optionsList = Object.assign({}, options);
    optionsList.games = [];

    db.getGamesList((err, game) => {
        if (err) {
            setOptions(optionsList, "error", err.code, err.message);
        } else {
            setOptions(optionsList, "ok", "0", "ok");
        }

        game.forEach(element => {
            optionsList.games.push(element);
        });
        
        res.send(optionsList);
    });
});

router.post("/games/do_step", (req, res) => {
    res.header("Content-Type", 'application/json');
    
    let optionsStep = Object.assign({}, options);
    let data = TokenGenerator.decodeGameToken(req.headers.accesstoken);

    if (data !== undefined) {
        db.setGameCell(data.gameToken, req.body.row, req.body.col, data.userName, (err, doc) => {
            if (err) {
                setOptions(optionsStep, "error", err.code, err.message);
            } else if (data.username === "") {
                setOptions(optionsStep, "error", "404", "Bad username");
            } else {
                setOptions(optionsStep, "ok", "0", "ok");
            }
            res.send(optionsStep);
        });
    } else {
        setOptions(optionsStep, "error", "404", "Can't decode token");
        res.send(optionsStep);
    }
});

router.get("/games/state", (req, res) => {
    res.header("Content-Type", 'application/json');
        
    let optionsState = Object.assign({}, options);
    let data = TokenGenerator.decodeGameToken(req.headers.accesstoken);

    if(data !== undefined) {
        db.getTime(data.gameToken, (err, time) => {
            if (err) {
                setOptions(optionsState, "error", err.code, err.message);
            } else {
                if(time !== null) {
                    db.getGameState(time.lastActivityTime, time.startTime, data.gameToken, (err, game) => {
                        if (err) {
                            setOptions(optionsState, "error", err.code, err.message);
                        } else {
                            setOptions(optionsState, "ok", "0", "ok");
                        }
            
                        game.forEach(element => {
                            optionsState.gameDuration = element.gameDuration;
                            optionsState.field = element.field;
                            if (element.winner !== "") {
                                optionsState.winner = element.winner;
                            }
                            res.send(optionsState);
                        });
                    });
                } else {
                    setOptions(optionsState, "error", "404", "Can't decode token");
                    res.send(optionsState);
                }
            }
        });
    } else {
        setOptions(optionsState, "error", "404", "Can't decode token");
        res.send(optionsState);
    }
    
});

export default router;