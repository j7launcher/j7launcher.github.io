/**
 * J7 Launcher bookings: the website's form lands here, one row per booking, in your own Google Sheet.
 * The Sheet is the order desk: set each booking's Status as you go; the Dashboard tab adds it up.
 * The website can only read how many founder slots are left, never the bookings themselves.
 * Each visit to the website adds an anonymous row to Visits (time, a random browser id, where the
 * visitor came from, language, phone or computer), which the Dashboard counts.
 *
 * Your order portal (Admin.gs + Portal.html) is the same web app with ?page=admin, for you only.
 *
 * Setup is in README.md next to this file. Run setup() once after pasting.
 */
const SHEET = 'Bookings';
const SLOTS = 30;
const PHOTO_FOLDER = 'J7 Launcher booking photos';
const HEADERS = ['Ref', 'Received', 'Status', 'Name', 'Name on screen', 'WhatsApp', 'Email', 'State', 'Variant', 'Colour', 'Plate',
  'Android', 'RAM', 'Box', 'Package', 'Map app', 'Music', 'Daily info', 'Greeting language', 'Second driver', 'Install', 'Notes',
  'Photo', 'Site language', 'Paid (RM)', 'Your notes'];
const STATUSES = ['New', 'Box checked', 'Not compatible', 'Paid', 'Built', 'Installed', 'Refunded', 'Cancelled'];
/** Bookings that no longer hold a founder slot. */
const FREED = ['Not compatible', 'Refunded', 'Cancelled'];
const VISITS = 'Visits';
const VISIT_HEADERS = ['Time', 'Visitor', 'Source', 'Language', 'Device'];
/** A reload within this time is the same visit. */
const VISIT_GAP_S = 1800;

/** Run once: headers, the Status dropdown and colours, and the Dashboard tab. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  sh.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]).setFontWeight('bold').setBackground('#fff1e6');
  sh.setFrozenRows(1);
  sh.setFrozenColumns(3);
  columns_(sh);
  sh.getRange('C2:C').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(STATUSES, true).build());
  sh.getRange('Y2:Y').setNumberFormat('0.00');
  // Phone numbers keep their leading 0.
  sh.getRange('F2:F').setNumberFormat('@');
  const colours = { 'New': '#fff4cc', 'Box checked': '#dbeafe', 'Not compatible': '#fde2e2', 'Paid': '#d1fae5', 'Built': '#e0e7ff', 'Installed': '#bbf7d0', 'Refunded': '#f3f4f6', 'Cancelled': '#f3f4f6' };
  const range = sh.getRange('A2:AD');
  sh.setConditionalFormatRules(Object.keys(colours).map((s) => SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied(`=$C2="${s}"`).setBackground(colours[s]).setRanges([range]).build()));

  visitsSheet();
  const d = ss.getSheetByName('Dashboard') || ss.insertSheet('Dashboard', 0);
  d.clear();
  d.getCharts().forEach((c) => d.removeChart(c));
  const live = `COUNTA(${SHEET}!A2:A)-COUNTIF(${SHEET}!C2:C,"Not compatible")-COUNTIF(${SHEET}!C2:C,"Refunded")-COUNTIF(${SHEET}!C2:C,"Cancelled")`;
  const rows = [
    ['J7 Launcher · founder pre-order', ''],
    ['Founder slots left', `=MAX(0,${SLOTS}-(${live}))`],
    ['Bookings (all)', `=COUNTA(${SHEET}!A2:A)`],
    ...STATUSES.map((s) => [`  ${s}`, `=COUNTIF(${SHEET}!C2:C,"${s}")`]),
    ['Standard', `=COUNTIF(${SHEET}!O2:O,"Standard*")`],
    ['Pro', `=COUNTIF(${SHEET}!O2:O,"Pro*")`],
    ['On-site installs', `=COUNTIF(${SHEET}!U2:U,"On-site*")`],
    ['Received (RM)', `=SUM(${SHEET}!Y2:Y)`],
    ['Map apps: Waze / Google Maps / TuJu', `=COUNTIF(${SHEET}!P2:P,"Waze")&" / "&COUNTIF(${SHEET}!P2:P,"Google Maps")&" / "&COUNTIF(${SHEET}!P2:P,"TuJu")`],
  ];
  d.getRange(1, 1, rows.length, 2).setValues(rows);
  d.getRange('A1').setFontWeight('bold').setFontSize(14);
  d.getRange('B2').setFontWeight('bold').setFontSize(14);
  d.setColumnWidth(1, 280);
  d.setColumnWidth(2, 160);

  // Website visitors, next to the bookings.
  const v = VISITS;
  const visitors = [
    ['Website visitors', ''],
    ['Visits (all)', `=COUNTA(${v}!A2:A)`],
    ['Unique visitors', `=COUNTUNIQUE(${v}!B2:B)`],
    ['Visits today', `=COUNTIF(${v}!A2:A,">="&TODAY())`],
    ['Unique visitors today', `=IFERROR(COUNTUNIQUE(FILTER(${v}!B2:B,${v}!A2:A>=TODAY())),0)`],
    ['Visits, last 7 days', `=COUNTIF(${v}!A2:A,">="&(TODAY()-6))`],
    ['Bookings per 100 visitors', `=IFERROR(ROUND(100*COUNTA(${SHEET}!A2:A)/COUNTUNIQUE(${v}!B2:B),1),0)`],
    ['Phone / computer', `=COUNTIF(${v}!E2:E,"phone")&" / "&COUNTIF(${v}!E2:E,"computer")`],
    ['English / BM', `=COUNTIF(${v}!D2:D,"en")&" / "&COUNTIF(${v}!D2:D,"ms")`],
  ];
  d.getRange(1, 4, visitors.length, 2).setValues(visitors);
  d.getRange('D1').setFontWeight('bold').setFontSize(14);
  d.getRange('E3').setFontWeight('bold').setFontSize(14);
  d.getRange('D11').setValue('Where visitors come from').setFontWeight('bold');
  d.getRange('D12').setFormula(`=IFERROR(QUERY(${v}!C2:C,"select C, count(C) where C is not null group by C order by count(C) desc label C 'Source', count(C) 'Visits'",0),"No visits yet")`);
  d.setColumnWidth(4, 230);
  d.setColumnWidth(5, 120);
  d.getRange('G1').setValue('Visits per day').setFontWeight('bold');
  d.getRange('G2').setFormula(`=IFERROR(QUERY(${v}!A2:A,"select toDate(A), count(A) where A is not null group by toDate(A) label toDate(A) 'Day', count(A) 'Visits'",0),"")`);
  d.insertChart(d.newChart().setChartType(Charts.ChartType.COLUMN).addRange(d.getRange('G2:H60'))
    .setPosition(16, 4, 0, 0).setOption('title', 'Website visits per day').setOption('legend', { position: 'none' })
    .setOption('colors', ['#ff7a1a']).setOption('width', 620).setOption('height', 300).build());
  folder();
}

/** The website's form. */
function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(20000);
  try {
    const b = JSON.parse(e.postData.contents);
    if (!b.ref || !b.plate || !b.phone) return json({ ok: false });
    let photo = '';
    if (typeof b.shot === 'string' && b.shot.startsWith('data:image/jpeg;base64,') && b.shot.length < 4e6) {
      const blob = Utilities.newBlob(Utilities.base64Decode(b.shot.split(',')[1]), 'image/jpeg', `${clean(b.ref)}.jpg`);
      photo = folder().createFile(blob).getUrl();
    }
    const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
    sh.appendRow([b.ref, new Date(), 'New', b.name, b.greeting, b.phone, b.email, b.state, b.variant, b.colour, b.plate,
      b.android, b.ram, b.box, b.package, b.nav, b.music, b.dayTile, b.language, b.driver2, b.install, b.notes,
      photo, b.siteLanguage, '', ''].map(clean));
    MailApp.sendEmail(Session.getEffectiveUser().getEmail(), `J7 booking ${clean(b.ref)} · ${clean(b.plate)} · ${clean(b.package)}`,
      `${clean(b.name)} (${clean(b.phone)}) booked ${clean(b.package)}.\n${clean(b.variant)}, ${clean(b.colour)}, Android ${clean(b.android)}, ${clean(b.ram)}.\n\n` +
      `Open your orders: ${ScriptApp.getService().getUrl()}?page=admin
Or the Sheet: ${SpreadsheetApp.getActiveSpreadsheet().getUrl()}`);
    return json({ ok: true, left: slotsLeft() });
  } catch (err) {
    return json({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

/**
 * Public: the website's counter. Slots left, and the last few bookings with only the state, the
 * package and the time (no names, phones or plates).
 */
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.page === 'admin') return adminPage();
  if (p.v === '1') recordVisit(p);
  return json({ slots: SLOTS, left: slotsLeft(), recent: recentBookings() });
}

/** One anonymous row per visit; reloads within half an hour by the same browser don't count again. */
function recordVisit(p) {
  const id = String(p.id || '');
  if (!/^[a-z0-9]{8,40}$/.test(id)) return;
  const cache = CacheService.getScriptCache();
  if (cache.get(`v-${id}`)) return;
  cache.put(`v-${id}`, '1', VISIT_GAP_S);
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(10000)) return;
  try {
    visitsSheet().appendRow([new Date(), id, String(p.src || 'direct').slice(0, 40), p.lang === 'ms' ? 'ms' : 'en',
      p.dev === 'phone' ? 'phone' : 'computer'].map(clean));
  } finally {
    lock.releaseLock();
  }
}

function visitsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(VISITS);
  if (!sh) {
    sh = ss.insertSheet(VISITS);
    sh.getRange(1, 1, 1, VISIT_HEADERS.length).setValues([VISIT_HEADERS]).setFontWeight('bold').setBackground('#eef2ff');
    sh.setFrozenRows(1);
  }
  return sh;
}

function recentBookings() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
  const n = sh.getLastRow() - 1;
  if (n <= 0) return [];
  const from = Math.max(2, sh.getLastRow() - 9);
  // Columns B (received), C (status), H (state), O (package).
  return sh.getRange(from, 1, sh.getLastRow() - from + 1, 15).getValues()
    .filter((r) => !FREED.includes(r[2]))
    .reverse().slice(0, 3)
    .map((r) => ({ at: new Date(r[1]).toISOString(), state: String(r[7]), package: String(r[14]).split(' ')[0] }));
}

function slotsLeft() {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET);
  const n = sh.getLastRow() - 1;
  if (n <= 0) return SLOTS;
  const taken = sh.getRange(2, 3, n, 1).getValues().filter((r) => !FREED.includes(r[0])).length;
  return Math.max(0, SLOTS - taken);
}

/**
 * Text as text: trimmed, at most 500 characters, and never read as a formula (a value starting
 * with = + - or @ would otherwise run in the Sheet).
 */
function clean(v) {
  if (v === null || v === undefined) return '';
  if (v instanceof Date) return v;
  const s = String(v).trim().slice(0, 500);
  return /^[=+\-@]/.test(s) ? `'${s}` : s;
}

function folder() {
  const it = DriveApp.getFoldersByName(PHOTO_FOLDER);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PHOTO_FOLDER);
}

function json(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
