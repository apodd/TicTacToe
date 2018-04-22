import express from "express";
import { Database } from "../Database";
import { TokenGenerator } from "../TokenGenerator";

let router = express.Router();
const db = new Database();


router.post("/games/join", (req, res) => {
    res.header("Content-Type", 'application/json');

    let accessToken = TokenGenerator.createToken(req.body.userName);

    let options = {
        "status": "ok",
        "code": "0",
        "accessToken": accessToken    
    }

    db.getGameData(req.body.gameToken, (err, game) => {
        if (err) {
            console.log(err);
        } 
        game.forEach(element => {
            if (element.opponent === "") {
                db.setOpponentName(req.body.gameToken, req.body.userName);
            }
            res.send(options);
        });
    });
});

router.post("/games/new", (req, res) => {
    res.header("Content-Type", 'application/json');

    let accessToken = TokenGenerator.createToken(req.body.userName);
    let gameToken = TokenGenerator.createToken();

    db.createGame(req.body.userName, gameToken);

    let options = {
        "status": "ok",
        "code": "0",
        "accessToken": accessToken,
        "gameToken": gameToken
    }

    res.send(options);
});

router.get("/games/list", (req, res) => {
    res.header("Content-Type", 'application/json');

    let options = {
        "status": "ok",
        "code": "0",
        "games" : []
    }

    db.getGamesList((err, game) => {
        if (err) {
            console.log(err);
        } 
        game.forEach(element => {
            options.games.push(element);
        });
        res.send(options);
    });
});

router.post("/games/do_step", (req, res) => {
    res.header("Content-Type", 'application/json');

    let options = {
        "status": "ok",
        "code": "0"
    }

    db.getGameData(req.headers.gametoken, (err, game) => {
        if (err) {
            console.log(err);
        } 
        game.forEach(element => {
            console.log(element._id);
            db.setGameCell(element._id, req.body.row, req.body.col);
            res.send(options);
        });
    });

    console.log(TokenGenerator.decodeToken(req.headers.accesstoken));

});

router.get("/games/state", (req, res) => {

});

export default router;