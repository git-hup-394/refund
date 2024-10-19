const axios = require('axios');
const qs = require('qs');
const { CookieJar } = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const cheerio = require('cheerio');


class Services {


    async getTokenUrlHaui(userNameHaui, passWordHaui) {
        try {

            let cookie1 = 'onehauii=';
            let cookie2 = 'TrxL4TX2mjqMQ1pKsA7y4inFGqk_=';
            const url = 'https://one.haui.edu.vn/loginapi/sv';

            // Dữ liệu POST
            const data = {
                '__VIEWSTATE': '/wEPDwUKLTU5NDQwMzI4Mw9kFgJmDxYCHgZhY3Rpb24FDC9sb2dpbmFwaS9zdmRkLUQPG6EM9UmIcR2BbVVHKFcrpMPq+5jLkhNeQ7F2IUo=',
                '__VIEWSTATEGENERATOR': 'C2EE9ABB',
                '__EVENTVALIDATION': '/wEdAAS5z3MTDMAIrXv9EuOCbfKV5nBuGc9m+5LxaP9y8LjuWbIOqgbU3uDqsEyVllp/jwNkBC2CEAipMbZPtKd79PAx5foOw1a7snIeIlNlqcQMoCcgW0aE55vl9Kb0YUvX8wg=',
                'ctl00$inpUserName': userNameHaui, // Thay bằng tên người dùng thực tế
                'ctl00$inpPassword': passWordHaui, // Thay bằng mật khẩu thực tế
                'ctl00$butLogin': 'Đăng nhập'
            };

            // Khởi tạo axios instance với cấu hình tùy chỉnh
            const axiosInstance = axios.create({
                headers: {
                    'Referer': 'https://one.haui.edu.vn/loginapi/sv',
                },
                maxRedirects: 0 // Ngăn chặn axios tự động làm theo chuyển hướng
            });

            // Gửi yêu cầu POST
            await axiosInstance.post(url, qs.stringify(data), {
                headers: {
                    'Cookie': '_ga=GA1.1.1318348922.1727412945; _ga_S8WJEW3D2H=GS1.1.1727412944.1.0.1727412946.0.0.0; TrxL4TX2mjqMQ1pKsA7y4inFGqk_=v1Th+GSQSDnT2; ASP.NET_SessionId=kx30vsngytypguotuscihujf; kVisit=f940684f-b4ff-4bd1-8ad9-9432e33033f9'
                }
            })
                .catch(error => {
                    if (error.response) {
                        let cks = error.response.headers["set-cookie"]
                        cookie1 += cks[1].split("=")[1].slice(0, cks[1].split("=")[1].indexOf(";"))
                        cookie2 += cks[2].split("=")[1].slice(0, cks[2].split("=")[1].indexOf(";"))


                    } else if (error.request) {
                        console.error('Error Request:', error.request);
                    } else {
                        console.error('Error Message:', error.message);
                    }
                });


            let token_url = ''

            // Gửi request với cookies
            await axios.get('https://one.haui.edu.vn/loginapi/sv', {
                headers: {
                    'Cookie': `${cookie1}; ${cookie2}`
                }
            })
                .then(response => {
                    let res = response.data
                    token_url = res.slice(res.indexOf("https"), res.indexOf("'</"))
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            return token_url

        } catch (error) {
            console.log("get getTokenUrlHaui false" + error);
            return "get getTokenUrlHaui false" + error
        }


    }


    async dataFomTokenUrl(token_url) {
        try {

            const jar = new CookieJar();
            const axiosInstance = wrapper(
                axios.create({
                    jar,
                    withCredentials: true,
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/9.0 Mobile/15E148 Safari/604.1'
                    }
                })
            );

            // Bước 1: Gửi yêu cầu đầu tiên với token
            const initialResponse = await axiosInstance.get(token_url);


            // Bước 2: Thực hiện chuyển hướng thủ công đến "/"
            const redirectResponse = await axiosInstance.get('https://sv.haui.edu.vn/');

            // In ra dữ liệu cuối cùng

            // Bước 3: Lấy cookie từ response cuối cùng
            const finalCookies = jar.toJSON();
            const Cookie = finalCookies.cookies
                .map(({ key, value }) => `${key}=${value}`)
                .join('; ');



            //extract data

            // Load HTML vào Cheerio
            const $ = cheerio.load(redirectResponse.data);

            // Trích xuất username
            let nameHaui = $('.user-name').text().trim();
            nameHaui = nameHaui.slice(0, Math.floor(nameHaui.length / 2))
            // fs.appendFileSync("./test.txt", redirectResponse.data)

            // Trích xuất kverify từ script
            const kverifyMatch = redirectResponse.data.match(/var kverify = '(.*?)';/);
            const kverify = kverifyMatch ? kverifyMatch[1] : '';



            return { nameHaui, kverify, Cookie }



        } catch (error) {
            console.error('Có lỗi xảy ra:', error);
        }


    }


    async listOrdered(kverify, Cookie) {

        return new Promise(async (reslove, reject) => {
            const url = `https://sv.haui.edu.vn/ajax/register/action.htm?cmd=listorder&v=${kverify}`;
            const payload = qs.stringify({
                fid: "a"
            });

            // Cấu hình request
            const config = {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    'Accept': 'application/json, text/javascript, */*; q=0.01',
                    'Accept-Encoding': 'gzip, deflate, br, zstd',
                    'Accept-Language': 'en,vi-VN;q=0.9,vi;q=0.8,fr-FR;q=0.7,fr;q=0.6,en-US;q=0.5',
                    'Cookie': Cookie,
                    'Origin': 'https://sv.haui.edu.vn',
                    'Referer': 'https://sv.haui.edu.vn/register/',
                    'Sec-CH-UA': '"Not)A;Brand";v="99", "Google Chrome";v="127", "Chromium";v="127"',
                    'Sec-CH-UA-Mobile': '?0',
                    'Sec-CH-UA-Platform': '"Windows"',
                    'Sec-Fetch-Dest': 'empty',
                    'Sec-Fetch-Mode': 'cors',
                    'Sec-Fetch-Site': 'same-origin',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            };

            await axios.post(url, payload, config)
                .then(response => {
                    reslove(response.data)
                })
                .catch(error => {
                    reject(error)
                });
        })


    }



    formatDate(date) {
        date = new Date(date)
        let day = String(date.getDate()).padStart(2, '0');
        let month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        let year = date.getFullYear();
        let hours = String(date.getHours()).padStart(2, '0');
        let minutes = String(date.getMinutes()).padStart(2, '0');
        let seconds = String(date.getSeconds()).padStart(2, '0');

        return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
    }

    convertStringToDateNow(s) {
        // Chuyển đổi chuỗi sang định dạng Date
        let dateParts = s.split(' ')[0].split('-');
        let timeParts = s.split(' ')[1].split(':');

        let date = new Date(Date.UTC(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0], timeParts[1], timeParts[2]));

        // Việt Nam là UTC+7
        let vietnamTime = new Date(date.getTime() + (7 * 60 * 60 * 1000));

        // Lấy giá trị theo mili giây
        let timestamp = vietnamTime.getTime();
        return timestamp
    }



}




module.exports = Services