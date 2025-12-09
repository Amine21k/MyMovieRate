// api-gateway/index.js
const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();
app.use(cors());


// 🩺 Santé de la gateway
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "api-gateway" });
});

/* -------------------- AUTH-SERVICE -------------------- */
// Le service auth expose normalement /auth/login et /auth/register
// Donc on pointe la Gateway sur http://localhost:4001/auth
app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost:4001/auth", // ⬅️ important
    changeOrigin: true,
  })
);

/* -------------------- USER-SERVICE -------------------- */
app.use(
  "/utilisateurs",
  createProxyMiddleware({
    target: "http://localhost:4004/utilisateurs", // User-Service
    changeOrigin: true,
  })
);

app.use(
  "/me",
  createProxyMiddleware({
    target: "http://localhost:4004/me", // User-Service
    changeOrigin: true,
  })
);

/* -------------------- ACTOR-SERVICE -------------------- */
app.use(
  "/acteurs",
  createProxyMiddleware({
    target: "http://localhost:4003/acteurs", // Actor-Service
    changeOrigin: true,
  })
);

/* -------------------- FILM + RATINGS/CRITIQUES + CASTING -------------------- */
app.use(
  "/films",
  createProxyMiddleware({
    changeOrigin: true,
    target: "http://localhost:4002/films", // défaut : Film-Service

    router: (req) => {
      const fullPath = req.originalUrl || req.url; // ex: /films/1/acteurs/2

      // 1) CASTING : /films/:filmId/acteurs ou /films/:filmId/acteurs/:acteurId
      if (/^\/films\/\d+\/acteurs(\/\d+)?\/?$/.test(fullPath)) {
        // On garde le path original (/films/1/acteurs/2)
        // mais on change juste le host/port → actor-service
        return "http://localhost:4003/films"; // Actor-Service
      }

      // 2) /films/:id/ratings ou /films/:id/critiques -> review-service
      if (/^\/films\/\d+\/(ratings|critiques)\/?$/.test(fullPath)) {
        return "http://localhost:4005/films"; // Review-Service
      }

      // 3) /films/critiques (liste admin, delete) -> review-service
      if (/^\/films\/critiques(\/.*)?$/.test(fullPath)) {
        return "http://localhost:4005/films";
      }

      // 4) Sinon → Film-Service
      return "http://localhost:4002/films";
    },
  })
);



/* -------------------- BOT-SERVICE (FastAPI) -------------------- */
app.use(
  "/bot",
  createProxyMiddleware({
    target: "http://localhost:4006", // FastAPI bot-service (uvicorn)
    changeOrigin: true,
    pathRewrite: {
      "^/bot": "", // /bot/chat -> /chat
    },
  })
);




/* -------------------- 404 PAR DÉFAUT -------------------- */
app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée sur l'API Gateway" });
});

app.listen(4000, () => {
  console.log("API Gateway running on http://localhost:4000");
});
