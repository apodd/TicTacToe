import express from "express";
import bodyParser from 'body-parser';
import router from './routes/Routes';
import * as config from "./Config"

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', router);

app.listen(config.port, function () {
    console.log('Example app listening on port 8001!')
});