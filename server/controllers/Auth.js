const pool = require("../database");
const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const Login = async (req, res) => {
  const { userName, password } = req.body;

  if (!userName || !password) {
    return res
      .status(400)
      .json({ msg: "userName và Password không được để trống" });
  }

  try {
    // Tìm người dùng dựa trên userNamee
    const query = `
      SELECT a.id, a.name, a.password, r.name AS role_name
      FROM accountreport a
      JOIN roles r ON a.role_id = r.id
      WHERE a.userName = $1
    `;
    const { rows } = await pool.query(query, [userName]);

    // Nếu không tìm thấy người dùng
    if (rows.length === 0) {
      return res.status(404).json({ msg: "Người dùng không tìm thấy" });
    }

    const user = rows[0];

    // So sánh mật khẩu với mật khẩu lưu trữ
    const match = await bcrypt.compare(password, user.password);

    // Nếu mật khẩu không khớp
    if (!match) {
      return res.status(400).json({ msg: "Mật khẩu không chính xác" });
    }

    // Thiết lập thông tin người dùng vào session
    req.session.userId = user.id;

    // Lấy thông tin người dùng
    const role = user.role_name;
    const uuid = user.id;
    const name = user.name;

    // Trả về thông tin người dùng
    res.status(200).json({ uuid, name, role });
  } catch (error) {
    console.error("Lỗi khi đăng nhập", error.message);
    res.status(500).json({ msg: "Lỗi máy chủ" });
  }
};

const Profile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ msg: "Mohon login ke akun Anda!" });
  }

  try {
    const userId = req.session.userId;

    // Truy vấn cơ sở dữ liệu để lấy thông tin người dùng và tên vai trò
    const query = `
      SELECT a.id, a.name, a.email, r.name AS role_name
      FROM accountreport a
      JOIN roles r ON a.role_id = r.id
      WHERE a.id = $1
    `;

    const { rows } = await pool.query(query, [userId]);

    // Nếu không tìm thấy người dùng
    if (rows.length === 0) {
      return res.status(404).json({ msg: "User tidak ditemukan" });
    }

    // Lấy thông tin người dùng từ kết quả truy vấn
    const user = rows[0];
    const { id, name, email, role_name } = user;

    // Trả thông tin người dùng về cho client
    res.status(200).json({ id, name, email, role_name });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin người dùng", error.message);
    res.status(500).json({ msg: "Lỗi máy chủ" });
  }
};

const logOut = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(400).json({ msg: "Tidak dapat logout" });
    res.status(200).json({ msg: " logout success" });
  });
};

module.exports = { Profile, Login, logOut };
