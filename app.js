
let isRunning = false;
let logs = [];
let timerInterval;
let startTime = null;

let pulseCheckInterval;
let pulseCheckTimeLeft = 120;
let pulseCheckRunning = false;



const startBtn = document.getElementById("startBtn");
const stopBtn = document.getElementById("stopBtn"); 
const exportBtn = document.getElementById("exportBtn");
const logList = document.getElementById("logList");
const homeBtn = document.getElementById("homeBtn");
const clearLogBtn = document.getElementById("clearLogBtn");
const darkModeToggle = document.getElementById("darkModeToggle");
const timerDisplay = document.getElementById("timer");
const intubationModal = document.getElementById("intubationModal");
const intubationForm = document.getElementById("intubationForm");
const cprBtn = document.getElementById("cprBtn");
const roscBtn = document.getElementById("roscBtn");
const todBtn = document.getElementById("todBtn");
const cprStatus = document.getElementById("cprStatus");
const pulseCheckDisplay = document.getElementById("pulseCheckDisplay");
const pulseCheckButton = document.getElementById("pulseCheckDoneBtn");



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

// save session function
function saveSessionLog(events) {
    const sessions = JSON.parse(localStorage.getItem('sessions')) || [];
    const newSession = {
        timestamp: new Date().toLocaleString(),
        events: events
    };
    sessions.push(newSession);
    localStorage.setItem('sessions', JSON.stringify(sessions));
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
    const exceptions = ['startBtn', 'exportBtn', 'clearLogBtn', 'darkModeToggle', 'homeBtn'];

    document.querySelectorAll('button').forEach(btn => {
        if (!exceptions.includes(btn.id)) {
            btn.disabled = !enabled;
        }
    })
}

//All the buttons
startBtn.addEventListener('click', () => {
    isRunning = true;
    startTime = new Date().getTime();
    timerDisplay.textContent = "00:00:00"; // Reset timer display
    timerInterval = setInterval(updateTimer, 1000); // Update timer every second
    setInterventionButtonsState(true); // Enable buttons when event starts
    console.log('start button clicked');
    logEvent("Event Started.");
});

stopBtn.addEventListener('click', () => {
    if (!isRunning) return; // Prevent stopping if not running

    isRunning = false;
    const endTime = new Date();
    const endTimestamp = endTime.toLocaleString();
    logEvent(`Event Stopped.`);
    stopPulseCheckTimer();
    saveSessionLog(logs);
    console.log("session saved");

    clearInterval(timerInterval); // Stop the timer

    const duration = formatDuration(endTime - startTime);
    const summaryList = logs.map(log => `<li>${log}</li>`).join("");

    //Show modal with summary
    document.getElementById('summaryTimes').innerHTML = `<strong>Start:</strong> ${new Date(startTime).toLocaleString()}<br><strong>End:</strong> ${endTimestamp}<br><strong>Duration:</strong> ${duration}`;
    document.getElementById('summaryLog').innerHTML = summaryList;
    document.getElementById('summaryModal').style.display = "flex";
});

cprBtn.addEventListener('click', () => {
    if (!isRunning) {
        alert("Please start the event.");
        return;
    }
    logEvent("CPR Started.");
    console.log("CPR Started.");
    cprStatus.textContent = "CPR Status: In Progress";
    startPulseCheckTimer();
});

roscBtn.addEventListener('click', () => {
    if (!isRunning) {
        alert("Please start the event.");
        return;
    }
    logEvent("ROSC Achieved.");
    console.log("ROSC Achieved.");
    cprStatus.textContent = "CPR Status: ROSC Achieved";
    cprStatus.style.color = "green"; // Change color to green
    stopPulseCheckTimer();
});

todBtn.addEventListener('click',  () => {
    if (!isRunning) {
        alert("Please start the event.");
        return;
    }
    logEvent("Time of Death Declared.");
    console.log("Time of Death Declared.");
    cprStatus.textContent = "CPR Status: Time of Death: " + new Date().toLocaleString();
    cprStatus.style.color = "red"; // Change color to red
    stopPulseCheckTimer();
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

homeBtn.addEventListener('click', () => {
    logs = []; // Clear logs
    console.log('home button clicked');
    localStorage.removeItem("eventLogs");
    window.location.href = "index.html"; // Redirect to the main page
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

// Handle intubation for button click

// Open modal
openIntubationBtn.addEventListener('click', () => {
    intubationModal.style.display = "flex";
});

//Handle intubation form submission

intubationForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const tubeSize = document.getElementById("tubeSize").value;
    const tubeDepth = document.getElementById("tubeDepth").value;
    const confirmation = document.getElementById("confirmation").value;
    const attempts = document.getElementById("attempts").value;

    const logText = `Intubation: Tube Size: ${tubeSize}, Tube Depth: ${tubeDepth}, Confirmation: ${confirmation}, Attempts: ${attempts}`;
    logEvent(logText);

    // Close modal
    intubationModal.style.display = "none";
    // Reset form
    intubationForm.reset();
});

//function to provide a brief event logged message when buttons are pressed for feedback.

function showFeedback(section) {
    document.getElementById("airwayFeedback").classList.remove("show");
    document.getElementById("interventionFeedback").classList.remove("show");
    document.getElementById("medicationFeedback").classList.remove("show");

    const feedbackId = section + "Feedback";
    const feedbackDiv = document.getElementById(feedbackId);

    if (feedbackDiv) {
        feedbackDiv.classList.add("show");
        setTimeout(() => {
            feedbackDiv.classList.remove("show");
        }, 1500); //hide again after 1.5 seconds
    }
}



// Handle defibrillation button click
document.querySelectorAll('.defib-btn').forEach(button => {
    button.addEventListener('click', () => {
        const energy = button.getAttribute('data-energy');
        logEvent(`Defibrillation: ${energy}`);
        console.log(`Defibrillation: ${energy}`);
        showFeedback("intervention");
    });
});

// Handle airway device
document.querySelectorAll('.airway-btn').forEach(button => {
    button.addEventListener('click', () => {
        const airwayDevice = button.getAttribute('data-device');
        logEvent(`${airwayDevice} placed.`);
        console.log(`${airwayDevice} placed.`);
        showFeedback("airway");
    });
});

// Handle IV/IO access
document.querySelectorAll('.access-btn').forEach(button => {
    button.addEventListener('click', () => {
        const ivAccess = button.getAttribute('data-access');
        logEvent(`${ivAccess} access obtained.`);
        console.log(`${ivAccess} access obtained.`);
        showFeedback("intervention");
    });
});

// EPI Btn functionality
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
            showFeedback("medication");
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
        showFeedback("medication");
    });
});

// handles mag button's
document.querySelectorAll('.magBtn').forEach(button => {
    button.addEventListener('click', () => {
        const magadmin = button.getAttribute('data-mag');
        logEvent(`Magnesium ${magadmin} given.`);
        console.log(`Magnesium ${magadmin} given`);
        showFeedback("medication");
    });
});

// handles narcan button
narcanBtn.addEventListener('click', () => {
    if (!isRunning) {
        alert("Please start the event.");
        return;
    }
    logEvent(`Narcan Administered.`);
    console.log(`Narcan Administered.`);
    showFeedback("medication");
});

// handles bicarb button
bicarbBtn.addEventListener('click', () => {
    if (!isRunning) {
        alert("Please start the event.");
        return;
    }
    logEvent(`Bicarb Administered.`);
    console.log(`Bicarb Administered.`);
    showFeedback("medication");
});

// handles Calcium button
calciumBtn.addEventListener('click', () => {
    if (!isRunning) {
        alert("Please start the event.");
        return;
    }
    logEvent(`Calcium Administered.`);
    console.log(`Calcium Administered.`);
    showFeedback("medication");
});

//pulse check display and functions 

function startPulseCheckTimer() {
    clearInterval(pulseCheckInterval);
    pulseCheckTimeLeft = 10;
    pulseCheckRunning = true;
    updatePulseCheckUI();

    document.querySelector(".timer-row").classList.remove("flashing-border");

    pulseCheckInterval = setInterval(() => {
        pulseCheckTimeLeft--;
        updatePulseCheckUI();

        if (pulseCheckTimeLeft <= 0) {
            clearInterval(pulseCheckInterval);
            pulseCheckRunning = false;

            const timerRow = document.querySelector(".timer-row");
            timerRow.classList.add("flashing-border");

            pulseCheckDisplay.innerHTML = '<span>PULSE CHECK:</span><button id="pulseCheckDoneBtn">Done</button>';
            document.getElementById("pulseCheckDoneBtn").addEventListener("click", () => {
                timerRow.classList.remove("flashing-border");
                startPulseCheckTimer();
            });
        }
    }, 1000);
}

function stopPulseCheckTimer() {
    clearInterval(pulseCheckInterval);
    pulseCheckRunning = false;
    pulseCheckTimeLeft = 120;
    pulseCheckDisplay.innerHTML = "";

    document.querySelector(".timer-row").classList.remove("flashing-border");
}

function updatePulseCheckUI() {
    const minutes = Math.floor(pulseCheckTimeLeft / 60);
    const seconds = pulseCheckTimeLeft % 60;
    pulseCheckDisplay.innerHTML = `
        <span>PULSE CHECK</span>
        <span>${minutes}:${seconds.toString().padStart(2, '0')}</span>
    `;
}

