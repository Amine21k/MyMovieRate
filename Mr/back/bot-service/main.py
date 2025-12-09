import os
from typing import List, Optional, Dict

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Float,
    Text,
    DateTime,
    ForeignKey,
    func,
)
from sqlalchemy.orm import declarative_base, sessionmaker, Session

from openai import OpenAI, RateLimitError

# ===========================
# 1) ENV & configuration
# ===========================
load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
PROJECT_THEME = os.getenv(
    "PROJECT_THEME",
    "MyMovieRate (site de notation de films et d'acteurs)",
)

DB_HOST = os.getenv("DB_HOST", "localhost")
DB_PORT = os.getenv("DB_PORT", "5432")
DB_USER = os.getenv("DB_USER", "postgres")
DB_PASSWORD = os.getenv("DB_PASSWORD", "")
DB_NAME = os.getenv("DB_NAME", "mymovierate")

if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY manquante dans .env")

# URL PostgreSQL pour SQLAlchemy
DATABASE_URL = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

client = OpenAI(api_key=OPENAI_API_KEY)

# ===========================
# 2) SQLAlchemy – connexion BD
# ===========================
engine = create_engine(DATABASE_URL, echo=False)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


# ===========================
# 3) Modèles ORM (adaptés à ton schéma)
# ===========================
class Film(Base):
    __tablename__ = "films"

    id = Column(Integer, primary_key=True, index=True)
    titre = Column(String(255), nullable=False)
    annee = Column(Integer, nullable=True)
    genre = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    affiche_url = Column(String(500), nullable=True)
    trailer_url = Column(String(500), nullable=True)


class Acteur(Base):
    __tablename__ = "acteurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), nullable=False)
    date_naissance = Column(String(50), nullable=True)
    biographie = Column(Text, nullable=True)
    photo_url = Column(String(500), nullable=True)


class Casting(Base):
    __tablename__ = "casting"

    film_id = Column(Integer, ForeignKey("films.id"), primary_key=True)
    acteur_id = Column(Integer, ForeignKey("acteurs.id"), primary_key=True)


class Rating(Base):
    __tablename__ = "ratings"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, nullable=False)
    film_id = Column(Integer, ForeignKey("films.id"), nullable=False)
    note = Column(Float, nullable=False)
    date_creation = Column(DateTime, nullable=True)


class Utilisateur(Base):
    __tablename__ = "utilisateurs"

    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), nullable=False)


class Critique(Base):
    __tablename__ = "critiques"

    id = Column(Integer, primary_key=True, index=True)
    commentaire = Column(Text, nullable=False)
    date_creation = Column(DateTime, nullable=True)
    film_id = Column(Integer, ForeignKey("films.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("utilisateurs.id"), nullable=False)


# ⚠️ On ne fait pas Base.metadata.create_all(engine)
# ta base existe déjà, on ne veut pas la modifier.


# ===========================
# 4) FastAPI
# ===========================
app = FastAPI(title="Chatbot MyMovieRate (OpenAI + DB directe)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tu peux restreindre à ton front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ===========================
# 5) Modèles Pydantic (API)
# ===========================
class ChatRequest(BaseModel):
    message: str


class Movie(BaseModel):
    title: str
    year: Optional[int] = None
    genre: Optional[str] = None
    rating: Optional[float] = None
    poster: Optional[str] = None


class ChatResponse(BaseModel):
    answer: str
    suggestions: List[str]
    movies: List[Movie]


# ===========================
# 6) System prompt OpenAI
# ===========================
SYSTEM_PROMPT = f"""
Tu es le chatbot officiel du projet {PROJECT_THEME}.

RÈGLES IMPORTANTES :
Tu aides l'utilisateur à propos des FILMS, SÉRIES et ACTEURS.
Tu peux utiliser :
- les données de la base MyMovieRate (films, acteurs, notes, etc.)
- et tes connaissances générales sur le cinéma.

FORMAT DES RÉPONSES (TRÈS IMPORTANT) :

1) Règles générales de style
- Tu réponds TOUJOURS en FRANÇAIS.
- Tu n'écris JAMAIS un gros bloc de texte.
- Tu structures toujours ta réponse avec des lignes et des listes.
- Tu vas à l’essentiel : phrases courtes, claires.


2) Quand on te demande un film précis
Tu utilises ce format, dans cet ordre :

Titre : ...
Année : ...
Genre : ...
Note MyMovieRate : ... / 10 (ou "Non noté dans MyMovieRate")
Acteurs principaux : ...
Résumé : ...

3) Quand on te demande une liste de films (top, recommandations, etc.)
- Tu écris une phrase d’introduction très courte (1 ligne max).
- Puis tu listes les films avec des puces, par exemple :

- Interstellar (2014) – Science-Fiction – Note : 7.7 / 10
- Inception (2010) – Science-Fiction – Note : 8.5 / 10
- The Dark Knight (2008) – Action – Note : 9.0 / 10

4) Quand on te demande des acteurs
Même logique : une petite intro puis une liste :

- Leonardo DiCaprio : acteur américain, connu pour Inception, Shutter Island…
- Matthew McConaughey : connu pour Interstellar, Dallas Buyers Club…
- Anne Hathaway : connue pour Interstellar, The Dark Knight Rises…

5) Questions hors cinéma
Si la question n'a aucun lien avec les films, les séries, les acteurs
ou le projet MyMovieRate, tu expliques gentiment que tu es surtout fait
pour parler de cinéma et de MyMovieRate.

Respecte STRICTEMENT ce format : phrases courtes + listes + retours à la ligne.

"""


# ===========================
# 7) Fonctions utilitaires BD
# ===========================
def fetch_films_acteurs_ratings(db: Session):
    """Charge les films, les acteurs, les castings et les moyennes de notes."""
    films: List[Film] = db.query(Film).all()
    acteurs: List[Acteur] = db.query(Acteur).all()

    # Moyenne de rating par film
    rating_rows = (
        db.query(
            Rating.film_id,
            func.avg(Rating.note).label("moyenne"),
            func.count(Rating.id).label("nb_notes"),
        )
        .group_by(Rating.film_id)
        .all()
    )
    ratings_map: Dict[int, Dict[str, float]] = {
        r.film_id: {"moyenne": float(r.moyenne or 0), "nb_notes": int(r.nb_notes)}
        for r in rating_rows
    }

    # Acteurs par film
    casting_rows = (
        db.query(Casting.film_id, Acteur.nom)
        .join(Acteur, Casting.acteur_id == Acteur.id)
        .all()
    )
    acteurs_par_film: Dict[int, List[str]] = {}
    for row in casting_rows:
        acteurs_par_film.setdefault(row.film_id, []).append(row.nom)

    return films, acteurs, ratings_map, acteurs_par_film


def map_film_to_movie(
    f: Film,
    ratings_map: Dict[int, Dict[str, float]],
) -> Movie:
    """Convertit un Film ORM en Movie Pydantic pour le frontend."""
    rating = None
    rinfo = ratings_map.get(f.id)
    if rinfo:
        raw = rinfo.get("moyenne")
        rating = round(raw, 1) if raw is not None else None

    return Movie(
        title=f.titre,
        year=f.annee,
        genre=f.genre,
        rating=rating,
        poster=f.affiche_url,
    )


def build_db_context(
    films: List[Film],
    acteurs: List[Acteur],
    ratings_map: Dict[int, Dict[str, float]],
    acteurs_par_film: Dict[int, List[str]],
) -> str:
    """
    Construit le "catalogue" texte pour OpenAI,
    avec films + acteurs + moyennes.
    """
    lines: List[str] = []

    if films:
        lines.append("=== LISTE DES FILMS DANS MYMOVIERATE ===")
        for f in films[:40]:
            line = f"- Titre: {f.titre}"
            if f.annee:
                line += f" | Année: {f.annee}"
            if f.genre:
                line += f" | Genre: {f.genre}"

            rinfo = ratings_map.get(f.id)
            if rinfo:
                line += f" | Note moyenne: {rinfo['moyenne']:.2f} ({rinfo['nb_notes']} notes)"

            acteurs_film = acteurs_par_film.get(f.id, [])
            if acteurs_film:
                line += " | Acteurs principaux: " + ", ".join(acteurs_film[:3])

            if f.description:
                short_desc = f.description[:200] + (
                    "..." if len(f.description) > 200 else ""
                )
                line += f" | Description: {short_desc}"

            lines.append(line)

    if acteurs:
        lines.append("\n=== LISTE DES ACTEURS DANS MYMOVIERATE ===")
        for a in acteurs[:40]:
            line = f"- Nom: {a.nom}"
            if a.biographie:
                short_bio = a.biographie[:150] + (
                    "..." if len(a.biographie) > 150 else ""
                )
                line += f" | Bio: {short_bio}"
            lines.append(line)

    if not lines:
        return "La base MyMovieRate est vide (aucun film, aucun acteur)."

    return "\n".join(lines)


def find_relevant_films(
    user_message: str,
    films: List[Film],
    acteurs_par_film: Dict[int, List[str]],
) -> List[Film]:
    """
    Essaie de trouver les films pertinents par rapport à la question.
    Matching simple sur le titre et sur les noms d'acteurs.
    """
    msg = user_message.lower().strip()
    if not films:
        return []

    if len(msg) < 3:
        return films

    words = [w for w in msg.split() if len(w) > 2]
    relevant: List[Film] = []

    for f in films:
        titre = (f.titre or "").lower()
        acteurs_film = [n.lower() for n in acteurs_par_film.get(f.id, [])]

        match_titre = any(w in titre for w in words)
        match_acteur = any(
            any(w in actor_name for w in words) for actor_name in acteurs_film
        )

        if match_titre or match_acteur:
            relevant.append(f)

    return relevant if relevant else films


def build_suggestions(user_message: str) -> List[str]:
    msg = user_message.lower()

    if "top" in msg or "mieux notés" in msg or "meilleurs" in msg:
        return [
            "📈 Films les mieux notés",
            "🎬 Liste de tous les films",
            "🎭 Recommandation par genre",
        ]

    if "acteur" in msg or "actrice" in msg:
        return [
            "⭐ Liste des acteurs",
            "🎬 Films d’un acteur spécifique",
        ]

    if "film" in msg:
        return [
            "🎬 Liste des films",
            "📈 Films les mieux notés",
            "🔍 Chercher un film par titre",
        ]

    return [
        "🎬 Liste des films",
        "⭐ Liste des acteurs",
        "📈 Films les mieux notés",
    ]


# ===========================
# 8) Endpoint /health (optionnel)
# ===========================
@app.get("/health")
def health():
    return {"status": "ok", "service": "bot-service"}


# ===========================
# 9) Endpoint /chat
# ===========================
@app.post("/chat", response_model=ChatResponse)
def chat(req: ChatRequest):
    user_message = req.message.strip()

    db = SessionLocal()
    try:
        films, acteurs, ratings_map, acteurs_par_film = fetch_films_acteurs_ratings(db)
    finally:
        db.close()

    # Films pertinents pour le carrousel
    relevant_films = find_relevant_films(user_message, films, acteurs_par_film)

    # Contexte texte pour OpenAI
    db_context = build_db_context(films, acteurs, ratings_map, acteurs_par_film)

    # Suggestions pour le frontend
    suggestions = build_suggestions(user_message)

    # Appel OpenAI avec gestion du quota
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {
                    "role": "system",
                    "content": (
                            "Voici les données de la base MyMovieRate "
                            "(films, acteurs, notes, etc.). "
                            "Utilise-les en priorité quand tu parles de ces films, "
                            "mais tu peux aussi t'appuyer sur tes connaissances générales "
                            "sur le cinéma si besoin :\n\n"
                            + db_context
                    ),
                },
                {"role": "user", "content": user_message},
            ],
        )

        answer = completion.choices[0].message.content

    except RateLimitError:
        answer = (
            "Je suis connecté à la base MyMovieRate, mais je ne peux pas générer "
            "de réponse détaillée pour l’instant car le service d’IA n’a plus de quota. "
            "Les informations sur les films et acteurs restent disponibles dans le site."
        )
    except Exception as e:
        print("Erreur OpenAI:", e)
        answer = (
            "Une erreur s’est produite lors de la génération de la réponse. "
            "Réessaie plus tard."
        )

    # Films pour le carrousel dans le front
    movies_for_front = [
        map_film_to_movie(f, ratings_map) for f in relevant_films[:10]
    ]

    return ChatResponse(
        answer=answer,
        suggestions=suggestions,
        movies=movies_for_front,
    )
