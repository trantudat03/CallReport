const AccountRoute = require("./routers/AccountRoute");
const AuthRoute = require("./routers/AuthRoute");
const ReportRoute = require("./routers/ReportRoute");
const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const pool = require("./database");
const app = express();
const port = 4001;
const session = require("express-session");

app.use(
  cors({
    credentials: true,
    origin: ["http://localhost:3000", "http://192.168.1.54:3000"],
  })
);
app.use(express.json());
app.use(
  session({
    secret: "123451234", // Mã bí mật để ký cookie session
    resave: false, // Không lưu lại session nếu không có thay đổi
    saveUninitialized: true, // Không lưu các session chưa được khởi tạo
    cookie: {
      secure: false, // Chỉ gửi cookie qua HTTPS; đặt là true nếu dùng HTTPS
      //   httpOnly: true, // Cookie chỉ có thể được truy cập qua HTTP, không qua JavaScript
      maxAge: 3600000, // Thời gian tồn tại của cookie (1 giờ ở đây)
    },
  })
);
// Định nghĩa các route
app.use(AccountRoute);
app.use(AuthRoute);
app.use(ReportRoute);

app.get("/test", (req, res) => {
  pool.query("SELECT NOW()", (err, res) => {
    if (err) {
      console.error("Kết nối thất bại!", err);
    } else {
      console.log("Kết nối thành công! Thời gian hiện tại:", res.rows[0]);
    }

    // Đóng kết nối sau khi kiểm tra
    pool.end();
  });
  res.send("Hello World!");
});

// Khởi động server
app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
