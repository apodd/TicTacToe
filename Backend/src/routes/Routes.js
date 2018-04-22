import express from "express";
import { Database } from "../Database";
import { TokenGenerator } from "../TokenGenerator";
import { options } from "../models/Response";

let router = express.Router();
const db = new Database();


router.post("/games/join", (req, res) => {
    res.header("Content-Type", 'application/json');
    
    let accessToken = TokenGenerator.createToken(req.body.userName);
    
    let optionsJoin = options;
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
                db.setOpponentName(req.body.gameToken, req.body.userName);
            }
            res.send(optionsJoin);
        });
    });
});

router.post("/games/new", (req, res) => {
    res.header("Content-Type", 'application/json');

    let accessToken = TokenGenerator.createToken(req.body.userName);
    let gameToken = TokenGenerator.createToken();

    let optionsNew = options;
    optionsNew.accessToken = accessToken;
    optionsNew.gameToken = gameToken;

    db.createGame(req.body.userName, gameToken, (err) => {
        if (err) {
            optionsNew.status = "error";
            optionsNew.code = "404";
        } else {
            optionsNew.status = "ok";
            optionsNew.code = "0";
        }

        res.send(optionsNew);
    });
});

router.get("/games/list", (req, res) => {
    res.header("Content-Type", 'application/json');

    let optionsList = options;
    optionsList.games = [];

    db.getGamesList((err, game) => {
        if (err) {
            optionsList.status = "error";
            optionsList.code = "404";
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
    
    let optionsStep = options;

    db.setGameCell(req.headers.gametoken, req.body.row, req.body.col, (err, doc) => {
        if (err) {
            console.log(err);
        } 
    });

    console.log(TokenGenerator.decodeToken(req.headers.accesstoken));

    res.send(options);
});

router.get("/games/state", (req, res) => {

});

export default router;