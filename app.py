from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
import bcrypt
import jwt
import datetime

app = Flask(__name__)
CORS(app)

SECRET = "super-secret-key"

def db():
    return sqlite3.connect("users.db")

@app.route("/")
def home():
    return jsonify({"status": "OK", "message": "Atlantis API çalışıyor"})

# REGISTER
@app.route("/register", methods=["POST"])
def register():
    data = request.json
    username = data["username"]
    email = data["email"]
    password = data["password"]

    hashed = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

    conn = db()
    c = conn.cursor()
    c.execute("""
        CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        email TEXT UNIQUE,
        password BLOB,
        role TEXT DEFAULT 'player'
    )
    """)
    
    try:
        c.execute("INSERT INTO users VALUES (NULL,?,?,?)", (username, email, hashed))
        conn.commit()
    except:
        return jsonify({"message": "Kullanıcı zaten var"}), 400

    return jsonify({"message": "Kayıt başarılı"})

# LOGIN
@app.route("/login", methods=["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"]

    conn = db()
    c = conn.cursor()
    c.execute("SELECT password FROM users WHERE username=?", (username,))
    user = c.fetchone()

    if not user:
        return jsonify({"message": "Kullanıcı yok"}), 404

    if bcrypt.checkpw(password.encode(), user[0]):
        token = jwt.encode({
            "user": username,
            "exp": datetime.datetime.utcnow() + datetime.timedelta(hours=2)
        }, SECRET, algorithm="HS256")

        return jsonify({"message": "Giriş başarılı", "token": token})

    return jsonify({"message": "Hatalı şifre"}), 401


# RESET PASSWORD
@app.route("/reset-password", methods=["POST"])
def reset():
    data = request.json
    email = data["email"]
    new_pass = data["newPassword"]

    hashed = bcrypt.hashpw(new_pass.encode(), bcrypt.gensalt())

    conn = db()
    c = conn.cursor()

    c.execute("UPDATE users SET password=? WHERE email=?", (hashed, email))
    conn.commit()

    return jsonify({"message": "Şifre güncellendi"})

def check_admin(username):
    conn = db()
    c = conn.cursor()
    c.execute("SELECT role FROM users WHERE username=?", (username,))
    user = c.fetchone()
    return user and user[0] == "admin"

@app.route("/admin/users", methods=["GET"])
def get_users():
    admin = request.args.get("admin")

    if not check_admin(admin):
        return jsonify({"message": "Yetkisiz"}), 403

    conn = db()
    c = conn.cursor()
    c.execute("SELECT id, username, email, role FROM users")
    users = c.fetchall()

    return jsonify(users)

@app.route("/admin/set-role", methods=["POST"])
def set_role():
    data = request.json

    admin = data["admin"]
    target = data["username"]
    role = data["role"]

    if not check_admin(admin):
        return jsonify({"message": "Yetkisiz"}), 403

    conn = db()
    c = conn.cursor()

    c.execute("UPDATE users SET role=? WHERE username=?", (role, target))
    conn.commit()

    return jsonify({"message": "Role güncellendi"})

@app.route("/save-card", methods=["POST"])
def save_card():
    data = request.json

    username = data["username"]
    name = data["card_name"]
    number = data["card_number"]

    # SADECE SON 4 HANE
    last4 = number[-4:]

    # FAKE TOKEN (gerçek sistemde Stripe olur)
    token = "tok_" + username + last4

    conn = db()
    c = conn.cursor()

    c.execute("""
        INSERT INTO cards(username, card_name, card_last4, card_token)
        VALUES (?,?,?,?)
    """, (username, name, last4, token))

    conn.commit()

    return jsonify({
        "message": "Kart kaydedildi",
        "last4": last4
    })

@app.route("/my-cards", methods=["POST"])
def my_cards():
    data = request.json
    username = data["username"]

    conn = db()
    c = conn.cursor()

    c.execute("""
        SELECT card_name, card_last4 FROM cards WHERE username=?
    """, (username,))

    cards = c.fetchall()

    return jsonify(cards)
