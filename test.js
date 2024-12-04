const Services = require("./src/controler/services.js")
const sv = new Services()
function convertToTimestamp(dateString) {
    // Chuyển đổi định dạng "DD-MM-YYYY HH:MM:SS" thành đối tượng Date
    const dateParts = dateString.split(' ');
    const date = dateParts[0].split('-');
    const time = dateParts[1].split(':');

    // Lấy các phần của ngày tháng và giờ
    const day = date[0];
    const month = date[1] - 1; // Tháng trong JavaScript bắt đầu từ 0 (0 = tháng 1)
    const year = date[2];
    const hours = time[0];
    const minutes = time[1];
    const seconds = time[2];

    // Tạo đối tượng Date mới từ các giá trị trên
    const formattedDate = new Date(year, month, day, hours, minutes, seconds);

    // Trả về timestamp (milliseconds từ epoch)
    return formattedDate.getTime();
}

// Ví dụ sử dụng hàm
const timestamp = convertToTimestamp("04-12-2024 13:14:13");//04-12-2024 09:05:34
console.log(convertToTimestamp("04-12-2024 09:05:34"));

// console.log(timestamp); // In ra timestamp (milliseconds)
// let tp2 = sv.formatDate(1733292853744)
// console.log(tp2);
// console.log(convertToTimestamp(tp2));
// console.log(sv.formatDate(1733292853744));

// console.log(sv.formatDate(1733292853000));

// console.log(292855974 - 343254000); //328334000

// console.log(Math.abs(Number(1733292853000 - 1733277934000)));


console.log(1733292855974 - convertToTimestamp("04-12-2024 13:14:14"));
console.log(1733292855974 - convertToTimestamp("04-12-2024 09:05:34"));

console.log(1733292855974 - sv.convertStringToDateNow("04-12-2024 13:14:14"));
console.log(1733292855974 - sv.convertStringToDateNow("04-12-2024 09:05:34"));



// console.log(tp2 - timestamp);
