// RSI.js

document.addEventListener("DOMContentLoaded", () => {
    const taskCheckboxes = document.querySelectorAll(".task-checkbox");
    const logList = document.getElementById("logList");
    const clearlogBtn = document.getElementById("clearlogBtn");
    const exportLogBtn = document.getElementById("exportLogBtn");
    const homeBtn = document.getElementById("homeBtn");

    //Log an event
    function logEvent(message) {
        const logItem = document.createElement("li");
        const timestamp = new Date().toLocaleString();
        logItem.textContent = `[${timestamp}] ${message}`;
        logList.appendChild(logItem);
        logList.scrollTop = logList.scrollHeight; // Scroll to the latest entry
    }

    // task checkbox toggle
    taskCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
            const taskContainer = event.target.closest(".task-container");
            const label = taskContainer.querySelector("label span") || taskContainer.querySelector("label");

            if (checkbox.checked) {
                taskContainer.classList.add("completed");
                logEvent(`Completed: ${label.textContent.trim()}`);
             } else {
                    taskContainer.classList.remove("completed");
                    logEvent(`Uncompleted: ${label.textContent.trim()}`);
                }
            });
        });
    });

    //Clear event log
    clearLogBtn.addEventListener("click", () => {
        logList.innerHTML = "";
        console.log("Event log cleared.");
    });

    //Export event log
    exportLogBtn.addEventListener("click", () => {
        const logEntries = Array.from(logList.children).map((li) => li.textContent).join("\n");
        const blob = new Blob([logEntries], { type: "text/plain" });
        const url = URL.createObjectURL(blob);

        const link = document.createElement("a");
        link.href = url;
        link.download = "RSI_eventLog.txt";
        link.click();

        URL.revokeObjectURL(url); // Clean up the URL object
        logEvent("Event Log exported.");
    });

    //Home Btn
    homeBtn.addEventListener("click", () => {
        window.location.href = "index.html"; // Redirect to the home page
    });

