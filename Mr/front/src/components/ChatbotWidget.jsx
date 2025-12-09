import React, { useState, useRef, useEffect } from "react";
import "../styles/chatbot.css";
import api from "../api"; // on importe ton client Axios (baseURL: http://localhost:4000)

export default function ChatbotWidget() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([
    "🎬 Liste des films",
    "⭐ Acteurs populaires",
    "📈 Films les mieux notés",
    "🔍 Rechercher un film",
  ]);
  const [movies, setMovies] = useState([]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, movies]);

  const sendMessage = async (textFromSuggestion) => {
    const text = textFromSuggestion || input;
    if (!text.trim()) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setInput("");
    setLoading(true);

    try {
    
      const resp = await api.post("/bot/chat", { message: text });

      const data = resp.data;

      setMessages((prev) => [...prev, { sender: "bot", text: data.answer }]);
      setMovies(data.movies || []);

      if (data.suggestions) setSuggestions(data.suggestions);
    } catch (err) {
      console.error("Erreur appel chatbot:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error contacting API." },
      ]);
    }

    setLoading(false);
  };

  const getGreeting = () => {
    const h = new Date().getHours();
     if (h < 12) return "Bonjour";
     if (h < 18) return "Bonne après-midi";
    return "Bonsoir";

  };

  return (
    <div className="chat-root">
      {/* -------------- IMPORTANT : overlay wrapper -------------- */}
      <div className="chat-overlay">
        {/* ---------------- HERO (visible avant le 1er msg) ---------------- */}
        {messages.length === 0 && (
          <div className="hero-container">
            <p className="hero-greeting">{getGreeting()}</p>
            <h1 className="hero-title">Comment puis-je vous aider aujourd’hui?</h1>

            {/* Barre de recherche centrale */}
            <div className="hero-input-box">
              <input
                type="text"
                placeholder="Posez n’importe quelle question sur MyMovieRate…"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={() => sendMessage()}>➤</button>
            </div>

            {/* Suggestions */}
            <div className="hero-suggestions">
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  className="hero-chip"
                  onClick={() => sendMessage(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- CHAT PANEL (après 1er msg) ---------------- */}
        {messages.length > 0 && (
          <div className="chat-panel">
            {/* Messages */}
            <div className="chat-messages">
              {messages.map((m, i) => (
                <div key={i} className={`message-row ${m.sender}`}>
                  <div className="bubble">{m.text}</div>
                </div>
              ))}

              {/* Carousel de films */}
              {movies.length > 0 && (
                <div className="movie-strip">
                  {movies.map((mv, i) => (
                    <div key={i} className="movie-card">
                      {mv.poster && <img src={mv.poster} alt={mv.title} />}
                      <div className="movie-meta">
                        <h4>{mv.title}</h4>

                        {mv.rating && (
                          <div className="rating-row">
                            <span className="star">★</span>
                            <span className="rating-number">{mv.rating}</span>
                          </div>
                        )}

                        {(mv.year || mv.genre) && (
                          <p>
                            {mv.year} {mv.genre && "• " + mv.genre}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Loader typing */}
              {loading && (
                <div className="message-row bot">
                  <div className="bubble typing">
                    <span className="dot"></span>
                    <span className="dot"></span>
                    <span className="dot"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Champ input en bas */}
            <div className="chat-bottom-input">
              <input
                type="text"
                placeholder="Write a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button onClick={() => sendMessage()}>➤</button>
            </div>
          </div>
        )}
      </div>
      {/* ---------------------------------------------------------- */}
    </div>
  );
}
