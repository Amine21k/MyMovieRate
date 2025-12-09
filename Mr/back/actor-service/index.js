// actor-service/src/index.js
const express = require("express");
const cors = require("cors");

const acteursRoutes = require("./routes/acteurs");
const castingRoutes = require("./routes/casting");

const app = express();
app.use(cors());
app.use(express.json());

// CRUD acteurs
app.use("/acteurs", acteursRoutes);

// Casting (films ↔ acteurs)
// → /films/:filmId/acteurs
// → /acteurs/:acteurId/films
app.use("/", castingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "actor-service" });
});

app.listen(4003, () => {
  console.log("Actor-Service running on http://localhost:4003");
});
