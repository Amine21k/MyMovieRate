// src/pages/admin/AdminUtilisateurs.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api";
import "../../styles/AdminUtilisateurs.css";

export default function AdminUtilisateurs() {
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // recherche + tri
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("recent"); // recent, nom_asc, nom_desc, role_admin, role_user

  const fetchUtilisateurs = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/utilisateurs");
      // même format que films/acteurs : { data: [...] }
      const list = Array.isArray(res.data?.data) ? res.data.data : [];
      setUtilisateurs(list);
    } catch (err) {
      console.error("Erreur chargement utilisateurs :", err);
      setError("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilisateurs();
  }, []);

  const handleToggleRole = async (user) => {
    const currentRole = (user.role || "").toLowerCase();
    const newRole = currentRole === "admin" ? "user" : "admin";

    if (
      !window.confirm(
        `Confirmer le changement de rôle pour ${
          user.nom || user.email
        } :\n${currentRole || "(aucun)"} → ${newRole}`
      )
    ) {
      return;
    }

    try {
      setError("");
      await api.patch(`/utilisateurs/${user.id}`, { role: newRole });

      // maj locale
      setUtilisateurs((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error("Erreur changement de rôle :", err);
      setError("Erreur lors du changement de rôle.");
    }
  };

  const handleDelete = async (id, label) => {
    if (!window.confirm(`Supprimer l'utilisateur ${label} ?`)) return;

    try {
      setError("");
      await api.delete(`/utilisateurs/${id}`);
      setUtilisateurs((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      console.error("Erreur suppression utilisateur :", err);
      setError("Erreur lors de la suppression de l'utilisateur.");
    }
  };

  const formatRole = (role) => {
    const r = (role || "").toLowerCase();
    if (!r) return "inconnu";
    if (r === "admin") return "admin";
    return "user";
  };

  // ---- RECHERCHE + TRI ----
  const getFilteredAndSortedUsers = () => {
    if (!Array.isArray(utilisateurs)) return [];

    const term = search.trim().toLowerCase();

    let filtered = utilisateurs;

    if (term) {
      filtered = utilisateurs.filter((u) => {
        const nom = (u.nom || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        return nom.includes(term) || email.includes(term);
      });
    }

    const sorted = [...filtered].sort((a, b) => {
      const aNom = (a.nom || "").toLowerCase();
      const bNom = (b.nom || "").toLowerCase();
      const aRole = formatRole(a.role);
      const bRole = formatRole(b.role);

      switch (sortKey) {
        case "nom_asc":
          return aNom.localeCompare(bNom);
        case "nom_desc":
          return bNom.localeCompare(aNom);
        case "role_admin":
          // admins d'abord
          return (bRole === "admin") - (aRole === "admin");
        case "role_user":
          // users d'abord
          return (bRole === "user") - (aRole === "user");
        case "recent":
        default:
          // id le plus grand = plus récent
          return (b.id || 0) - (a.id || 0);
      }
    });

    return sorted;
  };

  const filteredUsers = getFilteredAndSortedUsers();

  // 🔹 Limiter le nombre d’utilisateurs affichés
  const MAX_USERS_DISPLAY = 20; // change le nombre si tu veux
  const limitedUsers = filteredUsers.slice(0, MAX_USERS_DISPLAY);

  return (
    <div className="container admin-users-page">
      {/* HEADER */}
      <div className="card admin-users-header admin-card-elevated">
        <div>
          <h1 className="page-title">Admin – Utilisateurs</h1>
          <p className="admin-subtitle">
            Gère les comptes : rôles et suppression des utilisateurs.
          </p>
        </div>
        <div className="admin-header-right">
          <Link to="/admin" className="btn btn-ghost">
            ← Dashboard
          </Link>
          <span className="admin-badge">
            {utilisateurs.length} utilisateur
            {utilisateurs.length > 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {error && (
        <div className="card admin-error admin-card-elevated">
          <p>{error}</p>
        </div>
      )}

      <div className="card admin-users-card admin-card-elevated">
        <div className="admin-list-header">
          <h2 className="admin-section-title">Liste des utilisateurs</h2>

          {/* TOOLBAR RECHERCHE + TRI */}
          <div className="admin-list-toolbar">
            <input
              type="text"
              className="input admin-search-input"
              placeholder="Rechercher par nom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="input admin-sort-select"
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value)}
            >
              <option value="recent">Plus récents</option>
              <option value="nom_asc">Nom A → Z</option>
              <option value="nom_desc">Nom Z → A</option>
              <option value="role_admin">Admins d’abord</option>
              <option value="role_user">Users d’abord</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p>Chargement...</p>
        ) : !Array.isArray(utilisateurs) || utilisateurs.length === 0 ? (
          <p>Aucun utilisateur pour le moment.</p>
        ) : filteredUsers.length === 0 ? (
          <p>Aucun utilisateur ne correspond à votre recherche.</p>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {limitedUsers.map((u) => {
                  const role = formatRole(u.role);
                  const isAdmin = role === "admin";
                  const label = u.nom || u.email || `#${u.id}`;

                  return (
                    <tr key={u.id}>
                      <td>{u.id}</td>
                      <td>{u.nom || "-"}</td>
                      <td>{u.email}</td>
                      <td>
                        <span
                          className={
                            "role-badge " +
                            (isAdmin ? "role-admin" : "role-user")
                          }
                        >
                          {role}
                        </span>
                      </td>
                      <td className="col-actions">
                        <button
                          className="btn btn-small"
                          onClick={() => handleToggleRole(u)}
                        >
                          {isAdmin ? "Passer user" : "Passer admin"}
                        </button>
                        <button
                          className="btn btn-small btn-danger"
                          onClick={() => handleDelete(u.id, label)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredUsers.length > MAX_USERS_DISPLAY && (
              <p className="admin-list-info">
                Affichage des {MAX_USERS_DISPLAY} premiers résultats sur{" "}
                {filteredUsers.length}.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
