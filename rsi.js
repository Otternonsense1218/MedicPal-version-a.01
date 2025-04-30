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

    //Shock index
    const hrInput = document.getElementById("shockIndexHR");
    const sbpInput = document.getElementById("shockIndexSBP");
    const output = document.getElementById("output");
    const container = document.getElementById("shockIndexContainer");

    function calculateShockIndex() {
        const hr = parseFloat(hrInput.value);
        const sbp = parseFloat(sbpInput.value);

        let warningMessage = document.getElementById("hypotensionWarning");

        if (!warningMessage) {
            warningMessage = document.createElement("span");
            warningMessage.id = "hypotensionWarning";
            warningMessage.style.color = "red";
            warningMessage.style.marginLeft = "10px";
            container.appendChild(warningMessage);
        }

        if (!isNaN(hr) && !isNaN(sbp) && sbp > 0) {
            const shockIndex = (hr / sbp).toFixed(2);
            output.textContent = shockIndex;

            if (shockIndex > 0.8) {
                container.classList.add('red');
                warningMessage.textContent = "HIGH RISK FOR HYPOTENSION";
                
            } else {
                container.classList.remove('red');
                warningMessage.textContent = "";
            }
        } else {
            output.textContent = "Enter HR and SBP";
            container.classList.remove('red');
            if (warningMessage) {
                warningMessage.textContent = "";
            }
        }
    }

    //enforces max and min length for hr and sbp 
    sbpInput.addEventListener("input", () => {
        const sbpValue = sbpInput.value;

        //ensures SBP is at least 2 digits
        if(sbpValue.length > 0 && sbpValue.length < 2) {
            sbpInput.setCustomValidity("SBP must be at least 2 digits. If not you have other problems to attend too.....")
            sbpInput.reportValidity();
        } else {
            sbpInput.setCustomValidity("");
        }

    });

    //Enforces max length in JavaScript as a backup for browsers that ignore maxLength
    hrInput.addEventListener("input", () => {
        if(hrInput.value.length > 3){
            hrInput.value = hrInput.value.slice(0, 3);
        }
    });

    sbpInput.addEventListener("input", () => {
        if(sbpInput.value.length > 3){
            sbpInput.value = sbpInput.value.slice(0, 3);
        }
    });

    //add blur event to hr and sbp inputs. will only create a log entry once the user has finished typing and leaves the input field
    hrInput.addEventListener("blur", () => {
        const hr = parseFloat(hrInput.value);
        const sbp = parseFloat(sbpInput.value);

        if (!isNaN(hr) && !isNaN(sbp) && sbp > 0) {
            const shockIndex = (hr / sbp).toFixed(2);
            logEvent(`Shock Index calculated: ${shockIndex}`)
        }

    });

    sbpInput.addEventListener("blur", () => {
        const hr = parseFloat(hrInput.value);
        const sbp = parseFloat(sbpInput.value);

        if (!isNaN(hr) && !isNaN(sbp) && sbp > 0) {
            const shockIndex = (hr / sbp).toFixed(2);
            logEvent(`Shock Index calculated: ${shockIndex}`)
        }

    });

    hrInput.addEventListener("input", calculateShockIndex);
    sbpInput.addEventListener("input", calculateShockIndex);

    const weightKgInput = document.getElementById("weight-kg");
    const weightLbsInput = document.getElementById("weight-lbs");

    weightKgInput.addEventListener("input", () => {
        const kg = parseFloat(weightKgInput.value);
        if (!isNaN(kg)) {
            weightLbsInput.value = (kg * 2.20462).toFixed(1);
        } else {
            weightLbsInput.value = "";
        }
        updateTable();
    });

    weightLbsInput.addEventListener("input", () => {
        const lbs = parseFloat(weightLbsInput.value);
        if (!isNaN(lbs)) {
            weightKgInput.value = (lbs / 2.20462).toFixed(1);
        } else {
            weightKgInput.value = "";
        }
        updateTable();
    });

    const medications = [

        //pre medication
        {section: "Premedication", background: "bg-premedication", meds: [{name: "Fentanyl", doseMin: 1, doseMax: 3, unit: "mcg", basis: "IBW"}, ]},
        
        //Induction
        {section: "Induction", background: "bg-induction", meds: [{name: "Etomidate", doseMin: 0.3, doseMax: 0.3, unit: "mg", basis: "ABW"}, ]},
        {section: "Induction", background: "bg-induction", meds: [{name: "Ketamine", doseMin: 1.5, doseMax: 2, unit: "mg", basis: "IBW"}, ]},
        {section: "Induction", background: "bg-induction", meds: [{name: "Midazolam", doseMin: 0.1, doseMax: 0.3, unit: "mg", basis: "ABW"}, ]},
        {section: "Induction", background: "bg-induction", meds: [{name: "Propofol", doseMin: 1, doseMax: 2.5, unit: "mg", basis: "ABW"}, ]},
        
        //Paralysis
        {section: "Paralysis", background: "bg-paralysis", meds: [{name: "Rocuronium", doseMin: 0.6, doseMax: 1.2, unit: "mg", basis: "IBW"}, ]},
        {section: "Paralysis", background: "bg-paralysis", meds: [{name: "Vecuronium", doseMin: 0.15, doseMax: 0.25, unit: "mg", basis: "IBW"}, ]},
        {section: "Paralysis", background: "bg-paralysis", meds: [{name: "Succinylcholine", doseMin: 1.5, doseMax: 1.5, unit: "mg", basis: "ABW"}, ]},

        //Post Intubation
        {section: "Post Intubation", background: "bg-postIntubation", meds: [{name: "Midazolam", doseMin: 0.05, doseMax: 0.1, unit: "mg", basis: "ABW"}, ]},
        
        //Vassopressor
        {section: "Vasopressor", background: "bg-vasopressor", meds: [{name: "Epinephrine", doseMin: 5, doseMax: 20, unit: "mcg", basis: "ABW"}, ]},
        {section: "Vasopressor", background: "bg-vasopressor", meds: [{name: "Levophed", doseMin: 0.05, doseMax: 0.4, unit: "mcg", basis: "ABW"}, ]},

    ];

    const table = document.getElementById("medTable");
    const inputs = {
        age: document.getElementById("age"),
        sex: document.getElementById("ptSex"),
        height: document.getElementById("height"),
        weight: document.getElementById("weight-kg"),
    };

    //uses the Miller formula for IBW calculations, changed from the devine formula
    function calculateIBW(sex, height) {
        if (sex === "male") {
            return 56.2 + 1.41 * (height -60);
        } else if (sex === "female") {
            return 53.1 + 1.36 * (height - 60);
        }
        return null;
    }

    function updateTable() {
        table.innerHTML = "";
        const abw = parseFloat(inputs.weight.value) || 0;
        const height = parseFloat(inputs.height.value) || 0;
        const sex = inputs.sex.value;
        const ibw = calculateIBW(sex, height) || 0;

        medications.forEach(group => {
            group.meds.forEach((med, idx) => {
              const weightUsed = med.basis === "IBW" ? ibw : abw;
              let calcMin = med.doseMin * weightUsed;
              let calcMax = med.doseMax * weightUsed;
              let unit = med.unit;

              if (unit === "mcg" && (calcMin >= 1000 || calcMax >= 1000)) {
                calcMin = calcMin / 1000;
                calcMax = calcMax / 1000;
                unit = "mg";
              }

              const calcMinFixed = calcMin.toFixed(1);
              const calcMaxFixed = calcMax.toFixed(1);
              const doseDisplay = (calcMinFixed === calcMaxFixed) ? `${med.doseMin} ${med.unit}` : `${calcMinFixed} - ${calcMaxFixed} ${unit}`;
              const doseRangeDisplay = (med.doseMin === med.doseMax) ? `${med.doseMin} ${med.unit}/kg` : `${med.doseMin}-${med.doseMax} ${med.unit}/kg`;

              const tr = document.createElement("tr");
              tr.className = group.background;
        
              tr.innerHTML = `
                <td>${idx === 0 ? group.section : ""}</td>
                <td>${med.name}</td>
                <td>${doseRangeDisplay}</td>
                <td>${med.basis}</td>
                <td class="font-bold">${doseDisplay}</td>
              `;
              table.appendChild(tr);
            });
        });
    }
    
    Object.values(inputs).forEach(input => {
        input.addEventListener("input", updateTable);
    });

    updateTable();
    

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