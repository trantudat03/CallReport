const moment = require("moment-timezone");
const pool = require("../database");

const getGroup = async (req, res) => {
  try {
    const query = `
      SELECT fkiddn, name FROM grp
    `;

    const { rows } = await pool.query(query);

    res.status(201).json({ msg: "Register success", data: rows });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

const getExtension = async (req, res) => {
  try {
    const query = `
      SELECT dn.iddn, dn.value, users.iduser, users.firstname, users.lastname
            FROM dn
            JOIN users ON dn.iddn = users.fkidextension
    `;

    const { rows } = await pool.query(query);

    res.status(201).json({ msg: "Register success", data: rows });
  } catch (error) {
    res.status(400).json({ msg: error.message });
  }
};

// const getCallList = async (req, res) => {

//   try {
//     const {
//       fromDate,
//       toDate,
//       caller,
//       callDirection,
//       status,
//       ringTimeFrom,
//       ringTimeTo,
//       talkTimeFrom,
//       talkTimeTo,
//       groups,
//       extension,
//       callCode,
//     } = req.query;

//     const query1 = `
//         SELECT
//             s.call_id,
//             s.src_part_id,
//             src_info.display_name AS src_display_name,
//             src_info.caller_number AS src_caller_number,
//             src_info.dn AS src_dn,
//             s.dst_part_id,
//             dst_info.display_name AS did_name,
//             dst_info.caller_number AS did_caller_number,
//             dst_info.dn AS did_dn,
//             s.start_time,
//             s.end_time,
//             c.is_answered,
//             c.ringing_dur,
//             c.talking_dur,
//             max_actions.max_action_id
//         FROM
//             cl_segments s
//         JOIN
//             cl_calls c ON s.call_id = c.id
//         JOIN
//             cl_party_info src_info ON s.src_part_id = src_info.id
//         JOIN
//             cl_party_info dst_info ON s.dst_part_id = dst_info.id
//         JOIN
//             (SELECT call_id, MAX(action_id) AS max_action_id FROM cl_segments GROUP BY call_id) max_actions ON s.call_id = max_actions.call_id
//         WHERE
//             (s.id, s.call_id) IN (
//                 SELECT MIN(id), call_id
//                 FROM cl_segments
//                 GROUP BY call_id
//             )
//         ORDER BY
//             s.call_id;
//     `;

//     const { rows } = await pool.query(query1);
//     const lht = rows.length;
//     res.json(rows);
//   } catch (err) {
//     console.error("Error executing query", err);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

const getCallList = async (req, res) => {
  try {
    const {
      fromDate,
      toDate,
      caller,
      callDirection,
      status,
      ringTimeFrom,
      ringTimeTo,
      talkTimeFrom,
      talkTimeTo,
      groups,
      extension,
      callCode,
    } = req.query;

    console.log(req.query);
    const fromDateUtc = moment(fromDate).utc().format();
    const toDateUtc = moment(toDate).utc().format();
    const groupArray = groups ? groups.map((ext) => ext.value) : [];
    const groupList =
      groupArray.length > 0 ? groupArray.map((e) => `'${e}'`).join(",") : "";
    const extensionArray = extension ? extension.map((ext) => ext.value) : [];
    const extensionList =
      extensionArray.length > 0
        ? extensionArray.map((e) => `'${e}'`).join(",")
        : "";
    // Khởi tạo câu lệnh cơ bản
    let query = `
        SELECT DISTINCT
            s.call_id,
            s.src_part_id,
            src_info.display_name AS src_display_name,
            src_info.caller_number AS src_caller_number,
            src_info.dn AS src_dn,
            ARRAY_AGG(DISTINCT src_grp.fkidgrp) AS src_groups,
            s.dst_part_id,
            dst_info.display_name AS did_name,
            dst_info.caller_number AS did_caller_number,
            dst_info.dn AS did_dn,
            ARRAY_AGG(DISTINCT dst_grp.fkidgrp) AS dst_groups,
            s.start_time,
            s.end_time,
            c.is_answered,
            c.ringing_dur,
            c.talking_dur,
            max_actions.max_action_id
        FROM
            cl_segments s
        JOIN
            cl_calls c ON s.call_id = c.id
        JOIN
            cl_party_info src_info ON s.src_part_id = src_info.id
        JOIN
            cl_party_info dst_info ON s.dst_part_id = dst_info.id
        JOIN
            (SELECT call_id, MAX(action_id) AS max_action_id FROM cl_segments GROUP BY call_id) max_actions ON s.call_id = max_actions.call_id
        LEFT JOIN
            dn src_dn ON src_info.dn = src_dn.value
        LEFT JOIN
            dngrp src_grp ON src_dn.iddn = src_grp.fkiddn
        LEFT JOIN
            dn dst_dn ON dst_info.dn = dst_dn.value
        LEFT JOIN
            dngrp dst_grp ON dst_dn.iddn = dst_grp.fkiddn
        WHERE
            (s.id, s.call_id) IN (
                SELECT MIN(id), call_id
                FROM cl_segments
                GROUP BY call_id
            )
            AND s.start_time >= '${fromDateUtc}'
            AND s.start_time <= '${toDateUtc}'
    `;

    // Mảng điều kiện
    const conditions = [];

    // Thêm các điều kiện vào mảng
    if (callCode) conditions.push(`s.call_id= '${callCode}'`);
    if (caller) conditions.push(`src_info.display_name LIKE '%${caller}%'`);
    // if (callDirection) conditions.push(`c.call_direction = '${callDirection}'`);
    if (status != "Tất cả") conditions.push(`c.is_answered = '${status}'`);
    // if (ringTimeFrom) conditions.push(`c.ringing_dur >= ${ringTimeFrom}`);
    // if (ringTimeTo) conditions.push(`c.ringing_dur <= ${ringTimeTo}`);
    // if (talkTimeFrom) conditions.push(`c.talking_dur >= ${talkTimeFrom}`);
    // if (talkTimeTo) conditions.push(`c.talking_dur <= ${talkTimeTo}`);
    // if (groups) conditions.push(`src_info.group_id IN (${groups})`);
    // console.log(groupList);

    if (groupList)
      conditions.push(
        `src_grp.fkidgrp IN (${groupList}) OR dst_grp.fkidgrp IN (${groupList})`
      );
    if (extensionList)
      conditions.push(
        `src_info.dn IN (${extensionList}) OR dst_info.dn IN (${extensionList})`
      );

    // Thêm điều kiện vào câu truy vấn
    if (conditions.length > 0) {
      query += ` AND (${conditions.join(" OR ")})`;
    }

    // Thêm phần ORDER BY và kết thúc câu lệnh
    query += `
        GROUP BY
            s.call_id,
            s.src_part_id,
            src_info.display_name,
            src_info.caller_number,
            src_info.dn,
            s.dst_part_id,
            dst_info.display_name,
            dst_info.caller_number,
            dst_info.dn,
            s.start_time,
            s.end_time,
            c.is_answered,
            c.ringing_dur,
            c.talking_dur,
            max_actions.max_action_id
        ORDER BY
            s.call_id;
    `;

    // Thực thi câu lệnh
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error executing query", err);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = { getGroup, getExtension, getCallList };
