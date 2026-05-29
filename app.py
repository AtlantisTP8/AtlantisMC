from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# ==========================
# DATABASE
# ==========================

def db():
    conn = sqlite3.connect("database.db")
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = db()
    c = conn.cursor()

    c.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )
    """)

    conn.commit()
    conn.close()

init_db()

# ==========================
# HOME TEST
# ==========================

@app.route("/")
def home():
    return jsonify({"status": "OK", "message": "Atlantis API çalışıyor"})

# ==========================
# REGISTER
# ==========================

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "Eksik bilgi"}), 400

    hashed_password = generate_password_hash(password)

    try:
        conn = db()
        c = conn.cursor()

        c.execute(
            "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
            (username, email, hashed_password)
        )

        conn.commit()
        conn.close()

        return jsonify({"message": "Kayıt başarılı"}), 200

    except sqlite3.IntegrityError:
        return jsonify({"message": "Kullanıcı zaten var"}), 409

# ==========================
# LOGIN
# ==========================

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    conn = db()
    c = conn.cursor()

    c.execute("SELECT * FROM users WHERE username = ?", (username,))
    user = c.fetchone()

    conn.close()

    if not user:
        return jsonify({"message": "Kullanıcı bulunamadı"}), 404

    if check_password_hash(user["password"], password):
        return jsonify({
            "message": "Giriş başarılı",
            "user": username
        }), 200

    return jsonify({"message": "Hatalı şifre"}), 401

# ==========================
# RUN (LOCAL ONLY)
# ==========================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)