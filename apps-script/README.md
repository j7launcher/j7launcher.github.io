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

## If you change Code.gs later
Use **Deploy → Manage deployments → Edit → Version: New version → Deploy**. That keeps the same URL, so the website doesn't need changing.
