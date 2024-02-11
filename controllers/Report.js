import pool from "../Connect.js";

export const ReportUsers = async (req, res) => {
  try {
    const { search } = req.query;

    let sql = `SELECT process_user.id , process_user.status, users.name, process_user.total, process_user.paid, process_user.overdue, house.name AS house_name
        FROM process_user 
        JOIN users ON process_user.user_id = users.id
        JOIN process ON process_user.process_id = process.id
        JOIN house ON process.house_id = house.id
        WHERE process_user.status = 0  `;
    if (search) {
      sql += ` AND users.name LIKE '%${search}%'  `;
    } else {
      sql += ``;
    }

    const [result] = await pool.query(sql);

    if (result) {
      const totals = { total: 0, price: 0, overdue: 0 };

      const summedData = result.reduce((acc, curr) => {
        acc.total += curr.total;
        acc.price += curr.paid;
        acc.overdue += curr.overdue;
        return acc;
      }, totals);
  
      
      res.status(200).json({ data: result, totals: summedData });
    }
  } catch (error) {
    console.error(error);
  }
};

export const ReportHouse = async (req, res) => {
    try {
      const { search } = req.query;
  
      let sql = `SELECT process_user.id , process_user.status, users.name, process_user.total, process_user.paid, process_user.overdue, house.name AS house_name
          FROM process_user 
          JOIN users ON process_user.user_id = users.id
          JOIN process ON process_user.process_id = process.id
          JOIN house ON process.house_id = house.id
          WHERE process_user.status = 0  `;
      if (search) {
        sql += ` AND house.id = ${search}  `;
      } else {
        sql += ``;
      }
  
      const [result] = await pool.query(sql);
  
      if (result) {
        const totals = { total: 0, price: 0, overdue: 0 };
  
        const summedData = result.reduce((acc, curr) => {
          acc.total += curr.total;
          acc.price += curr.paid;
          acc.overdue += curr.overdue;
          return acc;
        }, totals);
    
        
        res.status(200).json({ data: result, totals: summedData });
      }
    } catch (error) {
      console.error(error);
    }
  };

  export const ReportUserBroken = async (req, res) => {
    try {
      const { search } = req.query;
  
      let sql = `SELECT process_user.id , process_user.status, users.name, process_user.total, process_user.paid, process_user.overdue, house.name AS house_name
          FROM process_user 
          JOIN users ON process_user.user_id = users.id
          JOIN process ON process_user.process_id = process.id
          JOIN house ON process.house_id = house.id
          WHERE process_user.status = 2  `;
      if (search) {
        sql += ` AND house.id = ${search}  `;
      } else {
        sql += ``;
      }
  
      const [result] = await pool.query(sql);
  
      if (result) {
        const totals = { total: 0, price: 0, overdue: 0 };
  
        const summedData = result.reduce((acc, curr) => {
          acc.total += curr.total;
          acc.price += curr.paid;
          acc.overdue += curr.overdue;
          return acc;
        }, totals);
    
        
        res.status(200).json({ data: result, totals: summedData });
      }
    } catch (error) {
      console.error(error);
    }
  };
  
