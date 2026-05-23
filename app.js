/* ========================================================
   ZIONHILT STORE — app.js
   Handles: receipt items, grand total, barcode scanner,
            receipt barcode generator
   ======================================================== */

/* -------------------------------------------------------
   PRODUCT CATALOG
   Map barcode / product code  →  { prod, amt }
   Replace sample codes with your real stock barcodes.
------------------------------------------------------- */
const PRODUCT_CATALOG = {
  "6001240101017": { prod: "Hp Laptop",       amt: 250000 },
  "6001240101024": { prod: "Dell Laptop",      amt: 220000 },
  "6001240101031": { prod: "Mouse",            amt: 2500   },
  "6001240101048": { prod: "Keyboard",         amt: 4500   },
  "6001240101055": { prod: "Flashdrive 32gb",  amt: 3500   },
  "6001240101062": { prod: "Flashdrive 16gb",  amt: 2200   },
  "6001240101069": { prod: "Card Reader",      amt: 1500   },
  "6001240101076": { prod: "Screen Cover",     amt: 2000   },
  "6001240101083": { prod: "Hp Charger",       amt: 8500   },
  "6001240101090": { prod: "Dell Charger",     amt: 9000   },
  "6001240101107": { prod: "Lenovo Charger",   amt: 8000   },
  "6001240101114": { prod: "Apple Charger",    amt: 12000  },
  "6001240101121": { prod: "Samsung Charger",  amt: 6500   },
  "6001240101138": { prod: "Asus Charger",     amt: 8500   },
};

/* -------------------------------------------------------
   STATE
------------------------------------------------------- */
let editID   = "";
let rcptno   = "";

/* -------------------------------------------------------
   INIT  (called by auth.js after login)
------------------------------------------------------- */
function initApp() {
  const d = new Date().toLocaleString();
  document.getElementById("date-full").textContent = d;
  document.getElementById("top-date").textContent  = d;

  const no = Math.floor(Math.random() * 90000) + 10000;
  rcptno = "Zht" + no;
  document.getElementById("receipt").textContent = rcptno;

  drawReceiptBarcode(rcptno);
  setupItems();
  grandTotal();

  // Attach form submit
  const form = document.querySelector(".grocery-form");
  if (form) {
    // Remove any old listener before adding
    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);
    newForm.addEventListener("submit", addItem);
  }

  // Attach clear button
  const clearBtn = document.querySelector(".clear-btn");
  if (clearBtn) clearBtn.onclick = clearItems;

  // Scanner manual input enter key
  const mb = document.getElementById("manual-barcode");
  if (mb) mb.onkeydown = (e) => { if (e.key === "Enter") applyManualBarcode(); };

  // Scanner modal backdrop close
  const modal = document.getElementById("scanner-modal");
  if (modal) modal.onclick = (e) => { if (e.target === modal) closeScanner(); };
}

/* -------------------------------------------------------
   SHORTHAND DOM HELPERS
------------------------------------------------------- */
const getAlert     = () => document.querySelector(".alert");
const getList      = () => document.querySelector(".grocery-list");
const getContainer = () => document.querySelector(".grocery-container");
const getProd      = () => document.getElementById("grocery");
const getQty       = () => document.getElementById("qty");
const getAmt       = () => document.getElementById("amt");
const getSubmitBtn = () => document.querySelector(".submit-btn");

/* -------------------------------------------------------
   ADD / EDIT ITEM
------------------------------------------------------- */
function addItem(e) {
  e.preventDefault();
  const id   = editID || new Date().getTime().toString();
  const prod = getProd();
  const qty  = getQty();
  const amt  = getAmt();
  const validInput = prod.value && qty.valueAsNumber > 0 && amt.valueAsNumber > 0;
  const item = { id, prod: prod.value, qty: qty.valueAsNumber, amt: amt.valueAsNumber };

  if (validInput && !editID) {
    addToLocalStorage(item);
    setupItems();
    grandTotal();
    setBackToDefault();
    displayAlert("Item added successfully", "success");
  } else if (validInput && editID) {
    editLocalStorage(item);
    setupItems();
    setBackToDefault();
    displayAlert("Item updated successfully", "success");
  } else {
    displayAlert("Please fill all fields with valid values", "danger");
  }
}

/* -------------------------------------------------------
   ALERT
------------------------------------------------------- */
function displayAlert(text, action) {
  const a = getAlert();
  if (!a) return;
  a.textContent = text;
  a.classList.add("alert-" + action);
  setTimeout(() => {
    a.textContent = "";
    a.classList.remove("alert-" + action);
  }, 2500);
}

/* -------------------------------------------------------
   CLEAR ALL ITEMS
------------------------------------------------------- */
function clearItems() {
  getList().innerHTML = "";
  getContainer().classList.remove("show-container");
  displayAlert("List cleared", "danger");
  setBackToDefault();
  localStorage.removeItem("list");
  grandTotal();
}

/* -------------------------------------------------------
   DELETE SINGLE ITEM
------------------------------------------------------- */
function deleteItem(id) {
  removeFromLocalStorage(id);
  setupItems();
  displayAlert("Item removed", "danger");
}

/* -------------------------------------------------------
   EDIT SINGLE ITEM
------------------------------------------------------- */
function editItem(id) {
  const items = getLocalStorage();
  const item  = items.find((v) => v.id == id);
  if (!item) return;
  getProd().value        = item.prod;
  getQty().valueAsNumber = item.qty;
  getAmt().valueAsNumber = item.amt;
  editID = id;
  getSubmitBtn().value = "Update";
}

/* -------------------------------------------------------
   RESET FORM
------------------------------------------------------- */
function setBackToDefault() {
  getProd().value        = "";
  getQty().valueAsNumber = 0;
  getAmt().valueAsNumber = 0;
  editID = "";
  getSubmitBtn().value = "Add";
}

/* -------------------------------------------------------
   LOCAL STORAGE HELPERS
------------------------------------------------------- */
function addToLocalStorage(item) {
  const items = getLocalStorage();
  items.push(item);
  localStorage.setItem("list", JSON.stringify(items));
}

function removeFromLocalStorage(id) {
  const items = getLocalStorage().filter((item) => item.id != id);
  localStorage.setItem("list", JSON.stringify(items));
}

function editLocalStorage(item) {
  const items = getLocalStorage().map((v) => (v.id == item.id ? item : v));
  localStorage.setItem("list", JSON.stringify(items));
}

function getLocalStorage() {
  const raw = localStorage.getItem("list");
  return raw ? JSON.parse(raw) : [];
}

/* -------------------------------------------------------
   RENDER ITEMS TABLE
------------------------------------------------------- */
function setupItems() {
  const items = getLocalStorage();
  const list  = getList();
  if (!list) return;
  list.innerHTML = "";

  items.forEach((item, idx) => {
    list.innerHTML += `
      <tr class="grocery-item">
        <td>${idx + 1}</td>
        <td>${item.prod}</td>
        <td>${item.qty}</td>
        <td>₦${Number(item.amt).toLocaleString()}</td>
        <td>₦${(item.qty * item.amt).toLocaleString()}</td>
        <td>
          <button type="button" class="edit-btn" onclick="editItem(${item.id})">
            <i class="fas fa-edit"></i>
          </button>
        </td>
        <td>
          <button type="button" class="delete-btn" onclick="deleteItem(${item.id})">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>`;
  });

  if (items.length) getContainer().classList.add("show-container");
  else              getContainer().classList.remove("show-container");

  grandTotal();
}

/* -------------------------------------------------------
   GRAND TOTAL
------------------------------------------------------- */
function grandTotal() {
  const items = getLocalStorage();
  const sum   = items.reduce((x, item) => x + item.amt * item.qty, 0);
  const el    = document.querySelector(".amtt");
  if (el) el.textContent = sum.toLocaleString();
}

/* -------------------------------------------------------
   RECEIPT BARCODE GENERATOR
   Draws a visual Code-128-style barcode from the receipt
   number onto a canvas element.
------------------------------------------------------- */
function drawReceiptBarcode(code) {
  const canvas = document.getElementById("barcode-canvas");
  const textEl = document.getElementById("barcode-text");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Deterministic bar/space widths derived from char codes
  const bars = [];
  for (let i = 0; i < code.length; i++) {
    const c = code.charCodeAt(i);
    bars.push(1 + (c % 3));
    bars.push(1 + ((c * 7) % 3));
  }
  bars.push(2, 1, 2); // end guard

  const totalUnits = bars.reduce((a, b) => a + b, 0);
  const unitWidth  = canvas.width / totalUnits;
  const barHeight  = 50;
  const top        = 4;

  let x = 0;
  ctx.fillStyle = "#000";
  for (let i = 0; i < bars.length; i++) {
    const w = bars[i] * unitWidth;
    if (i % 2 === 0) ctx.fillRect(x, top, w - 0.5, barHeight);
    x += w;
  }

  if (textEl) textEl.textContent = code;
}

/* -------------------------------------------------------
   BARCODE SCANNER  (camera-based using ZXing)
------------------------------------------------------- */
let scannerActive = false;
let codeReader    = null;
let scanStream    = null;

function openScanner() {
  const modal = document.getElementById("scanner-modal");
  const status = document.getElementById("scanner-status");
  if (!modal) return;
  modal.classList.add("open");
  status.textContent = "Initializing camera…";
  status.className   = "scanner-status";
  startCameraScanner();
}

function closeScanner() {
  stopCameraScanner();
  const modal = document.getElementById("scanner-modal");
  if (modal) modal.classList.remove("open");
}

function stopCameraScanner() {
  scannerActive = false;
  if (codeReader) {
    try { codeReader.reset(); } catch (_) {}
    codeReader = null;
  }
  if (scanStream) {
    scanStream.getTracks().forEach((t) => t.stop());
    scanStream = null;
  }
  const video = document.getElementById("scanner-video");
  if (video) video.srcObject = null;
}

async function startCameraScanner() {
  stopCameraScanner();
  scannerActive = true;
  const statusEl = document.getElementById("scanner-status");
  const video    = document.getElementById("scanner-video");

  if (typeof ZXing === "undefined") {
    statusEl.textContent = "Scanner library not available. Use manual entry below.";
    statusEl.className   = "scanner-status error";
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
    });
    scanStream    = stream;
    video.srcObject = stream;
    statusEl.textContent = "Camera ready — hold barcode in frame…";

    codeReader = new ZXing.BrowserMultiFormatReader();
    codeReader.decodeFromStream(stream, video, (result, err) => {
      if (!scannerActive) return;
      if (result) {
        const code = result.getText();
        statusEl.textContent = "✓ Scanned: " + code;
        statusEl.className   = "scanner-status found";
        applyBarcode(code);
        setTimeout(closeScanner, 900);
      }
    });
  } catch (err) {
    if (err.name === "NotAllowedError") {
      statusEl.textContent = "Camera access denied. Use manual entry below.";
    } else if (err.name === "NotFoundError") {
      statusEl.textContent = "No camera detected. Use manual entry below.";
    } else {
      statusEl.textContent = "Camera error: " + err.message;
    }
    statusEl.className = "scanner-status error";
  }
}

/* Apply a barcode string to the form */
function applyBarcode(code) {
  const match  = PRODUCT_CATALOG[code];
  const prodEl = getProd();
  const amtEl  = getAmt();

  if (match) {
    prodEl.value        = match.prod;
    amtEl.valueAsNumber = match.amt;
    displayAlert("Product scanned: " + match.prod, "success");
  } else {
    const mb = document.getElementById("manual-barcode");
    if (mb) mb.value = code;
    displayAlert("Unknown barcode — enter details manually", "danger");
  }
}

/* Manual entry in scanner modal */
function applyManualBarcode() {
  const code = document.getElementById("manual-barcode").value.trim();
  if (!code) return;
  applyBarcode(code);
  if (PRODUCT_CATALOG[code]) setTimeout(closeScanner, 700);
}
