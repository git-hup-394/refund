require('dotenv').config({ path: "./src/.env" });
const express = require("express");
const { connection } = require("./database/connection.js");
const configServer = require("./config/configServer.js");
const api = require("./api/api.js");
//init app
const app = express();


//config server



configServer(app);
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'





//connect database
connection.connect()
    .then((res) => {
        console.log(res);
    })
    .catch((e) => {
        console.log(e)
    });






//use router
app.use("", api);



//run server
const PORT = Number(process.env.PORT) || 1111;

app.listen(PORT, () => {
    console.log("backend is running on port", PORT);
})