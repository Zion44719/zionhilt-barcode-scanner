# Zionhilt Store — POS Receipt App

A browser-based Point-of-Sale receipt application for Zionhilt Store, Ado-Ekiti, Nigeria. Supports cashier authentication, product entry, barcode scanning, receipt printing, and persistent local storage — no backend required.

---

## 📁 Project Files

```
zionhilt-store/
├── index.html    — Main HTML (all screens and dashboard)
├── styles.css    — All styles (auth, dashboard, receipt, scanner, print)
├── auth.js       — Authentication logic (login, register, forgot password)
├── app.js        — POS logic (receipt items, barcode scanner, grand total)
└── README.md     — This file
```

---

## 🚀 Getting Started

### Option 1 — Open directly (quickest)
Simply double-click `index.html` in your file manager to open it in a browser.

> ⚠️ **Camera/barcode scanning** requires the app to be served over `http://localhost` or `https://`. Opening as a raw `file://` URL will disable camera access.

### Option 2 — Local server (recommended for scanner)

If you have Node.js installed:

```bash
npx serve zionhilt-store
# then open http://localhost:3000
```

Or with Python:

```bash
cd zionhilt-store
python -m http.server 8080
# then open http://localhost:8080
```

---

## 🔐 Authentication

### Default Accounts

| Username  | Password      | Role        |
|-----------|---------------|-------------|
| `admin`   | `admin123`    | Supervisor  |
| `cashier` | `zionhilt2024`| Cashier     |
| `tunde`   | `tunde2024`   | Cashier     |

> These seed accounts are loaded automatically on first run. You can change passwords via the **Forgot Password** flow.

### Create Account
- Click **"Create account"** on the login screen
- Fill in Full Name, Username, Email, Password, and Role
- Passwords must be at least 6 characters
- Usernames and emails must be unique

### Forgot Password
1. Click **"Forgot password?"** on the login screen
2. Enter the email linked to your account
3. A reset token is generated and displayed on screen (in a real deployment this would be emailed)
4. Enter the token along with your new password to complete the reset

> All accounts are stored in browser `localStorage` under the key `zh_users`.

---

## 🛒 Using the POS

1. **Sign in** with any cashier account
2. **Select a product** from the dropdown (or scan a barcode)
3. Enter **Quantity** and **Amount (₦)**
4. Click **Add** — the item appears in the receipt table
5. Edit or delete individual items using the row buttons
6. Click **Print Receipt** to print; the form inputs and action buttons are hidden automatically
7. Click **Clear Items** to start a new receipt
8. Click **Logout** to end the session

---

## 📷 Barcode Scanner

The **Scan** button opens a live camera scanner powered by [ZXing-js](https://github.com/zxing-js/library).

### Supported formats
EAN-13 · EAN-8 · UPC-A · UPC-E · Code-128 · Code-39 · QR Code · Data Matrix · ITF · Codabar

### How product lookup works
When a barcode is scanned, the app looks it up in the `PRODUCT_CATALOG` object in `app.js`. If found, the product name and default price are automatically filled in. If not found, the raw barcode value is placed in the manual entry field.

### Adding your real barcodes
Open `app.js` and edit the `PRODUCT_CATALOG` object:

```js
const PRODUCT_CATALOG = {
  "YOUR_BARCODE_HERE": { prod: "Product Name", amt: 5000 },
  // add more...
};
```

The keys are the exact barcode strings your scanner reads (e.g. `"6001240101017"`).

### Manual entry
If a camera is unavailable or access is denied, type or paste a barcode into the text field at the bottom of the scanner modal and click **Use**.

---

## 🖨️ Printing

Click **Print Receipt** (or press `Ctrl+P` / `Cmd+P`). The CSS `@media print` rules automatically hide:
- The top navigation bar
- The product entry form
- Edit / Delete buttons
- The scanner button
- Clear and Print buttons

What prints:
- Store name, address, receipt number, date, cashier name
- Full itemised table with quantities, prices, and totals
- Grand total
- Visual barcode of the receipt number
- "Thanks for your patronage" footer

---

## 💾 Data Storage

All data is stored in the browser's `localStorage`:

| Key         | Contents                          |
|-------------|-----------------------------------|
| `zh_users`  | Array of registered user accounts |
| `zh_remember` | Remembered username (if checked) |
| `list`      | Current receipt items             |

The receipt list (`list`) is cleared on every logout so each cashier session starts with a clean receipt.

> **Note:** `localStorage` is per-browser and per-origin. Data does not sync across devices. For multi-device use, a backend database would be required.

---

## 🔧 Customisation

### Adding products to the dropdown
In `index.html`, add `<option>` elements inside the `#grocery` select:

```html
<option value="USB Hub">USB Hub</option>
```

### Changing store details
Edit the address block in `index.html`:

```html
<div class="address">
  <p>Your store description here</p>
  <p>Your address here</p>
</div>
```

### Changing brand colours
Edit the CSS variables in `styles.css`:

```css
:root {
  --clr-primary-1: hsl(205, 86%, 17%); /* darkest brand */
  --clr-primary-5: #49a6e9;            /* main accent   */
}
```

---

## 🌐 Browser Compatibility

| Browser         | Login / Receipt | Barcode Scanner |
|-----------------|-----------------|-----------------|
| Chrome 90+      | ✅              | ✅              |
| Edge 90+        | ✅              | ✅              |
| Firefox 88+     | ✅              | ✅ (https only) |
| Safari 14+      | ✅              | ✅ (https only) |
| Mobile Chrome   | ✅              | ✅ (rear camera)|

---

## 📄 License

© 2024 Zionhilt Store. All rights reserved.

Built with vanilla HTML, CSS, and JavaScript. No frameworks or build tools required.
