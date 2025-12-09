// user-service/src/index.js
const express = require("express");
const cors = require("cors");

const utilisateursRoutes = require("./routes/utilisateurs");
const meRoutes = require("./routes/me");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/utilisateurs", utilisateursRoutes);
app.use("/me", meRoutes);

app.listen(4004, () => {
  console.log("User-Service running on http://localhost:4004");
});
