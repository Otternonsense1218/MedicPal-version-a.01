// RSI.js

document.addEventListener("DOMContentLoaded", () => {
    const taskCheckboxes = document.querySelectorAll(".task-checkbox");
    const logList = document.getElementById("logList");
    const clearLogBtn = document.getElementById("clearLogBtn");
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

    //Highlight columns green if all checkboxes are checked
    function updateColumnHighlighting() {
        const columns = document.querySelectorAll(".column");
    
        columns.forEach(column => {
            const checkboxes = column.querySelectorAll('.task-checkbox');
            const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
            const wasCompleted = column.classList.contains('completed-column');
            const columnTitleElem = column.querySelector("h3, h2, .columntitle");
            const columnTitle = columnTitleElem ? columnTitleElem.textContent.trim() : "Unnamed Column";
    
            if (allChecked && checkboxes.length > 0) {
                if (!wasCompleted) {
                    column.classList.add('completed-column');
                    logEvent(`${columnTitle} completed.`);
                }
            } else {
                if (wasCompleted) {
                    column.classList.remove('completed-column');
                    logEvent(`${columnTitle} uncompleted.`);
                }
            }
        });
    }
    

    // task checkbox toggle
    taskCheckboxes.forEach((checkbox) => {
        checkbox.addEventListener("change", (event) => {
            const taskContainer = event.target.closest(".task-container");
            const label = taskContainer.querySelector("label span") || taskContainer.querySelector("label");

            if (checkbox.checked) {
                taskContainer.classList.add("completed");
                updateColumnHighlighting();
             } else {
                    taskContainer.classList.remove("completed");
                    updateColumnHighlighting();
                }
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
});