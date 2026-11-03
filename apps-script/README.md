# Bookings Sheet: your order desk (about 5 minutes)

The website's form saves each booking as a row in a Google Sheet that only you can open. You get an email for every booking. The website itself can only read one number from the Sheet: how many founder slots are left.

## Set it up once
1. Open **sheets.google.com** and create a blank sheet. Name it **J7 Launcher bookings**.
2. Menu **Extensions → Apps Script**. Delete what's there, paste everything from `Code.gs`, and click **Save**.
3. At the top, choose the function **setup** and click **Run**. Google asks for permission. Allow it: the script is yours and runs in your own account.
   - If you see "Google hasn't verified this app": click **Advanced → Go to J7 Launcher bookings (unsafe)**. It's your own script.
4. Click **Deploy → New deployment**. Under the gear icon, choose **Web app**.
   - **Execute as:** Me
   - **Who has access:** Anyone
   - Click **Deploy** and copy the **Web app URL**. It ends in `/exec`.
5. Send me that URL, or paste it into `site/app.js` as `const SHEET_URL = '…'` and publish the site again.

## Using it
- **Bookings tab:** one row per booking. Change **Status** as you go: New → Box checked → Paid → Built → Installed. Use Not compatible, Refunded or Cancelled to free the slot.
- **Paid (RM)** and **Your notes** are for you.
- **Dashboard tab:** slots left, bookings by status, Standard vs Pro, money received, and favourite map apps.
- **Photos** of Settings → About go into the Drive folder "J7 Launcher booking photos".
- Use the **Google Sheets app** on your phone to update orders on the go.

## J7 Orders: your order portal
A private page that runs on top of the same Sheet. It has a **To do** list (who's waiting for you, and for what), **Orders** with search, **Money**, and each order's next step as a button. It also has the WhatsApp messages ready in BM or EN, payments, install dates, your notes, a history of each order, and an **Open in J7 Studio** link.

**Add it (about 5 minutes):**
1. In the Sheet: **Extensions → Apps Script**.
2. **Code.gs:** replace everything with the new `Code.gs`.
3. Click **+ → Script** and name it `Admin`. Paste `Admin.gs`.
4. Click **+ → HTML** and name it `Portal`. Paste `Portal.html`.
5. Click **Save**. Run **setup** once and allow the new permission (it checks it's you, using your email address).
6. **Deploy → Manage deployments → ✏️ Edit → Version: New version → Deploy.** The website address doesn't change.
7. Open your web app address with `?page=admin` on the end, signed in to this Google account. Bookmark it, and on your phone use **Add to Home screen**.

Only you can use it. Anyone else who opens that address sees "This page is private", and every save checks again on Google's side. Your bank details (Settings in the portal) stay in your script, never on the website.

**If it says "This page is private" to you:** your browser is probably signed in to more than one Google account. Open it in a window signed in only to this account, such as an incognito window or a separate Chrome profile. If that still doesn't work, use **Deploy → Test deployments**, copy that address (it ends in `/dev`), and add `?page=admin`. Only people who can edit the script can open that one.

## If you change Code.gs later
Use **Deploy → Manage deployments → Edit → Version: New version → Deploy**. That keeps the same URL, so the website doesn't need changing.
