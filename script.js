function showTab(id){

document
.querySelectorAll(".tab")
.forEach(tab => {

tab.classList.remove("active");

});

document
.getElementById(id)
.classList.add("active");
}

function copyIP(){

navigator.clipboard.writeText(
"atlantis.minecraft.party"
);

let toast =
document.getElementById("toast");

toast.style.display = "block";

setTimeout(() => {

toast.style.display = "none";

},2000);
}

// PARTICLES

const canvas =
document.getElementById("particles");

const ctx =
canvas.getContext("2d");

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

let particles = [];

for(let i=0;i<120;i++){

particles.push({

x:Math.random()*canvas.width,
y:Math.random()*canvas.height,

vx:(Math.random()-0.5)*0.5,
vy:(Math.random()-0.5)*0.5,

r:Math.random()*2+1

});

}

function animate(){

ctx.clearRect(
0,
0,
canvas.width,
canvas.height
);

for(let p of particles){

p.x += p.vx;
p.y += p.vy;

if(p.x<0||p.x>canvas.width)
p.vx*=-1;

if(p.y<0||p.y>canvas.height)
p.vy*=-1;

ctx.beginPath();

ctx.arc(
p.x,
p.y,
p.r,
0,
Math.PI*2
);

ctx.fillStyle =
"rgba(56,189,248,.8)";

ctx.fill();

}

for(let i=0;i<particles.length;i++){

for(let j=i+1;j<particles.length;j++){

let dx =
particles[i].x-particles[j].x;

let dy =
particles[i].y-particles[j].y;

let dist =
Math.sqrt(dx*dx+dy*dy);

if(dist<120){

ctx.beginPath();

ctx.moveTo(
particles[i].x,
particles[i].y
);

ctx.lineTo(
particles[j].x,
particles[j].y
);

ctx.strokeStyle =
`rgba(56,189,248,${
1-dist/120
})`;

ctx.stroke();

}

}

}

requestAnimationFrame(
animate
);

}

animate();

window.addEventListener(
"resize",
()=>{

canvas.width =
window.innerWidth;

canvas.height =
window.innerHeight;

}
);

function copyIP() {
    navigator.clipboard.writeText("atlantis.minecraft.party");
    const toast = document.getElementById("toast");
    toast.style.display = "block";
    setTimeout(() => toast.style.display = "none", 2000);
}

// AtlantisMC oyuncu sayısını güncelle
async function updatePlayerCount() {
    try {
        const response = await fetch("https://api.mcsrvstat.us/2/atlantis.minecraft.party");
        const data = await response.json();

        if (data.online) {
            document.getElementById("player-count").textContent = data.players.online;
        } else {
            document.getElementById("player-count").textContent = "Sunucu Kapalı";
        }
    } catch (error) {
        console.error("Oyuncu sayısı alınamadı:", error);
        document.getElementById("player-count").textContent = "Hata";
    }
}

// Sayfa açıldığında çalıştır ve her 30 saniyede bir güncelle
window.onload = () => {
    updatePlayerCount();
    setInterval(updatePlayerCount, 30000);
};

