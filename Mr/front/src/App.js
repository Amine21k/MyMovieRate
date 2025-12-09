// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import FilmsList from "./pages/FilmsList";
import FilmDetail from "./pages/FilmDetail";
import AccountPage from "./pages/AccountPage";
import ActorDetail from "./pages/ActorDetail";

import AdminRoute from "./components/AdminRoute";
import AdminFilms from "./pages/admin/AdminFilms";
import AdminActeurs from "./pages/admin/AdminActeurs";
import AdminFilmCasting from "./pages/admin/AdminFilmCasting";
import AdminUtilisateurs from "./pages/admin/AdminUtilisateurs";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCritiques from "./pages/admin/AdminCritiques";
import ChatbotWidget from "./components/ChatbotWidget";

import api from "./api";

function App() {
  const [user, setUser] = useState(null);

  const [films, setFilms] = useState([]);
  const [acteurs, setActeurs] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState("");
  const [search, setSearch] = useState("");

  // Récupération user depuis localStorage
  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        setUser(parsed);
      } catch (e) {
        console.error("Erreur parsing user localStorage", e);
      }
    }
  }, []);

  // Chargement global des films + acteurs pour Navbar + Home
  useEffect(() => {
    const fetchData = async () => {
      try {
        setDataLoading(true);
        setDataError("");

        const [filmsRes, acteursRes] = await Promise.all([
          api.get("/films"),
          api.get("/acteurs"),
        ]);

        const filmsList = Array.isArray(filmsRes.data?.data)
          ? filmsRes.data.data
          : [];
        const acteursList = Array.isArray(acteursRes.data?.data)
          ? acteursRes.data.data
          : [];

        setFilms(filmsList);
        setActeurs(acteursList);
      } catch (err) {
        console.error("Erreur chargement données globales :", err);
        setDataError("Impossible de charger les films et les acteurs.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <BrowserRouter>
      {/* NAVBAR globale */}
      <Navbar
        films={films}
        acteurs={acteurs}
        search={search}
        onSearchChange={setSearch}
      />

      <div style={{ padding: "20px" }}>
        <Routes>
          {/* PUBLIC */}
          <Route
            path="/"
            element={
              <Home
                films={films}
                acteurs={acteurs}
                search={search}
                onSearchChange={setSearch}
                loading={dataLoading}
                error={dataError}
              />
            }
          />

          <Route path="/films" element={<FilmsList />} />
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/register" element={<Register />} />
          <Route path="/mon-compte" element={<AccountPage />} />
          <Route path="/films/:id" element={<FilmDetail />} />
          <Route path="/acteurs/:id" element={<ActorDetail />} />


          <Route path="/chatbot" element={<ChatbotWidget />} />

         
          <Route
            path="/admin"
            element={
              <AdminRoute user={user}>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/films"
            element={
              <AdminRoute user={user}>
                <AdminFilms />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/acteurs"
            element={
              <AdminRoute user={user}>
                <AdminActeurs />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/utilisateurs"
            element={
              <AdminRoute user={user}>
                <AdminUtilisateurs />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/films/:id/casting"
            element={
              <AdminRoute user={user}>
                <AdminFilmCasting />
              </AdminRoute>
            }
          />

          
          <Route
            path="/admin/critiques"
            element={
              <AdminRoute user={user}>
                <AdminCritiques />
              </AdminRoute>
            }
          />
        </Routes>
      </div>
      
    </BrowserRouter>
  );
}

export default App;
