// archive.js

document.addEventListener("DOMContentLoaded", () => {
    const sessionList = document.getElementById("sessionList");
    const storedSessions = JSON.parse(localStorage.getItem('sessions')) || [];

    storedSessions.slice(-5).reverse().forEach((session, index) => {
        const li = document.createElement("li");
        const link = document.createElement("a");
        link.href = `session.html?sessionId=${storedSessions.length - 1 - index}`;
        link.textContent = `Session on: - ${session.timestamp || "No Timestamp"}`;
        li.appendChild(link);
        sessionList.appendChild(li);
    });
});