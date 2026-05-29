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
    c.execute("CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, password BLOB)")
    
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
