import express from "express";
import { Database } from "../Database";
import { TokenGenerator } from "../TokenGenerator";
import { options } from "../models/Response";
import { checkState } from "../helpers/StateChecker";

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
                optionsJoin.status = "error";
                optionsJoin.code = "404";
            } else {
                optionsJoin.status = "ok";
                optionsJoin.code = "0";
            }
            game.forEach(element => {
                if (element.opponent === "" || req.body.userName !== "") {
                    db.setOpponentName(req.body.gameToken, req.body.userName, (err, doc) => {
                        if (err) {
                            optionsJoin.message = err;
                        }
                    });
                }
                res.send(optionsJoin);
            });
        });
    } else {
        optionsJoin.status = "error";
        optionsJoin.code = "404";
        optionsJoin.message = "Can't decode token";
        res.send(optionsJoin);
    }
    
});

router.post("/games/new", (req, res) => {
    res.header("Content-Type", 'application/json');

    let gameToken = TokenGenerator.createGameToken();
    let accessToken = TokenGenerator.createAccessToken(req.body.userName, gameToken);

    let optionsNew = Object.assign({}, options);
    optionsNew.accessToken = accessToken;
    optionsNew.gameToken = gameToken;

    db.createGame(req.body.userName, gameToken, (err) => {
        if (err) {
            optionsNew.status = "error";
            optionsNew.code = "100";
            optionsNew.message = err;
        } else {
            optionsNew.status = "ok";
            optionsNew.code = "0";
        }

        res.send(optionsNew);
    });
});

router.get("/games/list", (req, res) => {
    res.header("Content-Type", 'application/json');

    let optionsList = Object.assign({}, options);
    optionsList.games = [];

    db.getGamesList((err, game) => {
        if (err) {
            optionsList.status = "error";
            optionsList.code = "404";
            optionsList.message = err;
        } else {
            optionsList.status = "ok";
            optionsList.code = "0";
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

    db.setGameCell(data.gameToken, req.body.row, req.body.col, data.userName, (err, doc) => {
        if (err) {
            console.log(err);
        } else if(data.username !== "") {
            optionsStep.status = "error";
            optionsStep.code = "404";
        }
        res.send(optionsStep);
    });

});

router.get("/games/state", (req, res) => {
    res.header("Content-Type", 'application/json');
        
    let optionsState = Object.assign({}, options);
    let data = TokenGenerator.decodeGameToken(req.headers.accesstoken);

    if(data !== undefined) {
        db.getGameData(data.gameToken, (err, game) => {
            if (err) {
                optionsState.status = "error";
                optionsState.code = "404";
            } else {
                optionsState.status = "ok";
                optionsState.code = "0";
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
        optionsJoin.status = "error";
        optionsJoin.code = "404";
        optionsJoin.message = "Can't decode token";
        res.send(optionsJoin);
    }
    
});

export default router;