// ==========================
// TAB SYSTEM
// ==========================

function showTab(id) {

    const tabs = document.querySelectorAll(".tab");

    tabs.forEach(tab => {
        tab.classList.remove("active");
    });

    const selected = document.getElementById(id);

    if (selected) {
        selected.classList.add("active");
    }
}

// ==========================
// COPY IP
// ==========================

function copyIP() {

    navigator.clipboard.writeText("play.atlantismc.net");

    showToast("✔ IP copied!");
}

// ==========================
// PLAY BUTTON
// ==========================

function joinServer() {

    showToast("Launching Minecraft...");

    window.location.href =
        "minecraft://?addExternalServer=AtlantisMC|play.atlantismc.net";
}

// ==========================
// TOAST
// ==========================

function showToast(text) {

    const toast = document.getElementById("toast");

    toast.innerText = text;
    toast.style.display = "block";

    clearTimeout(window.toastTimer);

    window.toastTimer = setTimeout(() => {
        toast.style.display = "none";
    }, 2000);
}

// ==========================
// SHOP CARDS CLICK
// ==========================

document.addEventListener("DOMContentLoaded", () => {

    const cards = document.querySelectorAll(".rank");

    cards.forEach(card => {

        card.addEventListener("click", () => {

            const title =
                card.querySelector("h3").innerText;

            showToast(title + " selected!");
        });

    });

});

// ==========================
// PARTICLE BACKGROUND
// ==========================

const canvas = document.getElementById("bg");

if (canvas) {

    const ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let particles = [];

    for (let i = 0; i < 80; i++) {

        particles.push({

            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,

            r: Math.random() * 2 + 1,

            dx: (Math.random() - 0.5),

            dy: (Math.random() - 0.5)

        });

    }

    function drawParticles() {

        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        particles.forEach(p => {

            ctx.beginPath();

            ctx.arc(
                p.x,
                p.y,
                p.r,
                0,
                Math.PI * 2
            );

            ctx.fillStyle = "#38bdf8";

            ctx.fill();

            p.x += p.dx;
            p.y += p.dy;

            if (
                p.x < 0 ||
                p.x > canvas.width
            ) {
                p.dx *= -1;
            }

            if (
                p.y < 0 ||
                p.y > canvas.height
            ) {
                p.dy *= -1;
            }

        });

        requestAnimationFrame(
            drawParticles
        );
    }

    drawParticles();

    window.addEventListener(
        "resize",
        () => {

            canvas.width =
                window.innerWidth;

            canvas.height =
                window.innerHeight;

        }
    );

}

function buyRank(rank, price){

    showToast(
        rank + " satın alınıyor..."
    );

    // ödeme sayfası
    // buraya Stripe / iyzico linki

    window.open(
        "https://example.com/payment?rank="
        + rank
        + "&price="
        + price,
        "_blank"
    );
}

function showTab(id){

    document
        .querySelectorAll(".tab")
        .forEach(t=>t.classList.remove("active"));

    document
        .getElementById(id)
        .classList.add("active");
}

function showToast(text){

    const toast =
        document.getElementById("toast");

    toast.innerText = text;

    toast.style.display = "block";

    setTimeout(()=>{

        toast.style.display="none";

    },2000);
}

// REGISTER

async function registerUser(){

    const username =
        document.getElementById(
            "reg-user"
        ).value;

    const email =
        document.getElementById(
            "reg-email"
        ).value;

    const password =
        document.getElementById(
            "reg-pass"
        ).value;

    const res =
        await fetch("/register",{

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            username,
            email,
            password

        })

    });

    const data =
        await res.json();

    showToast(data.message);
}

// LOGIN

async function loginUser(){

    const username =
        document.getElementById(
            "login-user"
        ).value;

    const password =
        document.getElementById(
            "login-pass"
        ).value;

    const res =
        await fetch("/login",{

        method:"POST",

        headers:{
            "Content-Type":
            "application/json"
        },

        body:JSON.stringify({

            username,
            password

        })

    });

    const data =
        await res.json();

    showToast(data.message);
}

// ==========================
// LOCAL USERS
// ==========================

let users =
JSON.parse(
localStorage.getItem("users")
) || [];

// ==========================
// REGISTER
// ==========================

function registerUser(){

    const username =
    document.getElementById(
        "reg-user"
    ).value.trim();

    const email =
    document.getElementById(
        "reg-email"
    ).value.trim();

    const password =
    document.getElementById(
        "reg-pass"
    ).value.trim();

    if(
        !username ||
        !email ||
        !password
    ){
        showToast(
            "Tüm alanlar zorunlu."
        );
        return;
    }

    const exists =
    users.find(u =>
        u.username === username ||
        u.email === email
    );

    if(exists){

        showToast(
            "Bu kullanıcı kayıtlı."
        );

        return;
    }

    users.push({

        username,
        email,
        password

    });

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    showToast(
        "Kayıt başarılı."
    );

    showTab("login");
}

// ==========================
// LOGIN
// ==========================

function loginUser(){

    const username =
    document.getElementById(
        "login-user"
    ).value.trim();

    const password =
    document.getElementById(
        "login-pass"
    ).value.trim();

    if(
        !username ||
        !password
    ){
        showToast(
            "Tüm alanlar zorunlu."
        );
        return;
    }

    const user =
    users.find(u =>

        u.username === username &&
        u.password === password

    );

    if(!user){

        showToast(
            "Bilgiler yanlış."
        );

        return;
    }

    showToast(
        "Hoş geldin " + username
    );
}

// ==========================
// RESET PASSWORD
// ==========================

function resetPassword(){

    const email =
    document.getElementById(
        "forgot-email"
    ).value.trim();

    const newPass =
    document.getElementById(
        "new-pass"
    ).value.trim();

    if(
        !email ||
        !newPass
    ){
        showToast(
            "Alanları doldur."
        );
        return;
    }

    const user =
    users.find(u =>
        u.email === email
    );

    if(!user){

        showToast(
            "Email bulunamadı."
        );

        return;
    }

    user.password =
    newPass;

    localStorage.setItem(
        "users",
        JSON.stringify(users)
    );

    showToast(
        "Şifre güncellendi."
    );

    showTab("login");
}

function clearErrors(){

[
"reg-user-error",
"reg-email-error",
"reg-pass-error",
"login-user-error",
"login-pass-error"

].forEach(id=>{

const el =
document.getElementById(id);

if(el){
el.innerText="";
}

});
}

function toggleProfileMenu(){

const menu =
document.getElementById(
"profile-menu"
);

menu.style.display =
menu.style.display === "block"
? "none"
: "block";
}

function loginSuccess(username){

document.getElementById(
"profile-box"
).style.display = "block";

document.getElementById(
"profile-name"
).innerText =
"👤 " + username;
}

function logoutUser(){

document.getElementById(
"profile-box"
).style.display =
"none";

showToast(
"Çıkış yapıldı."
);
}

function saveCard(){

const card = {

name:
document.getElementById(
"card-name"
).value,

number:
document.getElementById(
"card-number"
).value,

date:
document.getElementById(
"card-date"
).value,

cvv:
document.getElementById(
"card-cvv"
).value

};

if(
!card.name ||
!card.number ||
!card.date ||
!card.cvv
){
showToast(
"Kart bilgileri eksik."
);
return;
}

localStorage.setItem(
"card",
JSON.stringify(card)
);

showToast(
"Kart kaydedildi."
);
}

function registerUser(){

clearErrors();

const username =
document.getElementById(
"reg-user"
).value;

const email =
document.getElementById(
"reg-email"
).value;

const password =
document.getElementById(
"reg-pass"
).value;

if(!username){
document.getElementById(
"reg-user-error"
).innerText =
"Kullanıcı adı gerekli.";
return;
}

if(!email){
document.getElementById(
"reg-email-error"
).innerText =
"Email gerekli.";
return;
}

if(!password){
document.getElementById(
"reg-pass-error"
).innerText =
"Şifre gerekli.";
return;
}

localStorage.setItem(
"user",
JSON.stringify({
username,
email,
password
})
);

showToast(
"Kayıt başarılı."
);

showTab("login");
}

function loginUser(){

clearErrors();

const username =
document.getElementById(
"login-user"
).value;

const password =
document.getElementById(
"login-pass"
).value;

const user =
JSON.parse(
localStorage.getItem(
"user"
)
);

if(!username){
document.getElementById(
"login-user-error"
).innerText =
"Kullanıcı adı gerekli.";
return;
}

if(!password){
document.getElementById(
"login-pass-error"
).innerText =
"Şifre gerekli.";
return;
}

if(
!user ||
user.username !== username ||
user.password !== password
){
showToast(
"Giriş başarısız."
);
return;
}

loginSuccess(username);

showToast(
"Giriş başarılı."
);

showTab("home");
}ş0k