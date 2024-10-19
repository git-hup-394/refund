const api = require("express").Router()
const Controler = require("../controler/controler.js")

//create a instance
let controler = new Controler()

//test api
api.get("/ping", (req, res) => {
    res.status(200).json({
        message: "ok from refund server!"
    });
})


api.post("/refund", controler.refund)


module.exports = api