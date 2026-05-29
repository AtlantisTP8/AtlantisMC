from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
import jwt
import datetime

app = Flask(__name__)
CORS(app)

SECRET = "super-secret-key"

# ==========================
# DB CONNECTION
# ==========================
def db():
    conn = sqlite3.connect("users.db", check_same_thread=False)
    return conn


# ==========================
# INIT DB (SAFE)
# ==========================
def init_db():
    conn = db()
    c = conn.cursor()

    c.execute("""
        CREATE TABLE IF NOT EXISTS users(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'player'
        )
    """)

    c.execute("""
        CREATE TABLE IF NOT EXISTS cards(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            card_name TEXT,
            card_last4 TEXT,
            card_token TEXT
        )
    """)

    conn.commit()
    conn.close()


# ==========================
# HOME
# ==========================
@app.route("/")
def home():
    return jsonify({"status": "OK", "message": "Atlantis API çalışıyor"})


# ==========================
# REGISTER
# ==========================
@app.route("/register", methods=["POST"])
def register():
    data = request.json

    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if not username or not email or not password:
        return jsonify({"message": "Eksik bilgi"}), 400

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()

    conn = db()
    c = conn.cursor()

    try:
        c.execute(
            "INSERT INTO users (username, email, password) VALUES (?,?,?)",
            (username, email, hashed)
        )
        conn.commit()
    except:
        return jsonify({"message": "Kullanıcı zaten var"}), 400
    finally:
        conn.close()

    return jsonify({"message": "Kayıt başarılı"})


# ==========================
# LOGIN
# ==========================
@app.route("/login", methods=["POST"])
def login():
    data = request.json

    username = data.get("username")
    password = data.get("password")

    conn = db()
    c = conn.cursor()

    c.execute("SELECT password FROM users WHERE username=?", (username,))
    user = c.fetchone()
    conn.close()

    if not user:
        return jsonify({"message": "Kullanıcı yok"}), 404

    if bcrypt.checkpw(password.encode(), user[0].encode()):
        token = jwt.encode({
            "user": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET, algorithm="HS256")

        return jsonify({"message": "Giriş başarılı", "token": token})

    return jsonify({"message": "Hatalı şifre"}), 401


# ==========================
# RESET PASSWORD
# ==========================
@app.route("/reset-password", methods=["POST"])
def reset():
    data = request.json

    email = data.get("email")
    new_pass = data.get("newPassword")

    if not email or not new_pass:
        return jsonify({"message": "Eksik bilgi"}), 400

    hashed = bcrypt.hashpw(new_pass.encode(), bcrypt.gensalt()).decode()

    conn = db()
    c = conn.cursor()

    c.execute("UPDATE users SET password=? WHERE email=?", (hashed, email))
    conn.commit()
    conn.close()

    return jsonify({"message": "Şifre güncellendi"})


# ==========================
# JWT VERIFY
# ==========================
def verify_token(token):
    try:
        decoded = jwt.decode(token, SECRET, algorithms=["HS256"])
        return decoded["user"]
    except:
        return None


# ==========================
# SAVE CARD (SECURE)
# ==========================
@app.route("/save-card", methods=["POST"])
def save_card():
    data = request.json

    token = data.get("token")
    name = data.get("card_name")
    number = data.get("card_number")

    username = verify_token(token)
    if not username:
        return jsonify({"message": "Unauthorized"}), 403

    if not name or not number:
        return jsonify({"message": "Eksik kart bilgisi"}), 400

    last4 = number[-4:]
    card_token = f"tok_{username}_{last4}"

    conn = db()
    c = conn.cursor()

    c.execute("""
        INSERT INTO cards(username, card_name, card_last4, card_token)
        VALUES (?,?,?,?)
    """, (username, name, last4, card_token))

    conn.commit()
    conn.close()

    return jsonify({"message": "Kart kaydedildi", "last4": last4})


# ==========================
# GET MY CARDS
# ==========================
@app.route("/my-cards", methods=["POST"])
def my_cards():
    data = request.json

    username = verify_token(data.get("token"))
    if not username:
        return jsonify({"message": "Unauthorized"}), 403

    conn = db()
    c = conn.cursor()

    c.execute("""
        SELECT card_name, card_last4 FROM cards WHERE username=?
    """, (username,))

    cards = c.fetchall()
    conn.close()

    return jsonify(cards)


# ==========================
# START SERVER
# ==========================
if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)
