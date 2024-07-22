const pool = require("../database");
const express = require("express");
const bcrypt = require("bcrypt");
const saltRounds = 10;

const getAccount = async (req, res) => {
  try {
    const query = `
        SELECT * FROM accountreport
    `;

    const { rows } = await pool.query(query);
    const lht = rows.length;
    res.json({ lht, rows });
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error 1" });
  }
};

const createAccount = async (req, res) => {
  try {
    console.log(req.body);
    const { name, email, password, role_id, userName, grp_id, status } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const query = `
      INSERT INTO accountreport (name, email, password, role_id, userName, grp_id, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await pool.query(query, [
      name,
      email,
      hashedPassword,
      role_id,
      userName,
      grp_id,
      status,
    ]);

    res.status(201).json({ msg: "Register success" });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

module.exports = { getAccount, createAccount };

// export const getUserById = async (req, res) => {
//   try {
//     const response = await User.findOne({
//       attributes: ["uuid", "name", "email", "role"],
//       where: {
//         uuid: req.params.id,
//       },
//     });
//     res.status(200).json(response);
//   } catch (error) {
//     res.status(500).json({ msg: error.message });
//   }
// };

// export const createUser = async (req, res) => {
//   const { name, email, password, confPassword, role } = req.body;
//   if (password !== confPassword)
//     return res
//       .status(400)
//       .json({ msg: "Password dan Confirm Password tidak cocok" });
//   const hashPassword = await argon2.hash(password);
//   try {
//     await User.create({
//       name: name,
//       email: email,
//       password: hashPassword,
//       role: role,
//     });
//     res.status(201).json({ msg: "Register Berhasil" });
//   } catch (error) {
//     res.status(400).json({ msg: error.message });
//   }
// };

// export const updateUser = async (req, res) => {
//   const user = await User.findOne({
//     where: {
//       uuid: req.params.id,
//     },
//   });
//   if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
//   const { name, email, password, confPassword, role } = req.body;
//   let hashPassword;
//   if (password === "" || password === null) {
//     hashPassword = user.password;
//   } else {
//     hashPassword = await argon2.hash(password);
//   }
//   if (password !== confPassword)
//     return res
//       .status(400)
//       .json({ msg: "Password dan Confirm Password tidak cocok" });
//   try {
//     await User.update(
//       {
//         name: name,
//         email: email,
//         password: hashPassword,
//         role: role,
//       },
//       {
//         where: {
//           id: user.id,
//         },
//       }
//     );
//     res.status(200).json({ msg: "User Updated" });
//   } catch (error) {
//     res.status(400).json({ msg: error.message });
//   }
// };

// export const deleteUser = async (req, res) => {
//   const user = await User.findOne({
//     where: {
//       uuid: req.params.id,
//     },
//   });
//   if (!user) return res.status(404).json({ msg: "User tidak ditemukan" });
//   try {
//     await User.destroy({
//       where: {
//         id: user.id,
//       },
//     });
//     res.status(200).json({ msg: "User Deleted" });
//   } catch (error) {
//     res.status(400).json({ msg: error.message });
//   }
// };
