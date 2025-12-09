// film-service/src/index.js
const express = require("express");
const cors = require("cors");
const filmsRoutes = require("./routes/films"); 

const app = express();
app.use(cors());
app.use(express.json());

// Santé du service
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "film-service" });
});

// Toutes les routes /films...
app.use("/films", filmsRoutes);

// 404 local
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée sur le Film-Service" });
});

app.listen(4002, () => {
  console.log("Film-Service running on http://localhost:4002");
});
