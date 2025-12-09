// review-service/src/index.js
const express = require("express");
const cors = require("cors");

const ratingsRoutes = require("./routes/ratings");
const critiquesRoutes = require("./routes/critiques");

const app = express();
app.use(cors());
app.use(express.json());

// → /films/:id/ratings, /films/:id/critiques, /films/critiques...
app.use("/films", ratingsRoutes);
app.use("/films", critiquesRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "review-service" });
});

app.listen(4005, () => {
  console.log("Review-Service running on http://localhost:4005");
});
