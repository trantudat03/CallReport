const { Pool } = require("pg");

const pool = new Pool({
  user: "phonesystem",
  host: "103.122.160.54", //103.122.160.54
  database: "database_single",
  password: "pGat1bW561sDLS",
  port: 5432,
});

// pool.query("SELECT NOW()", (err, res) => {
//   if (err) {
//     console.error("Kết nối thất bại!", err);
//   } else {
//     console.log("Kết nối thành công! Thời gian hiện tại:", res.rows[0]);
//   }

//   // Đóng kết nối sau khi kiểm tra
//   pool.end();
// });
module.exports = pool;
