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
