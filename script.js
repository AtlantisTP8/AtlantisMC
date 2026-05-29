// ==========================
// CONFIG
// ==========================

const API_URL = "https://atlantismc.onrender.com";

// ==========================
// TAB SYSTEM
// ==========================

function showTab(id) {
    document.querySelectorAll(".tab").forEach(tab => {
        tab.classList.remove("active");
    });

    const el = document.getElementById(id);
    if (el) el.classList.add("active");
}

// ==========================
// TOAST SYSTEM
// ==========================

function showToast(text) {
    const toast = document.getElementById("toast");
    if (!toast) return;

    toast.innerText = text;
    toast.style.display = "block";

    clearTimeout(window.toastTimer);
    window.toastTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
}

// ==========================
// COPY IP
// ==========================

function copyIP() {
    navigator.clipboard.writeText("play.atlantismc.net");
    showToast("✔ IP kopyalandı!");
}

// ==========================
// JOIN SERVER
// ==========================

function joinServer() {
    showToast("Minecraft açılıyor...");
    window.location.href =
        "minecraft://?addExternalServer=AtlantisMC|play.atlantismc.net";
}

// ==========================
// SHOP
// ==========================

function buyRank(rank, price) {
    showToast(rank + " satın alınıyor...");

    window.open(
        `https://example.com/payment?rank=${encodeURIComponent(rank)}&price=${price}`,
        "_blank"
    );
}

// ==========================
// REGISTER (BACKEND)
// ==========================

async function registerUser() {
    const username = document.getElementById("reg-user").value.trim();
    const email = document.getElementById("reg-email").value.trim();
    const password = document.getElementById("reg-pass").value.trim();

    if (!username || !email || !password) {
        showToast("Tüm alanları doldur!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, email, password })
        });

        const data = await res.json();
        showToast(data.message || "Kayıt işlemi tamam");
        
        if (res.ok) showTab("login");

    } catch (err) {
        showToast("Sunucu hatası!");
    }
}

// ==========================
// LOGIN (BACKEND)
// ==========================

async function loginUser() {
    const username = document.getElementById("login-user").value.trim();
    const password = document.getElementById("login-pass").value.trim();

    if (!username || !password) {
        showToast("Tüm alanları doldur!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Giriş başarılı");
            loginSuccess(username);
            showTab("home");

            // local session (sadece UI için)
            localStorage.setItem("session_user", username);
        } else {
            showToast(data.message || "Giriş başarısız");
        }

    } catch (err) {
        showToast("Sunucuya bağlanılamadı!");
    }
}

// ==========================
// SESSION UI
// ==========================

function loginSuccess(username) {
    const box = document.getElementById("profile-box");
    const name = document.getElementById("profile-name");

    if (box) box.style.display = "block";
    if (name) name.innerText = "👤 " + username;
}

function logoutUser() {
    localStorage.removeItem("session_user");

    const box = document.getElementById("profile-box");
    if (box) box.style.display = "none";

    showToast("Çıkış yapıldı");
}

// ==========================
// AUTO LOGIN UI
// ==========================

document.addEventListener("DOMContentLoaded", () => {
    const user = localStorage.getItem("session_user");

    if (user) {
        loginSuccess(user);
    }
});

// ==========================
// PARTICLES (OPTIMIZED)
// ==========================

const canvas = document.getElementById("bg");

if (canvas) {
    const ctx = canvas.getContext("2d");

    let w = (canvas.width = window.innerWidth);
    let h = (canvas.height = window.innerHeight);

    const particles = Array.from({ length: 60 }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        r: Math.random() * 2 + 1,
        dx: (Math.random() - 0.5),
        dy: (Math.random() - 0.5)
    }));

    function animate() {
        ctx.clearRect(0, 0, w, h);

        for (let p of particles) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = "#38bdf8";
            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (p.x < 0 || p.x > w) p.dx *= -1;
            if (p.y < 0 || p.y > h) p.dy *= -1;
        }

        requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener("resize", () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    });
}

function resetPassword() {
    const email = document.getElementById("forgot-email").value.trim();
    const newPass = document.getElementById("new-pass").value.trim();

    if (!email || !newPass) {
        showToast("Alanları doldur!");
        return;
    }

    showToast("Şifre güncelleme backend'e gönderildi");

    fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, newPassword: newPass })
    })
    .then(res => res.json())
    .then(data => showToast(data.message || "İşlem tamam"))
    .catch(() => showToast("Sunucu hatası"));
}

async function loadUsers() {
    const admin = localStorage.getItem("session_user");

    const res = await fetch(`${API_URL}/admin/users?admin=${admin}`);
    const data = await res.json();

    const box = document.getElementById("user-list");

    box.innerHTML = "";

    data.forEach(u => {
        box.innerHTML += `
            <div style="padding:10px;margin:10px;background:#111;border-radius:10px">
                <b>${u[1]}</b> - ${u[3]}
                <button onclick="setRole('${u[1]}','admin')">Admin yap</button>
                <button onclick="setRole('${u[1]}','player')">Player yap</button>
            </div>
        `;
    });
}

async function setRole(username, role) {
    const admin = localStorage.getItem("session_user");

    await fetch(`${API_URL}/admin/set-role`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ admin, username, role })
    });

    showToast("Role güncellendi");
    loadUsers();
}

let token = localStorage.getItem("token");

async function loginUser() {
    const username = document.getElementById("login-user").value;
    const password = document.getElementById("login-pass").value;

    const res = await fetch(API_URL + "/login", {
        method: "POST",
        headers: {"Content-Type":"application/json"},
        body: JSON.stringify({username,password})
    });

    const data = await res.json();

    if(res.ok){
        localStorage.setItem("token", data.token);
        showToast("Login OK");
    } else {
        showToast(data.message);
    }
}

async function buyItem(name, price){
    const res = await fetch(API_URL + "/buy", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
            token: localStorage.getItem("token"),
            item:name,
            price:price
        })
    });

    const data = await res.json();
    showToast(data.message);
}
