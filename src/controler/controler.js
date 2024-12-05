const { connection } = require('../database/connection.js')
const Services = require('./services.js')
const fs = require("fs")

const services = new Services()


class Controler {

    constructor() {

    }


    async refund(req, res) {

        try {
            let { studentCode, passWordHaui, id, userId } = req.body

            if (!studentCode || !passWordHaui || !id) {
                res.status(400).json({
                    message: "missing data!"
                })
                return
            }
            userId = Number(userId)
            id = Number(id)
            studentCode = Number(studentCode)



            let registedClass = await connection.excuteQuery(`select * from classRegisted where userId = ${Number(userId)} and id = ${id || -1} and studentCode = '${studentCode}'`)
                .then((data) => {
                    return data[0];
                })
                .catch((e) => {
                    console.log(e);
                })

            console.log("registedClass : ", registedClass);

            if (!registedClass) {
                res.status(400).json({
                    message: "dữ liệu gửi lên không chính xác! , sẽ ban nếu tiếp tục!"
                })
                return
            }


            if (registedClass?.isrefund) {
                res.status(400).json({
                    message: "id này đã hoàn xu rồi , sẽ ban nếu tiếp tục!"
                })
                return
            }



            let token_url = await services.getTokenUrlHaui(studentCode, passWordHaui)

            if (!token_url.includes("token=")) {
                res.status(400).json({
                    message: "tài khoản mật khẩu HAUI không chính xác!"
                })
                return
            }

            let { nameHaui, kverify, Cookie } = await services.dataFomTokenUrl(token_url);


            let listOrdered = await services.listOrdered(kverify, Cookie)
                .then((data) => {
                    return data
                })
                .catch((e) => {
                    console.log(e);
                });

            if (!listOrdered?.length) {
                res.status(400).json({
                    message: "Không tìm thấy dữ liệu từng đăng ký!"
                })
                return
            }
            console.log("listOrdered : ", listOrdered);



            let listOrderedSameClass = listOrdered.filter((e) => {
                return e.cc == registedClass.classCode && !e.st.includes("Hủy")
            })

            console.log("listOrderedSameClass : ", listOrderedSameClass);



            let timeArray = listOrderedSameClass.map((e) => {
                return Math.abs(
                    services.convertStringToDateNow(e.tm) - registedClass.timeRegisted
                );
            });

            let minTime = Math.min(...timeArray);

            // fs.writeFileSync("./time.txt", JSON.stringify(timeArray))

            let regited = listOrderedSameClass.find((e) => {
                return (
                    Math.abs(
                        services.convertStringToDateNow(e.tm) - registedClass.timeRegisted
                    ) === minTime
                );
            });



            console.log("regited : ", regited);



            if (!regited) {
                res.status(400).json({
                    message: "Không tìm thấy dữ liệu thích hợp"
                })
                await connection.excuteQuery(`update classRegisted set isrefund = 1 where id = ${id}`)
                    .catch((e) => {
                        console.log(e);
                    })
                return
            }


            if (regited.st == "Đăng ký thành công!") {

                await connection.excuteQuery(`update classRegisted set isrefund = 1 where id = ${id}`)
                    .catch((e) => {
                        console.log(e);
                    })

                return res.status(400).json({
                    message: "Đăng ký này đã thành công . Không hoàn tiền!"
                })

            }
            await connection.excuteQuery(`UPDATE user
                SET balance = balance + 49
                WHERE userId = ${userId}; `)
            await connection.excuteQuery(`update classRegisted set isrefund = 1 where id = ${id}`)
                .catch((e) => {
                    console.log(e);
                })

            return res.status(200).json({
                message: "ok",
            })


        } catch (error) {
            console.log(error);
            res.status(500).json({
                message: "have wrong!"
            })

        }


    }

}


module.exports = Controler