import pool from "../Connect.js";
import moment from "moment";

export const getProcessTitle = async (req, res) => {
  try {
    const { search } = req.query;

    let sql = `
    SELECT  house.name, process.id, process.total, process.paid, process.overdue
    FROM process
    JOIN house ON process.house_id = house.id 
    `;

    if (search) {
      sql += `WHERE house.name LIKE '%${search}%' `;
    } else {
      sql += "";
    }

    // sql += `LIMIT 20`;

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
    console.log(req.query);

    let sql = `
        SELECT process_user.id, process_user.price, process_user.count_day, process_user.start_day, process_user.end_day, process_user.status, process_user.total, process_user.paid, process_user.overdue,  users.name
        FROM process_user 
        LEFT JOIN users ON process_user.user_id = users.id
        WHERE process_user.process_id = ?  
        `;

    if (process_id) {
      // if (status) {
      //   sql += ` AND process_user.status = ? `;
      // } else if(status == 0){
      //   sql += ` AND (process_user.status = ? OR process_user.status = ?)`;

      // }

      // else {
      //   sql += ` ;`;
      // }

      //   if (status !== undefined) {
      //     if (status === 0) {
      //         sql += ` AND (process_user.status = 0 OR process_user.status = 3)`;
      //     } else {
      //         sql += ` AND process_user.status = ?`;
      //         values.push(status);
      //     }
      // }

      //   const [result] = await pool.query(sql, [process_id, status]); 1

      let values = [process_id];

      if (status !== undefined && status !== '') {
        if (status == 0) {
          sql += ` AND (process_user.status = 0 OR process_user.status = 2)`;
        } else {
          sql += ` AND process_user.status = ?`;
          values.push(status);
        }
      }

      // sql += ` LIMIT 20 `;

      const [result] = await pool.query(sql, values);

      const newResult = result.map((item) => {
        return {
          id: item.id,
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
        // เก่า 208  = 5000 / 24
        // const newPrice = price / count_day;

        // ใหม่ 5 = 5000 / 1000
        //  5 * 50 = 250
        const price01 = Number(price) / 1000;
        const newPrice = price01 * 50;

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

export const putProcessUser = async (req, res) => {
  try {
    const { id, status } = req.body;

    if (id && status === 2) {
      const sql = ` UPDATE process_user SET status = ? WHERE id = ? `;
      await pool.query(sql, [status, id]);
      res.status(200).json({ message: "ทำรายการสำเร็จ" });
    } else {
      throw new Error("ไม่สามารถทำรายการได้");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

// User_List

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
      await pool.query(sqlUpdateProcess, [
        paidProcess,
        overdueProcess,
        process_id,
      ]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "เกิดข้อผิดพลาด" });
  }
};

// reload

export const putreLoad = async (req, res) => {
  try {
    const { process_user_id, process_id, price, count_day } = req.body;

    const sqlCheckProcessUserList = `SELECT  id, date, price FROM process_user_list WHERE process_user_id = ? AND status = ? ORDER BY date ASC  `;

    const [resultCheckProcessUserList] = await pool.query(
      sqlCheckProcessUserList,
      [process_user_id, 0]
    );
    // จำนวนวันที่ยังไม่จ่าย จำนวนคงเหลืออีก xx งวด
    const countSQl = resultCheckProcessUserList.length;

    // หาค่าใช้ จ่ายต่องวด
    const sumForPay = (price / 1000) * 50;

    // หายอดที่ยัง จ่ายไม่ครบ
    const sumNoForPay = sumForPay * countSQl;

    // คำนวณการยืมใหม่ *******************************************************************

    // ต้องการยืมใหม่ xxx - ยอดที่เหลือ
    const newSumCount = price - sumNoForPay;

    // รายการหัก / หักค่าเอกสาร 250 / หักงสดแรก / จะได้เงินจริง xxx บาท
    const sumTotal = newSumCount - 250 - sumForPay;

    // หาวันที่ตั้งต้น
    const lastDay = moment(resultCheckProcessUserList[0].date).format(
      "YYYY-MM-DD"
    );

    // UPDATE SQL ***********************************************************************
    const sqlSelect = `SELECT id FROM process_user_list WHERE process_user_id = ? `;
    const [resultSqlSelect] = await pool.query(sqlSelect, [process_user_id]);

    for (let i = 0; i < resultSqlSelect.length; i++) {
      const newDate = moment(lastDay).add(i, "days").format("YYYY-MM-DD");

      // UPDATE PROCESS_USER_LIST
      const sqlUpdateProcessUserList = `UPDATE process_user_list SET date = ?, status = ? WHERE id = ? `;
      await pool.query(sqlUpdateProcessUserList, [
        newDate,
        0,
        resultSqlSelect[i].id,
      ]);
    }

    // UPDATE ยอดรวม ต่าง ๆ **********************************************

    //   CHECK TOTAL PROCESS
    const sqlCheckProcess = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3  `;
    const [resultCheckProcess] = await pool.query(sqlCheckProcess, [
      process_id,
    ]);

    //   CHECK TOTAL PROCESS_USER
    const sqlCheck = `SELECT paid, overdue, total FROM process_user WHERE id = ? LIMIT 3  `;
    const [resultCheck] = await pool.query(sqlCheck, [process_user_id]);

    const paidTotal = Number(resultCheck[0].paid) - Number(sumNoForPay);
    const overdueTotal = Number(resultCheck[0].overdue) - Number(newSumCount);

    const paidProcess =
      Number(resultCheckProcess[0].paid) - Number(sumNoForPay);
    const overdueProcess =
      Number(resultCheckProcess[0].overdue) - Number(newSumCount);

    //   SQL UPDATE PROCESS_USER
    const sqlUpdate = `UPDATE process_user SET paid = ?, overdue = ?  WHERE id = ?   `;
    await pool.query(sqlUpdate, [paidTotal, overdueTotal, process_user_id]);

    //SQL UPDATE PROCESS
    const sqlUpdateProcess = `UPDATE process SET paid = ?, overdue = ?  WHERE id = ?   `;
    await pool.query(sqlUpdateProcess, [
      paidProcess,
      overdueProcess,
      process_id,
    ]);

    res.status(200).json({
      message: "ทำรายการสำเร็จ",
      newSum: price,
      mySum: newSumCount,
      totalSum: sumTotal,
    });
  } catch (error) {
    console.error(error);
  }
};

// Update
export const UpdateProcess = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const sql = `SELECT total, paid, overdue FROM process WHERE id = ? LIMIT 3 `;
      const [result] = await pool.query(sql, [id]);
      console.log(result[0]);
      res.status(200).json(result[0]);
    } else {
      throw new Error("ไม่พบข้อมูล");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};

export const UpdateProcessUser = async (req, res) => {
  try {
    const { id } = req.query;

    if (id) {
      const sql = `SELECT total, paid, overdue FROM process_user WHERE id = ? LIMIT 3 `;
      const [result] = await pool.query(sql, [id]);
      console.log(result[0]);
      res.status(200).json(result[0]);
    } else {
      throw new Error("ไม่พบข้อมูล");
    }
  } catch (error) {
    console.error(error);
    res.status(500).json(error.message);
  }
};
