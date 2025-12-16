document.addEventListener("DOMContentLoaded", function() {
    let role = localStorage.getItem("role") || "";

    // ----- ELEMENT REFERENCES -----
    const welcomeScreen = document.getElementById("welcomeScreen");
    const mainApp = document.getElementById("mainApp");
    const roleSelect = document.getElementById("roleSelect");
    const enterBtn = document.getElementById("enterBtn");
    const logoutBtn = document.getElementById("logoutBtn");
    const sidebarButtons = document.querySelectorAll(".sidebar button[data-section]");
    const endIncidentBtn = document.getElementById("endIncidentBtn");

    // ----- ROLE SELECTION -----
    enterBtn.addEventListener("click", function() {
        if (!roleSelect.value) {
            alert("Please select a role to continue.");
            return;
        }
        role = roleSelect.value;
        localStorage.setItem("role", role);
        document.getElementById("currentRole").textContent = role;
        welcomeScreen.classList.add("hidden");
        mainApp.classList.remove("hidden");
        logActivity("Entered app as " + role);
    });

    if(role) {
        document.getElementById("currentRole").textContent = role;
        welcomeScreen.classList.add("hidden");
        mainApp.classList.remove("hidden");
    }

    // ----- CLOCKS -----
    function updateClocks() {
        const now = new Date();
        document.getElementById("localTime").textContent = now.toLocaleTimeString() + " Local";
        document.getElementById("zuluTime").textContent = now.toUTCString().split(" ")[4] + " Z";
    }
    setInterval(updateClocks, 1000);
    updateClocks();

    // ----- NAV -----
    sidebarButtons.forEach(btn => {
        btn.addEventListener("click", () => showSection(btn.dataset.section));
    });

    function showSection(id) {
        document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
        document.getElementById(id).classList.remove('hidden');
    }

    // ----- LOGOUT -----
    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("role");
        location.reload();
    });

    // ----- END INCIDENT -----
    endIncidentBtn.addEventListener("click", endIncident);

    function endIncident() {
        if(confirm("WARNING: This will clear all incident data. Are you sure?")) {
            ["boards","personnel","resources","files","dashboardNotes","commNotes","audit"].forEach(key => localStorage.removeItem(key));
            renderBoards(); renderPersonnel(); renderResources(); renderFiles();
            document.getElementById("dashboardNotes").value = "";
            document.getElementById("commNotes").value = "";
            logActivity("Incident data cleared.");
            alert("Incident data cleared. You may now start a new incident.");
        }
    }

    // ----- ACTIVITY LOG -----
    function logActivity(msg) {
        let audit = JSON.parse(localStorage.getItem("audit") || "[]");
        const now = new Date();
        const entry = now.toISOString().substr(11,8) + " Z: " + msg;
        audit.unshift(entry);
        localStorage.setItem("audit", JSON.stringify(audit));
        renderAudit();
    }

    function renderAudit() {
        const list = document.getElementById("auditList");
        const audit = JSON.parse(localStorage.getItem("audit") || "[]");
        list.innerHTML = "";
        audit.forEach(a => {
            const li = document.createElement("li");
            li.textContent = a;
            list.appendChild(li);
        });
    }
    renderAudit();

    // ----- DASHBOARD -----
    const dashboardNotes = document.getElementById("dashboardNotes");
    const saveDashboardBtn = document.getElementById("saveDashboardBtn");
    saveDashboardBtn.addEventListener("click", () => {
        localStorage.setItem("dashboardNotes", dashboardNotes.value);
        logActivity("Saved Dashboard Notes");
    });
    dashboardNotes.value = localStorage.getItem("dashboardNotes") || "";

    // ----- STATUS BOARDS -----
    let boards = JSON.parse(localStorage.getItem("boards") || "[]");
    const boardsContainer = document.getElementById("boards");
    const addBoardBtn = document.getElementById("addBoardBtn");

    function renderBoards() {
        boardsContainer.innerHTML = "";
        boards.forEach((b, i) => {
            const div = document.createElement("div");
            div.innerHTML = `
                <input value="${b.title}">
                <textarea>${b.text}</textarea>
                <button data-index="${i}" class="saveBoardBtn">Save</button>
            `;
            boardsContainer.appendChild(div);
        });
        document.querySelectorAll(".saveBoardBtn").forEach(btn => {
            btn.addEventListener("click", () => {
                const i = btn.dataset.index;
                const div = btn.parentElement;
                boards[i].title = div.children[0].value;
                boards[i].text = div.children[1].value;
                localStorage.setItem("boards", JSON.stringify(boards));
                logActivity("Saved Status Board: " + boards[i].title);
                renderBoards();
            });
        });
    }

    addBoardBtn.addEventListener("click", () => {
        boards.push({ title: "New Board", text: "" });
        localStorage.setItem("boards", JSON.stringify(boards));
        logActivity("Added a new Status Board");
        renderBoards();
    });

    renderBoards();

    // ----- PERSONNEL -----
    let personnel = JSON.parse(localStorage.getItem("personnel") || "[]");
    const personnelTable = document.getElementById("personnelTable");
    const addPersonBtn = document.getElementById("addPersonBtn");
    const savePersonnelBtn = document.getElementById("savePersonnelBtn");

    function renderPersonnel() {
        personnelTable.innerHTML = "";
        personnel.forEach(p => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable>${p.name}</td>
                <td contenteditable>${p.agency}</td>
                <td contenteditable>${p.assignment}</td>
                <td contenteditable>${p.section}</td>
                <td contenteditable>${p.status}</td>
            `;
            personnelTable.appendChild(row);
        });
    }

    addPersonBtn.addEventListener("click", () => {
        personnel.push({ name:"", agency:"CAP", assignment:"", section:"", status:"Checked In" });
        savePersonnel();
        logActivity("Added a new personnel entry");
    });

    savePersonnelBtn.addEventListener("click", savePersonnel);

    function savePersonnel() {
        const rows = personnelTable.querySelectorAll("tr");
        personnel = Array.from(rows).map(r => ({
            name: r.children[0].innerText,
            agency: r.children[1].innerText,
            assignment: r.children[2].innerText,
            section: r.children[3].innerText,
            status: r.children[4].innerText
        }));
        localStorage.setItem("personnel", JSON.stringify(personnel));
        renderPersonnel();
        logActivity("Saved Personnel Table");
    }

    renderPersonnel();

    // ----- RESOURCES -----
    let resources = JSON.parse(localStorage.getItem("resources") || "[]");
    const resourceTable = document.getElementById("resourceTable");
    const addResourceBtn = document.getElementById("addResourceBtn");
    const saveResourcesBtn = document.getElementById("saveResourcesBtn");

    function renderResources() {
        resourceTable.innerHTML = "";
        resources.forEach(r => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td contenteditable>${r.id}</td>
                <td contenteditable>${r.type}</td>
                <td contenteditable>${r.assigned}</td>
                <td contenteditable>${r.status}</td>
                <td contenteditable>${r.location}</td>
                <td contenteditable>${r.notes}</td>
            `;
            resourceTable.appendChild(row);
        });
    }

    addResourceBtn.addEventListener("click", () => {
        resources.push({ id:"", type:"", assigned:"", status:"Available", location:"", notes:"" });
        saveResources();
        logActivity("Added a new resource");
    });

    saveResourcesBtn.addEventListener("click", () => {
        const rows = resourceTable.querySelectorAll("tr");
        resources = Array.from(rows).map(r => ({
            id: r.children[0].innerText,
            type: r.children[1].innerText,
            assigned: r.children[2].innerText,
            status: r.children[3].innerText,
            location: r.children[4].innerText,
            notes: r.children[5].innerText
        }));
        localStorage.setItem("resources", JSON.stringify(resources));
        renderResources();
        logActivity("Saved Resources Table");
    });

    renderResources();

    // ----- COMMUNICATIONS -----
    const commNotes = document.getElementById("commNotes");
    const saveCommBtn = document.getElementById("saveCommBtn");
    saveCommBtn.addEventListener("click", () => {
        localStorage.setItem("commNotes", commNotes.value);
        logActivity("Saved Communications Board");
    });
    commNotes.value = localStorage.getItem("commNotes") || "";

    // ----- DOCUMENTS -----
    let files = JSON.parse(localStorage.getItem("files") || "[]");
    const fileInput = document.getElementById("fileInput");
    const addFilesBtn = document.getElementById("addFilesBtn");
    const fileTable = document.getElementById("fileTable");

    function renderFiles() {
        fileTable.innerHTML = "";
        files.forEach((f,index) => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${f.name}</td>
                <td>${f.uploadedBy}</td>
                <td>${f.timeZulu}</td>
                <td>
                    <button onclick="alert('Download not available locally')">Download</button>
                    <button data-index="${index}" class="deleteFileBtn">Delete</button>
                </td>
            `;
            fileTable.appendChild(row);
        });

        document.querySelectorAll(".deleteFileBtn").forEach(btn => {
            btn.addEventListener("click", () => {
                const idx = btn.dataset.index;
                if(confirm("Remove this file from the incident workspace?")) {
                    logActivity("Deleted file: " + files[idx].name);
                    files.splice(idx,1);
                    localStorage.setItem("files", JSON.stringify(files));
                    renderFiles();
                }
            });
        });
    }

    addFilesBtn.addEventListener("click", () => {
        Array.from(fileInput.files).forEach(f => {
            files.push({ name: f.name, uploadedBy: role, timeZulu: new Date().toISOString().substr(11,8)+" Z" });
            logActivity("Added file: " + f.name);
        });
        localStorage.setItem("files", JSON.stringify(files));
        fileInput.value = "";
        renderFiles();
    });

    renderFiles();

});
