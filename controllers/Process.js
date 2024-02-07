import pool from "../Connect.js";
import moment from "moment";

export const getProcessTitle = async (req, res) => {
  try {
    const { search } = req.query;

    let sql = `
    SELECT  house.name, process.total, process.paid, process.overdue
    FROM process
    JOIN house ON process.house_id = house.id 
    `;

    if (search) {
      sql += `WHERE house.name LIKE '%${search}%' `;
    } else {
      sql += "";
    }

    sql += `LIMIT 20`;

    const [result] = await pool.query(sql);
    res.status(200).json(result);
  } catch (error) {
    console.log(error);
  }
};

export const postNewProcess = async (req, res) => {
  try {
    const { house_id } = req.body;

    if (house_id) {
      // เช็ค ค่าซ้ำ
      const sqlCheck = `SELECT id FROM process WHERE house_id = ? LIMIT 1`;
      const [resultCheck] = await pool.query(sqlCheck, [house_id]);

      if (resultCheck.length > 0) {
        throw new Error("สถานที่นี้ถูกสร้างไปแล้ว");
        console.log(111);
      } else {
        const sql = `INSERT INTO process (house_id) VALUES (?)`;
        await pool.query(sql, [house_id]);
        res.status(200).json({ message: "บันทึกสำเร็จ" });
      }
    } else {
      throw new Error("ไม่พบ สถานที่นี้");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// Users

export const getProcessUserByProcessId = async (req, res) => {
  try {
    const { status, process_id } = req.query;

    let sql = `
        SELECT process_user.price, process_user.count_day, process_user.start_day, process_user.end_day, process_user.status, process_user.total, process_user.paid, process_user.overdue,  users.name
        FROM process_user 
        JOIN users ON process_user.user_id = users.id
        WHERE process_user.process_id = ?  
        `;

    if (process_id) {
      if (status) {
        sql += ` AND process_user.status = ? `;
      } else {
        sql += ``;
      }

      sql += ` LIMIT 20 `;

      const [result] = await pool.query(sql, [process_id, status]);
      const newResult = result.map((item) => {
        return {
          price: item.price,
          count_day: item.count_day,
          start_day: `${moment(item.start_day).format("DD-MM-")}${moment(
            item.start_day
          )
            .add(543, "year")
            .format("YYYY")}`,
          end_day: `${moment(item.end_day).format("DD-MM-")}${moment(
            item.end_day
          )
            .add(543, "year")
            .format("YYYY")}`,
          status: item.status,
          total: item.total,
          paid: item.paid,
          overdue: item.overdue,
          name: item.name,
        };
      });
      res.status(200).json(newResult);
    }
  } catch (error) {
    console.error(error);
  }
};

export const postNewProcessUser = async (req, res) => {
  try {
    const { process_id, user_id, price, count_day, start_day, end_day } =
      req.body;

    if (process_id) {
      const sqlCheck = `SELECT id FROM process_user WHERE process_id = ? AND user_id = ? LIMIT 3`;
      const [resultCheck] = await pool.query(sqlCheck, [process_id, user_id]);

      if (resultCheck.length > 0) {
        throw new Error("มีผู้ใช้งานนี้แล้ว");
      } else {
        const sql = `INSERT INTO process_user (process_id, user_id, price, count_day, start_day, end_day, total, overdue) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const [resultInsert] = await pool.query(sql, [
          process_id,
          user_id,
          price,
          count_day,
          start_day,
          end_day,
          price,
          price,
        ]);

        // UPDATE ยอดรวม PROCESS
        // หาจำนวนล่าสุดก่อน
        const sqlSumTotalProcess = `SELECT total, paid, overdue FROM process WHERE id LIMIT 3 `;
        const [resultSumTotalProcess] = await pool.query(sqlSumTotalProcess, [
          process_id,
        ]);
        // console.log(resultSumTotalProcess[0]);

        const sumTotal = Number(resultSumTotalProcess[0].total) + Number(price);
        const overdueTotal =
          Number(resultSumTotalProcess[0].overdue) + Number(price);

        const updateTotalProcess = `UPDATE process SET total = ?, overdue = ? WHERE id = ?`;
        await pool.query(updateTotalProcess, [
          sumTotal,
          overdueTotal,
          process_id,
        ]);

        // INSERT PROCESS_USER_LIST
        // ID ล่าสุดที่พึ่ง insert
        const lastInsertedId = resultInsert.insertId;
        const newPrice = price / count_day;

        for (let i = 0; i < count_day; i++) {
          const newDate = moment(start_day).add(i, "days").format("YYYY-MM-DD");

          const sql =
            "INSERT INTO process_user_list (date, price, process_user_id) VALUES (?, ?, ?)";
          await pool.query(sql, [newDate, newPrice, lastInsertedId]);
        }

        res.status(200).json({ message: "บันทึกสำเร็จ" });
      }
    } else {
      throw new Error("ไม่พบสถานที่");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export const getUserListByProcessUserId = async (req, res) => {
  try {
    const { process_user_id } = req.query;

    if (process_user_id) {
      const sql = `SELECT id, date, price, status FROM process_user_list WHERE process_user_id = ?`;
      const [result] = await pool.query(sql, [process_user_id]);

      const newResult = result.map((item) => {
        return {
          id: item.id,
          date: `${moment(item.date).format("DD-MM-")}${moment(item.date)
            .add(543, "years")
            .format("YYYY")}`,
          price: item.price,
          status: item.status,
        };
      });

      res.status(200).json(newResult);
    }
  } catch (error) {
    console.log(error);
  }
};

export const putUserList = async (req, res) => {
  try {
    const { id, status, price, process_user_id, process_id } = req.body;
    console.log(req.body);

    // console.log(req.body);
    if (id && status) {
      const sql = `UPDATE process_user_list SET status = ? WHERE id = ?`;
      await pool.query(sql, [status, id]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });

      //   CHECK TOTAL PROCESS
      const sqlCheckProcess = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3  `;
      const [resultCheckProcess] = await pool.query(sqlCheckProcess, [
        process_id,
      ]);

      //   CHECK TOTAL PROCESS_USER
      const sqlCheck = `SELECT paid, overdue, total FROM process_user WHERE id = ? LIMIT 3  `;
      const [resultCheck] = await pool.query(sqlCheck, [process_user_id]);

      //   console.log(resultCheck[0]);

      let paidTotal = resultCheck[0].paid; //25
      let overdueTotal = resultCheck[0].overdue; //75

      let paidProcess = resultCheckProcess[0].paid;
      let overdueProcess = resultCheckProcess[0].overdue;

      if (status == "1") {
        // Process_User
        paidTotal = Number(paidTotal) + Number(price);
        overdueTotal = overdueTotal - price;
        // Process
        paidProcess = Number(paidProcess) + Number(price);
        overdueProcess = Number(overdueProcess) - Number(price);
      } else {
        // Process_User
        paidTotal = Number(paidTotal) - Number(price);
        overdueTotal = Number(overdueTotal) + Number(price);
        // Process
        paidProcess = Number(paidProcess) - Number(price);
        overdueProcess = Number(overdueProcess) + Number(price);
      }
      //   SQL UPDATE PROCESS_USER
      const sqlUpdate = `UPDATE process_user SET paid = ?, overdue = ?  WHERE id = ?   `;
      await pool.query(sqlUpdate, [paidTotal, overdueTotal, process_user_id]);

      //   SQL UPDATE PROCESS
      const sqlUpdateProcess = `UPDATE process SET paid = ?, overdue = ?  WHERE id = ?   `;
      await pool.query(sqlUpdateProcess, [paidProcess, overdueProcess, process_id]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};
