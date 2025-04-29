
document.addEventListener("DOMContentLoaded", function() {
    const disclaimerModal = document.getElementById("disclaimerModal");
    const acknowledgeBtn = document.getElementById("acknowledgeBtn");

    if(!localStorage.getItem("disclaimerAcknowledged")) {
        disclaimerModal.style.display = "flex";
    }

    acknowledgeBtn.addEventListener("click", function() {
        localStorage.setItem("disclaimerAcknowledged", "true");

        disclaimerModal.style.display = "none";
    });
});