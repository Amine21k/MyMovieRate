import { useState } from "react";

export default function FilmTrailer({ trailerUrl }) {
  const [isZoomed, setIsZoomed] = useState(false);

  if (!trailerUrl) return null;

  const getEmbedUrl = (url) => {
    try {
      const u = new URL(url);

      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      }

      if (u.hostname === "youtu.be") {
        const id = u.pathname.slice(1);
        return `https://www.youtube.com/embed/${id}`;
      }

      return url;
    } catch {
      return url;
    }
  };

  const embedUrl = getEmbedUrl(trailerUrl);

  return (
    <section className="section trailer-section">
      <h3 className="section-title">Bande-annonce</h3>

      <div className="trailer-section-inner">
        <div
          className={`trailer-zoom-box ${isZoomed ? "zoomed" : ""}`}
          onClick={() => setIsZoomed(!isZoomed)}
        >
          <iframe
            className="trailer-zoom-iframe"
            src={embedUrl}
            title="Trailer"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      
    </section>
  );
}

