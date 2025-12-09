// auth-service/src/index.js
const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth-route");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.listen(4001, () => {
  console.log("Auth-Service running on http://localhost:4001");
});
