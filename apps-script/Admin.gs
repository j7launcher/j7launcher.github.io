/**
 * J7 Orders: your private order portal, served by this same script.
 * Open the web app address with ?page=admin while signed in to the Google account that owns this
 * script. Anyone else gets "This page is private", and every function below checks again.
 * The portal reads and writes the Bookings tab, so the Sheet and the portal always agree.
 */
const TZ = 'Asia/Kuala_Lumpur';
/** Columns the portal adds after "Your notes" (setup() or the first portal visit adds them). */
const ADMIN_HEADERS = ['Install date', 'Paid on', 'Last message', 'Log'];
/** Each Bookings column as a field name in the portal. */
const FIELDS = {
  'Ref': 'ref', 'Received': 'received', 'Status': 'status', 'Name': 'name', 'Name on screen': 'greeting',
  'WhatsApp': 'phone', 'Email': 'email', 'State': 'state', 'Variant': 'variant', 'Colour': 'colour', 'Plate': 'plate',
  'Android': 'android', 'RAM': 'ram', 'Box': 'box', 'Package': 'package', 'Map app': 'nav', 'Music': 'music',
  'Daily info': 'dayTile', 'Greeting language': 'language', 'Second driver': 'driver2', 'Install': 'install',
  'Notes': 'notes', 'Photo': 'photo', 'Site language': 'siteLang', 'Paid (RM)': 'paid', 'Your notes': 'myNotes',
  'Install date': 'installDate', 'Paid on': 'paidOn', 'Last message': 'lastMsg', 'Log': 'log',
};
/** Your details that go into the messages (Settings in the portal). */
const SETTING_KEYS = ['sign', 'bank', 'account', 'holder', 'duitnow', 'window', 'onsite'];
const SETTING_DEFAULTS = { sign: 'Iskandar', bank: '', account: '', holder: '', duitnow: '', window: '14–22 Nov', onsite: '50' };

function adminPage() {
  if (!isOwner_()) {
    return HtmlService.createHtmlOutput('<p style="font:16px system-ui;padding:24px">This page is private.</p>').setTitle('J7 Orders');
  }
  const page = HtmlService.createTemplateFromFile('Portal');
  // The orders go into the page itself, so it shows them even if a later call gets lost.
  try { page.first = adminData(); } catch (e) { page.first = ''; }
  return page.evaluate().setTitle('J7 Orders')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, viewport-fit=cover');
}

/**
 * Everything the portal shows, as JSON (Dates don't cross google.script.run, strings do).
 * { skipQr: true } leaves out the QR picture, which the page already has.
 */
function adminData(opts) {
  guard_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = bookings_();
  const head = columns_(sh);
  const n = sh.getLastRow() - 1;
  const rows = n > 0 ? sh.getRange(2, 1, n, head.length).getValues() : [];
  return JSON.stringify({
    orders: rows.map((r) => toOrder_(r, head)).filter((o) => o.ref),
    slots: SLOTS,
    left: slotsLeft(),
    settings: settings_(),
    qr: opts && opts.skipQr ? undefined : qr_(),
    sheet: ss.getUrl(),
    now: new Date().toISOString(),
  });
}

/**
 * One change to one order: { status, paid, myNotes, installDate, message, note }. Each change adds a
 * line to the order's Log. Returns the order as it is now.
 */
function adminSave(ref, change) {
  guard_();
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = bookings_();
    const head = columns_(sh);
    const row = findRow_(sh, ref);
    if (!row) throw new Error(`Order ${ref} isn't in the Sheet any more.`);
    const col = (h) => head.indexOf(h) + 1;
    const cur = toOrder_(sh.getRange(row, 1, 1, head.length).getValues()[0], head);
    const lines = [];
    const c = change || {};

    if (c.status && STATUSES.includes(c.status) && c.status !== cur.status) {
      sh.getRange(row, col('Status')).setValue(c.status);
      lines.push(`Status: ${cur.status || '–'} → ${c.status}`);
    }
    if ('paid' in c) {
      const amount = Number(c.paid) > 0 ? Math.round(Number(c.paid) * 100) / 100 : '';
      sh.getRange(row, col('Paid (RM)')).setValue(amount);
      if (amount && !cur.paidOn) sh.getRange(row, col('Paid on')).setValue(new Date());
      if (!amount) sh.getRange(row, col('Paid on')).setValue('');
      lines.push(amount ? `Payment: RM${amount}` : 'Payment cleared');
    }
    if ('myNotes' in c) sh.getRange(row, col('Your notes')).setValue(text_(c.myNotes, 3000));
    if ('installDate' in c) {
      const when = String(c.installDate || '').replace('T', ' ').slice(0, 16);
      const cell = sh.getRange(row, col('Install date'));
      cell.setNumberFormat('@').setValue(/^\d{4}-\d\d-\d\d( \d\d:\d\d)?$/.test(when) ? when : '');
      lines.push(when ? `Install date: ${when}` : 'Install date cleared');
    }
    if (c.message) {
      sh.getRange(row, col('Last message')).setValue(new Date());
      lines.push(`WhatsApp: ${String(c.message).replace(/[^\w-]/g, '').slice(0, 30)}`);
    }
    if (c.note) lines.push(String(text_(c.note, 300)).replace(/^'/, ''));

    if (lines.length) {
      const stamp = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm');
      const log = [cur.log, ...lines.map((l) => `${stamp} · ${l}`)].filter(Boolean).join('\n');
      sh.getRange(row, col('Log')).setValue(log.slice(-20000));
    }
    SpreadsheetApp.flush();
    return JSON.stringify({ order: toOrder_(sh.getRange(row, 1, 1, head.length).getValues()[0], head), left: slotsLeft() });
  } finally {
    lock.releaseLock();
  }
}

/**
 * A booking that came in by WhatsApp or phone instead of the website. Malaysia keeps 01XXXXXXXX,
 * Singapore +65 XXXX XXXX, as the website writes them.
 */
function adminAdd(o) {
  guard_();
  const b = o || {};
  const sg = b.country === 'SG';
  const plate = String(b.plate || '').toUpperCase().replace(/\s+/g, ' ').trim();
  const digits = String(b.phone || '').replace(/\D/g, '');
  const local = sg ? digits.replace(/^65(?=\d{8}$)/, '') : digits.replace(/^60/, '0');
  const ok = sg ? /^[89]\d{7}$/.test(local) : /^01\d{8,9}$/.test(local);
  const phone = sg ? `+65 ${local.slice(0, 4)} ${local.slice(4)}` : local;
  if (!b.name || !plate || !ok || !b.package) {
    throw new Error(`Name, plate, a ${sg ? 'Singapore (8 or 9, 8 digits)' : 'Malaysian (01…)'} mobile number and the package are needed.`);
  }
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const sh = bookings_();
    const head = columns_(sh);
    const ref = `J7-${plate.replace(/\s/g, '')}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    const stamp = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm');
    const values = {
      ref, received: new Date(), status: 'New', name: b.name, greeting: b.greeting || '', phone, email: b.email || '',
      state: sg ? 'Singapore' : b.state || '', variant: b.variant || '', colour: b.colour || '', plate, android: b.android || '', ram: b.ram || '',
      package: b.package, install: b.install || 'Remote (WhatsApp)', notes: b.notes || '', siteLang: b.lang === 'en' ? 'en' : 'ms',
      log: `${stamp} · Added by hand`,
    };
    const row = head.map((h) => (FIELDS[h] && FIELDS[h] in values ? clean(values[FIELDS[h]]) : ''));
    sh.appendRow(row);
    // Phone numbers keep their leading 0 (and +65 isn't read as a sum).
    sh.getRange(sh.getLastRow(), head.indexOf('WhatsApp') + 1).setNumberFormat('@').setValue(phone);
    SpreadsheetApp.flush();
    return JSON.stringify({ order: toOrder_(sh.getRange(sh.getLastRow(), 1, 1, head.length).getValues()[0], head), left: slotsLeft() });
  } finally {
    lock.releaseLock();
  }
}

function adminSettings(s) {
  guard_();
  const props = PropertiesService.getScriptProperties();
  SETTING_KEYS.forEach((k) => { if (s && k in s) props.setProperty(`j7.${k}`, String(s[k] || '').trim().slice(0, 200)); });
  return JSON.stringify(settings_());
}

/**
 * Your DuitNow QR picture (from your bank app), or '' to remove it. It's kept in your Drive, and
 * anyone with its link can see it, because the link goes to customers in the payment message.
 */
function adminQr(dataUrl) {
  guard_();
  const props = PropertiesService.getScriptProperties();
  const old = props.getProperty('j7.qr');
  let blob = null;
  if (dataUrl) {
    const m = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/=]+)$/.exec(String(dataUrl));
    if (!m || m[2].length > 2e6) throw new Error('Choose a PNG or JPG picture of your QR, under 1.5 MB.');
    blob = Utilities.newBlob(Utilities.base64Decode(m[2]), `image/${m[1]}`, `J7 Launcher payment QR.${m[1] === 'png' ? 'png' : 'jpg'}`);
  }
  if (old) {
    try { DriveApp.getFileById(old).setTrashed(true); } catch (e) { /* already gone */ }
    CacheService.getScriptCache().remove(`qr-${old}`);
    props.deleteProperty('j7.qr');
  }
  if (blob) {
    const file = folder().createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    props.setProperty('j7.qr', file.getId());
  }
  return JSON.stringify(qr_());
}

// ------------------------------------------------------------------ helpers (not callable from the page)

/** The QR's link for customers and the picture for the portal, or null. */
function qr_() {
  const id = PropertiesService.getScriptProperties().getProperty('j7.qr');
  if (!id) return null;
  const link = `https://drive.google.com/file/d/${id}/view`;
  const cache = CacheService.getScriptCache();
  let img = cache.get(`qr-${id}`);
  if (!img) {
    try {
      const b = DriveApp.getFileById(id).getBlob();
      img = `data:${b.getContentType()};base64,${Utilities.base64Encode(b.getBytes())}`;
    } catch (e) {
      return null;
    }
    // The cache holds up to 100 KB a value; bigger pictures are read from Drive each time.
    if (img.length < 100000) cache.put(`qr-${id}`, img, 21600);
  }
  return { link, img };
}

/** Only the script's owner, signed in, gets past this. */
function isOwner_() {
  const me = Session.getEffectiveUser().getEmail();
  const you = Session.getActiveUser().getEmail();
  return !!me && me === you;
}

function guard_() {
  if (!isOwner_()) throw new Error('This page is private.');
}

function bookings_() {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
}

/** The header row, adding any column the portal needs that the Sheet doesn't have yet. */
function columns_(sh) {
  const width = Math.max(1, sh.getLastColumn());
  const head = sh.getRange(1, 1, 1, width).getValues()[0].map(String);
  const missing = [...HEADERS, ...ADMIN_HEADERS].filter((h) => !head.includes(h));
  if (missing.length) {
    sh.getRange(1, head.length + 1, 1, missing.length).setValues([missing]).setFontWeight('bold').setBackground('#fff1e6');
    head.push(...missing);
    const install = head.indexOf('Install date') + 1;
    if (install) sh.getRange(2, install, Math.max(1, sh.getMaxRows() - 1), 1).setNumberFormat('@');
  }
  return head;
}

function findRow_(sh, ref) {
  const n = sh.getLastRow() - 1;
  if (n <= 0 || !ref) return 0;
  const refs = sh.getRange(2, 1, n, 1).getValues();
  const i = refs.findIndex((r) => String(r[0]) === String(ref));
  return i < 0 ? 0 : i + 2;
}

function toOrder_(r, head) {
  const o = {};
  head.forEach((h, i) => {
    const k = FIELDS[h];
    if (!k) return;
    const v = r[i];
    o[k] = v instanceof Date ? v.toISOString() : v === null || v === undefined ? '' : k === 'paid' ? (v === '' ? '' : Number(v)) : String(v);
  });
  return o;
}

function settings_() {
  const props = PropertiesService.getScriptProperties();
  const out = {};
  SETTING_KEYS.forEach((k) => {
    const v = props.getProperty(`j7.${k}`);
    out[k] = v === null ? SETTING_DEFAULTS[k] : v;
  });
  return out;
}

/** Text from the portal: trimmed, capped, and never read as a formula. */
function text_(v, max) {
  const s = String(v === null || v === undefined ? '' : v).trim().slice(0, max);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}
