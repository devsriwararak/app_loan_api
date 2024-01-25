import express from "express";
import pool from "./Connect.js";
import cors from 'cors'

// routers
import userRouter from "./routes/User.js";
import loginRouter from "./routes/Login.js";
import houseRouter from "./routes/House.js";

const app = express();
const port = 3000;

app.use(cors())
app.use(express.json())



app.use("/api/users", userRouter);
app.use("/api/login", loginRouter);
app.use("/api/house", houseRouter);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});





