const { connection } = require('../database/connection.js')
const Services = require('./services.js')


const services = new Services()


class Controler {

    constructor() {

    }


    async getListordered(req, res) {
        try {

            let enKC = req?.cookies?.enKC;

            if (!enKC) {
                res.status(400).json({
                    message: "can't find your Haui account , you should login Haui account again!"
                })
                return
            }

            let { Cookie, kverify } = JSON.parse(services.decodeAES(enKC))

            let data_ordered = await services.listOrdered(kverify, Cookie) || "none";



            res.status(200).json({
                message: "ok", data_ordered
            })



        } catch (error) {
            res.status(500).json({
                message: "have wrong!"
            })
            console.log("err when getListordered : ", error);
            // services.appendError500("error when getListordered : " + error)

        }
    }


    async removeClass(req, res) {

        try {

            let enKC = req?.cookies?.enKC;

            if (!enKC) {
                res.status(400).json({
                    message: "can't find your Haui account , you should login Haui account again!"
                })
                return
            }

            let { Cookie, kverify } = JSON.parse(services.decodeAES(enKC))

            let { classCode } = req.body;

            if (!classCode) {
                res.status(400).json({
                    message: "can't find classCode , try again!"
                })
                return
            }

            let result = await services.removeClass(kverify, Cookie, classCode) || "none";

            res.status(200).json({
                message: "ok",
                result
            })

        } catch (error) {

            console.log("err when removeClass : ", error);
            // services.appendError500("error when removeClass : " + error)
        }

    }
    async registerClass(req, res) {

        try {

            let enKC = req?.cookies?.enKC;



            if (!enKC) {
                res.status(400).json({
                    message: "can't find your Haui account , you should login Haui account again!"
                })
                return
            }

            let { Cookie, kverify, nameHaui, passWordHaui, studentCode } = JSON.parse(services.decodeAES(enKC));

            let { classCode, moduleId } = req.body;

            if (!classCode) {
                res.status(400).json({
                    message: "can't find classCode , try again!"
                })
                return
            }


            let decodeAccessToken = req.decodeAccessToken;
            let userId = decodeAccessToken.userId; //get userId


            //querry database

            let user = await connection.excuteQuery(`select * from user where userId = ${userId}`)
                .then((data) => {
                    let { passWord, timeCreate, ...userData } = data[0];
                    return userData
                })
                .catch((err) => {
                    throw new Error(err)
                })
            let balance = user?.balance;

            if (!balance) {
                res.status(400).json({
                    message: "balance invalid!!"
                })
                return
            }
            balance = Number(balance)
            if (balance < 49) {
                res.status(400).json({
                    message: "balance not enough!"
                })
                return
            }


            let result = await services.addClass(kverify, Cookie, classCode) || "none";



            if (result.Message == "Gửi đơn đăng ký thành công, vui lòng đợi kết quả xử lý!") {
                let messageRefund = ""

                user.balance -= 49;
                let time = Date.now()


                await connection.excuteQuery(`update user set balance = ${balance - 49} where userId = ${userId}`)
                    .then(() => {
                        console.log("userId : " + userId + " vừa dky môn học");
                    })
                    .catch((err) => {
                        throw new Error(err)
                    })

                if (moduleId) {


                    let classesFromModuleId = await services.getInforClass(kverify, Cookie, moduleId) || [];

                    if (!classesFromModuleId?.length) {

                        messageRefund = "mã lớp không khớp với mã học phần"

                        await connection.excuteQuery(`insert into classRegisted  (nameHaui, userId , timeRegisted , studentCode , moduleName ,classId, classCode , className ,teacherName ) values ( '${nameHaui}',  ${userId} ,${time} , '${studentCode}' , '${"chưa xác định"}' , '${classCode}' , '${"chưa xác định"}' , '${"chưa xác định"}' , '${"chưa xác định"}' )  `)
                            .catch((e) => {
                                console.log("err when save to db regiested : ", e);
                            })


                    } else {


                        let classFound = classesFromModuleId.find((e) => {
                            return e?.IndependentClassID == classCode
                        })

                        console.log("class found : ", classFound);

                        if (classFound?.IndependentClassID) {
                            let teacherName = "không xác định"

                            try {

                                teacherName = JSON.parse(classCode.GiaoVien)[0]?.Fullname

                            } catch (error) {

                                messageRefund = "có lỗi khi xử lý !"
                                console.log("err khi parse tên giáo viên : ", error);

                            }


                            await connection.excuteQuery(`insert into classRegisted  (nameHaui, userId , timeRegisted , studentCode , moduleName ,classId, classCode , className ,teacherName ) values ( '${nameHaui}',  ${userId} ,${time} , '${studentCode}' , '${classFound?.ModuleName || "chưa xác định"}' , '${classCode}' , '${classFound?.ClassCode || "chưa xác định"}' , '${classFound?.ClassName || "chưa xác định"}' , '${teacherName}' )  `)
                                .catch((e) => {
                                    console.log("err when save to db regiested : ", e);

                                })

                            messageRefund = "ok"
                        } else {


                            await connection.excuteQuery(`insert into classRegisted  (nameHaui, userId , timeRegisted , studentCode , moduleName ,classId, classCode , className ,teacherName ) values ( '${nameHaui}',  ${userId} ,${time} , '${studentCode}' , '${"chưa xác định"}' , '${classCode}' , '${"chưa xác định"}' , '${"chưa xác định"}' , '${"chưa xác định"}' )  `)
                                .catch((e) => {
                                    console.log("err when save to db regiested : ", e);
                                })
                        }


                    }


                } else {
                    messageRefund = "chưa gửi id học phần"

                    await connection.excuteQuery(`insert into classRegisted  (nameHaui, userId , timeRegisted , studentCode , moduleName ,classId, classCode , className ,teacherName ) values ( '${nameHaui}',  ${userId} ,${time} , '${studentCode}' , '${"chưa xác định"}' , '${classCode}' , '${"chưa xác định"}' , '${"chưa xác định"}' , '${"chưa xác định"}' )  `)
                        .catch((e) => {
                            console.log("err when save to db regiested : ", e);
                        })
                }



                res.status(200).json({
                    message: "ok",
                    result,
                    userData: user,
                    messageRefund

                })

            } else {
                res.status(500).json({
                    message: "have wrong!",
                    result
                })
            }


        } catch (error) {

            console.log("err when registerClass : ", error);
            // services.appendError500("error when registerClass : " + error)
        }

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
            // console.log("listOrdered : ", listOrdered);



            let listOrderedSameClass = listOrdered.filter((e) => {
                return e.cc == registedClass.classCode
            })

            // console.log("listOrderedSameClass : ", listOrderedSameClass);



            let timeArray = listOrderedSameClass.map((e) => {
                return Math.abs(Number(services.convertStringToDateNow(e.tm) - registedClass.timeRegisted))
            })

            let minTime = Math.min(...timeArray)


            let regited = listOrderedSameClass.find((e) => {
                return Math.abs(Number(services.convertStringToDateNow(e.tm) - registedClass.timeRegisted) == minTime)
            })

            // console.log("regited : ", regited);



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

                res.status(400).json({
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

            res.status(200).json({
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