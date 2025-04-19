
let isRunning = false;
let logs = [];
let timerInterval;
let startTime = null;



const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn"); 
const exportBtn = document.getElementById("exportBtn");
const logList = document.getElementById("logList");
const clearLogBtn = document.getElementById("clearLogBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const timerDisplay = document.getElementById("timer");

// timer functions
function formatTime(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

function updateTimer() {
    const now = new Date().getTime();
    const elapsed = now - startTime;
    timerDisplay.textContent = formatTime(elapsed);
}

function formatDuration(ms) {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
    const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}


// Load logs from localStorage on page load
window.onload = function() {
    const savedLogs = JSON.parse(localStorage.getItem("eventLogs"));
    if (savedLogs) {
        logs = savedLogs;
        logs.forEach(entry => addLogToUI(entry));
    }
};

//Check saved theme on load
if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    darkModeToggle.checked = true;
}

// Toggle theme on switch click
darkModeToggle.addEventListener('change', () => {
    const isDark = darkModeToggle.checked;
    document.body.classList.toggle('dark-mode', isDark);
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
});


// Export logs to a file
exportBtn.addEventListener('click', () => {

    console.log('export button clicked');
    if (logs.length === 0) {
        alert('No logs to export');
        return;
    }

    const blob = new Blob([logs.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'event_logs.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    URL.revokeObjectURL(url);
});

//Disable buttons until start button is clicked
function setInterventionButtonsState(enabled) {
    document.querySelectorAll('.defib-btn').forEach(btn => btn.disabled = !enabled);
}

//All the buttons
startBtn.addEventListener('click', () => {
    isRunning = true;
    startTime = new Date().getTime();
    timerDisplay.textContent = "00:00:00"; // Reset timer display
    timerInterval = setInterval(updateTimer, 1000); // Update timer every second
    setInterventionButtonsState(true); // Enable buttons when event starts
    console.log('start button clicked');
    logEvent("Event Started");
});

stopBtn.addEventListener('click', () => {
    if (!isRunning) return; // Prevent stopping if not running

    isRunning = false;
    const endTime = new Date();
    const endTimestamp = endTime.toLocaleString();
    logEvent(`Event Stopped at ${endTimestamp}`);

    clearInterval(timerInterval); // Stop the timer

    const duration = formatDuration(endTime - startTime);
    const summaryList = logs.map(log => `<li>${log}</li>`).join("");

    //Show modal with summary
    document.getElementById('summaryTimes').innerHTML = `<strong>Start:</strong> ${new Date(startTime).toLocaleString()}<br><strong>End:</strong> ${endTimestamp}<br><strong>Duration:</strong> ${duration}`;
    document.getElementById('summaryLog').innerHTML = summaryList;
    document.getElementById('summaryModal').style.display = "flex";
});

//Modal Return button functionality
document.getElementById("returnBtn").addEventListener('click', () => {
    logs = []; // Clear logs
    localStorage.removeItem("eventLogs");
    window.location.href = "index.html"; // Redirect to the main page

});

setInterventionButtonsState(false); // Disable buttons initially


clearLogBtn.addEventListener('click', () => {
    console.log('clear log button clicked');
    logs = [];
    localStorage.removeItem('eventLogs');
    logList.innerHTML = ''; // Clear the UI log list
    let startTime = null; // Reset start time
    timerDisplay.textContent = "00:00:00"; // Reset timer display
    let epiCount = 0; // Reset Epi count
    document.getElementById("epiCount").textContent = "# of Epi administered: 0"; // Reset Epi count display
    console.log('Logs cleared!');
});


function logEvent(message) {
    const timestamp = new Date().toLocaleString();
    const logEntry = `[${timestamp}] ${message}`;
    logs.push(logEntry);
    localStorage.setItem('eventLogs', JSON.stringify(logs));
    addLogToUI(logEntry);
}

function addLogToUI(logEntry) {
    const li = document.createElement('li');
    li.textContent = logEntry;
    logList.appendChild(li);
}



// Handle defibrillation button click
document.querySelectorAll('.defib-btn').forEach(button => {
    button.addEventListener('click', () => {
        const energy = button.getAttribute('data-energy');
        logEvent(`Defibrillation: ${energy}`);
        console.log(`Defibrillation: ${energy}`);
    });
});

// Handle airway device
document.querySelectorAll('.airway-btn').forEach(button => {
    button.addEventListener('click', () => {
        const airwayDevice = button.getAttribute('data-device');
        logEvent(`${airwayDevice} placed.`);
        console.log(`${airwayDevice} placed.`);
    });
});


document.addEventListener('DOMContentLoaded', () => {
    const epiBtn = document.getElementById("epiBtn");
    const epiCountDisplay = document.getElementById("epiCount");
    let epiCount = 0;

    // Check if the button and display are available
    if (epiBtn && epiCountDisplay) {
        epiBtn.addEventListener('click', () => {
            if (!isRunning) {
                alert("Please start the event before administering Epinephrine.");
                return;
            }
            epiCount++;
            epiCountDisplay.textContent = `# of Epi administered: ${epiCount}`;
            logEvent(`Epinephrine Administered: ${epiCount}`);
        });
    } else {
        console.error('Epinephrine button or display element not found!');
    }
});

// handles amio button's
document.querySelectorAll('.amioBtn').forEach(button => {
    button.addEventListener('click', () => {
        const amioadmin = button.getAttribute('data-amio');
        logEvent(`Amiodarone ${amioadmin} given.`);
        console.log(`Amiodarone ${amioadmin} given`);
    });
});