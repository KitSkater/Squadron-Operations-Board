// ---------- ROLE SELECTION ----------
let role = localStorage.getItem("role") || "";

function enterApp() {
    const select = document.getElementById("roleSelect");
    if(!select.value) {
        alert("Please select a role to continue.");
        return;
    }
    role = select.value;
    localStorage.setItem("role", role);
    document.getElementById("currentRole").textContent = role;
    document.getElementById("welcomeScreen").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
    logActivity("Entered app as " + role);
}

if(role) {
    document.getElementById("currentRole").textContent = role;
    document.getElementById("welcomeScreen").classList.add("hidden");
    document.getElementById("mainApp").classList.remove("hidden");
}

// ---------- CLOCKS ----------
function updateClocks() {
    const now = new Date();

    document.getElementById("localTime").textContent =
        now.toLocaleTimeString() + " Local";

    document.getElementById("zuluTime").textContent =
        now.toUTCString().split(" ")[4] + " Z";
}

setInterval(updateClocks, 1000);
updateClocks();

// ---------- NAV ----------
function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.add('hidden'));
    document.getElementById(id).classList.remove('hidden');
}

// ---------- DASHBOARD ----------
function saveDashboard() {
    localStorage.setItem("dashboardNotes",
        document.getElementById("dashboardNotes").value);
    logActivity("Saved Dashboard Notes");
}
document.getElementById("dashboardNotes").value =
    localStorage.getItem("dashboardNotes") || "";

// ---------- STATUS BOARDS ----------
let boards = JSON.parse(localStorage.getItem("boards") || "[]");

function renderBoards() {
    const container = document.getElementById("boards");
    container.innerHTML = "";

    boards.forEach((b, i) => {
        const div = document.createElement("div");
        div.innerHTML = `
            <input value="${b.title}">
            <textarea>${b.text}</textarea>
            <button onclick="saveBoard(${i}, this)">Save</button>
        `;
        container.appendChild(div);
    });
}

function addBoard() {
    boards.push({ title: "New Board", text: "" });
    saveBoards();
    logActivity("Added a new Status Board");
}

function saveBoard(index, btn) {
    const div = btn.parentElement;
    boards[index].title = div.children[0].value;
    boards[index].text = div.children[1].value;
    saveBoards();
    logActivity("Saved Status Board: " + boards[index].title);
}

function saveBoards() {
    localStorage.setItem("boards", JSON.stringify(boards));
    renderBoards();
}

renderBoards();

// ---------- PERSONNEL ----------
let personnel = JSON.parse(localStorage.getItem("personnel") || "[]");

function renderPersonnel() {
    const table = document.getElementById("personnelTable");
    table.innerHTML = "";

    personnel.forEach(p => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td contenteditable>${p.name}</td>
            <td contenteditable>${p.agency}</td>
            <td contenteditable>${p.assignment}</td>
            <td contenteditable>${p.section}</td>
            <td contenteditable>${p.status}</td>
        `;
        table.appendChild(row);
    });
}

function addPerson() {
    personnel.push({
        name: "",
        agency: "CAP",
        assignment: "",
        section: "",
        status: "Checked In"
    });
    savePersonnel();
    logActivity("Added a new personnel entry");
}

function savePersonnel() {
    const rows = document.querySelectorAll("#personnelTable tr");
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

// ---------- RESOURCES ----------
let resources = JSON.parse(localStorage.getItem("resources") || "[]");

function renderResources() {
    const table = document.getElementById("resourceTable");
    table.innerHTML = "";

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
        table.appendChild(row);
    });
}

function addResource() {
    resources.push({ id:"", type:"", assigned:"", status:"Available", location:"", notes:"" });
    saveResources();
    logActivity("Added a new resource");
}

function saveResources() {
    const rows = document.querySelectorAll("#resourceTable tr");
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
}

renderResources();

// ---------- COMMUNICATIONS ----------
function saveComm() {
    localStorage.setItem("commNotes", document.getElementById("commNotes").value);
    logActivity("Saved Communications Board");
}
document.getElementById("commNotes").value =
    localStorage.getItem("commNotes") || "";

// ---------- DOCUMENTS ----------
let files = JSON.parse(localStorage.getItem("files") || "[]");

function addFiles() {
    const input = document.getElementById("fileInput");
    Array.from(input.files).forEach(file => {
        files.push({
            name: file.name,
            uploadedBy: role,
            timeZulu: new Date().toISOString().substr(11,8) + " Z"
        });
        logActivity("Added file: " + file.name);
    });
    localStorage.setItem("files", JSON.stringify(files));
    input.value = "";
    renderFiles();
}

function renderFiles() {
    const table = document.getElementById("fileTable");
    table.innerHTML = "";

    files.forEach((f, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${f.name}</td>
            <td>${f.uploadedBy}</td>
            <td>${f.timeZulu}</td>
            <td>
                <button onclick="downloadFile()">Download</button>
                <button onclick="removeFile(${index})">Delete</button>
            </td>
        `;
        table.appendChild(row);
    });
}

function removeFile(index) {
    if(confirm("Remove this file from the incident workspace?")) {
        logActivity("Deleted file: " + files[index].name);
        files.splice(index,1);
        localStorage.setItem("files", JSON.stringify(files));
        renderFiles();
    }
}

function downloadFile() {
    alert("Download disabled in local mode. Will work in server deployment.");
}

renderFiles();

// ---------- ACTIVITY LOG ----------
function logActivity(msg) {
    let audit = JSON.parse(localStorage.getItem("audit") || "[]");
    const now = new Date();
    const entry = now.toISOString().substr(11,8) + " Z: " + msg;
    audit.unshift(entry); // newest on top
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

// ---------- END INCIDENT ----------
function endIncident() {
    if(confirm("WARNING: This will clear all incident data. Are you sure?")) {
        localStorage.removeItem("boards");
        localStorage.removeItem("personnel");
        localStorage.removeItem("resources");
        localStorage.removeItem("files");
        localStorage.removeItem("dashboardNotes");
        localStorage.removeItem("commNotes");
        localStorage.removeItem("audit");
        renderBoards();
        renderPersonnel();
        renderResources();
        renderFiles();
        document.getElementById("dashboardNotes").value = "";
        document.getElementById("commNotes").value = "";
        logActivity("Incident data cleared.");
        alert("Incident data cleared. You may now start a new incident.");
    }
}

// ---------- LOGOUT ----------
function logout() {
    localStorage.removeItem("role");
    location.reload();
}
