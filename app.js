/*
 * J7 Launcher pre-booking page: BM/EN text, the countdown, the compatibility check and the form.
 *
 * SHEET_URL: the Google Apps Script web-app link (see apps-script/README.md). Empty = the form only
 * hands the details to WhatsApp, which always works.
 */
const SHEET_URL = '';
const WHATSAPP = '60147172505';
const CLOSES = new Date('2026-11-12T23:59:59+08:00');

const EN = {
  'nav.book': 'Pre-book',
  'hero.eyebrow': 'For Jaecoo J7 owners with an Android box',
  'hero.h1a': 'Stock screen.',
  'hero.h1b': 'Your J7\'s <em>screen.</em>',
  'hero.lead': 'J7 Launcher turns your Android box into a personal cockpit: <b>your car, your plate number</b>, maps, music and driving info on one screen.',
  'hero.cta': 'Book a founder slot',
  'hero.fit': 'Check compatibility',
  'hero.plate': 'YOUR PLATE',
  'trust.pay': 'Pay only after it\'s confirmed to fit',
  'trust.refund': 'Full refund within 7 days',
  'trust.updates': '12 months of free updates',
  'strip.pre': 'Founder pre-order',
  'strip.slots': 'Slots',
  'strip.slotsv': 'Only 30',
  'strip.from': 'From',
  'strip.ends': 'Closes in',
  'feat.h': 'What you get',
  'feat.lead': 'Built and tested in my own J7 AWD. Everything below is in Standard unless marked Pro.',
  'f1.h': 'Your car & plate on screen',
  'f1.p': 'A home screen with your J7, your colour, your plate number and a greeting with your name.',
  'f2.h': 'Waze, Google Maps or TuJu',
  'f2.p': 'Pick your map app. Open it in split screen with J7 (map on top or bottom), full screen with the J7 dock, or let it run in the background.',
  'f3.h': 'Driving mode',
  'f3.p': 'Once the car moves, the screen changes: next turn, speed and speed limit in big type, readable at a glance.',
  'f4.h': 'Malaysian daily info',
  'f4.p': 'Prayer times (or sun times), RON95 price, weather and air quality.',
  'f5.h': 'Music & big volume',
  'f5.p': 'Spotify and YouTube Music, with big on-screen volume buttons.',
  'f6.h': 'Day & night themes',
  'f6.p': 'Light by day, dark at night, pure black for night drives. Your own wallpaper.',
  'f7.h': 'Driver profiles',
  'f7.p': 'You and your partner: your own theme, places, music and map app.',
  'f8.h': 'Video when parked',
  'f8.p': 'YouTube only while the car is stopped. Plus arrange your own home screen cards.',
  'f9.h': 'OBD data',
  'f9.p': 'With an OBD adapter: fuel level and the nearest station when fuel is low. Still in beta.',
  'price.h': 'Founder prices',
  'price.lead': 'For the first 30 bookings, 3–12 Nov. Normal prices after that.',
  'ps.1': 'Custom home screen with your car & plate',
  'ps.2': 'Waze / Google Maps / TuJu, split screen & dock',
  'ps.3': 'Driving mode, speed limits & alerts',
  'ps.4': 'Prayer times, RON95, weather',
  'ps.5': 'Day, night & pure-black themes',
  'price.pickS': 'Choose Standard',
  'price.best': 'Most complete',
  'pp.0': 'Everything in Standard, plus:',
  'pp.1': 'Driver profiles (up to 4 people)',
  'pp.2': 'Arrange your own home screen cards',
  'pp.3': 'YouTube videos when parked',
  'pp.4': 'OBD data & nearest petrol station (beta)',
  'price.pickP': 'Choose Pro',
  'price.both': 'Both: <b>built for your plate number</b> · install help on WhatsApp · 12 months of free updates (installed by the app itself) · <b>pay only after it\'s confirmed to fit</b> · full refund if it doesn\'t work within 7 days.',
  'fit.h': 'Does it fit your car?',
  'fit.lead': 'J7 Launcher installs on the Android box (AI box) connected to the J7\'s screen. It doesn\'t change the car\'s own systems.',
  'fit.1': 'Jaecoo J7 (all variants)',
  'fit.2': 'An Android box / AI box on the J7 screen',
  'fit.3': 'Android 10 or newer (tested on Android 13)',
  'fit.4': '3 GB RAM or more (Pro: 4 GB or more)',
  'fit.5': 'No Android box: not yet',
  'fit.how': 'To check: on the box, open <b>Settings → About</b>. Look for the Android version and RAM.',
  'chk.h': 'Quick check',
  'chk.box': 'Does your J7 have an Android box?',
  'chk.android': 'Android version',
  'chk.ram': 'RAM',
  'opt.choose': 'Choose…',
  'opt.yes': 'Yes',
  'opt.no': 'No',
  'opt.unsure': 'Not sure',
  'opt.other': 'Other',
  'opt.radio': 'Other / radio',
  'opt.prayer': 'Prayer times',
  'opt.sun': 'Sun times (sunrise/sunset)',
  'opt.remote': 'Remote help on WhatsApp (free)',
  'opt.onsite': 'I come to your car, Klang Valley (+RM50)',
  'how.h': 'How it works',
  'how.1h': 'Fill in the form',
  'how.1p': 'Your car, plate and box. Send a photo of Settings → About on WhatsApp.',
  'how.2h': 'I confirm it fits',
  'how.2p': 'Within 24 hours. No payment before this.',
  'how.3h': 'Pay',
  'how.3p': 'DuitNow or bank transfer. You get a receipt.',
  'how.4h': 'Install & drive',
  'how.4p': '14–22 Nov. Built with your plate, installed with help on WhatsApp.',
  'book.h': 'Book a founder slot',
  'book.lead': 'No payment now. This is everything I need to build the app for your car.',
  'g1': '1 · You',
  'q.name': 'Full name',
  'q.greet': 'Name on screen (greeting)',
  'ph.greet': 'e.g. Iskandar',
  'q.phone': 'WhatsApp number',
  'q.email': 'Email (optional)',
  'q.state': 'State',
  'g2': '2 · Car',
  'q.variant': 'J7 variant',
  'q.colour': 'Colour',
  'q.plate': 'Plate number (drawn on the car on screen)',
  'g3': '3 · Android box',
  'q.android': 'Android version',
  'q.box': 'Box brand / model (if you know it)',
  'ph.box': 'e.g. TBOX from the dealer, Carlinkit, Ottocast',
  'q.shot': 'Photo of Settings → About (optional, or send it on WhatsApp)',
  'g4': '4 · Choices',
  'q.nav': 'Main map app',
  'q.music': 'Music app',
  'q.tile': 'Daily info',
  'q.lang': 'Greeting language',
  'q.driver2': 'Second driver (Pro, optional)',
  'ph.driver2': 'e.g. Siti',
  'q.install': 'Install help',
  'q.notes': 'Notes (optional)',
  'q.pdpa': 'I agree to this information being used to build and support my app, as in the <a href="#privacy">privacy notice</a>.',
  'q.terms': 'I understand: I pay after it\'s confirmed to fit; full refund if it doesn\'t work within 7 days.',
  'book.submit': 'Send booking',
  'done.h': 'Thank you! Booking received.',
  'done.ref': 'Reference',
  'done.p': 'Last step: send these details to me on WhatsApp, with a photo of your box\'s Settings → About.',
  'done.wa': 'Send on WhatsApp',
  'about.h': 'Who\'s behind J7 Launcher',
  'about.p1': 'I\'m Iskandar Tony (ISTONY), owner of a Jaecoo J7 AWD (VIPS 803). I built J7 Launcher for my own car because I wanted a screen that knows my car, and I\'m now opening the first 30 slots to other J7 owners.',
  'about.p2': 'This is an independent project: not an official Jaecoo or Chery product, and it doesn\'t touch the car\'s systems. You deal with me directly.',
  'about.contact': 'Contact',
  'about.wa': 'WhatsApp me',
  'q1': 'Does it affect my car\'s warranty?',
  'a1': 'J7 Launcher is only an app on the Android box. It doesn\'t change the car or Jaecoo\'s systems, and you can remove it any time to get the original screen back.',
  'q2': 'Is it safe to use while driving?',
  'a2': 'Driving mode uses big type and big buttons. Video only plays while the car is stopped.',
  'q3': 'What about my data?',
  'a3': 'Messages, music and location are handled on your box only and are never sent to me. See the privacy notice below for your booking details.',
  'q4': 'How do updates arrive?',
  'a4': 'The app checks for updates by itself and installs them while the car is parked (or asks you first). Free for 12 months.',
  'q5': 'What if my box doesn\'t fit?',
  'a5': 'No payment. If you\'ve paid and the app doesn\'t work within 7 days, you get a full refund.',
  'q6': 'Do I need an OBD adapter?',
  'a6': 'No. Everything works without OBD, except Pro\'s OBD data and low-fuel alert (still in beta).',
  'pv.h': 'Privacy notice & terms',
  'pv.1': 'Data collected: name, WhatsApp number, email (optional), state, car details, plate number, Android box details and your choices.',
  'pv.2': 'Purpose: checking compatibility, building the app for your car, contacting you and supporting you. Kept in my private Google Sheet, never sold or shared.',
  'pv.3': 'You can ask for a copy or deletion of your data any time on WhatsApp 014-717 2505, in line with the Personal Data Protection Act 2010.',
  'pv.4': 'Terms: founder prices for bookings from 3–12 Nov 2026. Payment only after compatibility is confirmed. Full refund if the app doesn\'t work on your box within 7 days of installation.',
  'foot.ind': 'Independent project · not an official Jaecoo / Chery product',
};

/* Messages the script writes itself. */
const MSG = {
  ms: {
    good3: 'Sesuai untuk Standard. Untuk Pro, RAM 4 GB disyorkan.',
    good4: 'Sesuai untuk Standard dan Pro. Teruskan ke borang di bawah.',
    nobox: 'J7 Launcher perlukan Android box. Tanpa box, ia belum boleh dipasang.',
    old: 'Android 9 belum disokong. Perlu Android 10 ke atas.',
    lowram: 'RAM 2 GB mungkin terlalu perlahan. WhatsApp saya dahulu, saya semak.',
    unsure: 'Tak mengapa: isi borang dan hantar gambar Tetapan → Perihal, saya semak untuk anda.',
    required: 'Sila isi ruangan bertanda merah.',
    plate: 'Nombor plat tak kelihatan betul (cth. VIPS 803 atau WXY 1234).',
    phone: 'No. WhatsApp tak kelihatan betul (cth. 012-345 6789).',
    closed: 'Ditutup',
    left: (n) => (n > 0 ? `${n} daripada 30 lagi` : 'Penuh'),
    days: (d, h) => `${d} hari ${h} jam`,
    hours: (h, m) => `${h} jam ${m} min`,
    sending: 'Menghantar…',
    waIntro: 'Salam, saya nak tempah J7 Launcher.',
    waPhoto: '(Saya lampirkan gambar Tetapan → Perihal box saya.)',
    labels: { ref: 'Rujukan', name: 'Nama', greeting: 'Nama di skrin', phone: 'WhatsApp', email: 'E-mel', state: 'Negeri', car: 'Kereta', plate: 'Plat', box: 'Box', package: 'Pakej', nav: 'App peta', music: 'Muzik', dayTile: 'Info harian', language: 'Bahasa ucapan', driver2: 'Pemandu kedua', install: 'Pasang', notes: 'Nota' },
  },
  en: {
    good3: 'Fits Standard. For Pro, 4 GB RAM is recommended.',
    good4: 'Fits Standard and Pro. Go ahead with the form below.',
    nobox: 'J7 Launcher needs an Android box. Without one it can\'t be installed yet.',
    old: 'Android 9 isn\'t supported yet. It needs Android 10 or newer.',
    lowram: '2 GB RAM may be too slow. WhatsApp me first and I\'ll check.',
    unsure: 'No problem: fill in the form and send a photo of Settings → About, and I\'ll check for you.',
    required: 'Please fill in the fields marked in red.',
    plate: 'The plate number doesn\'t look right (e.g. VIPS 803 or WXY 1234).',
    phone: 'The WhatsApp number doesn\'t look right (e.g. 012-345 6789).',
    closed: 'Closed',
    left: (n) => (n > 0 ? `${n} of 30 left` : 'Full'),
    days: (d, h) => `${d} days ${h} h`,
    hours: (h, m) => `${h} h ${m} min`,
    sending: 'Sending…',
    waIntro: 'Hi, I\'d like to book J7 Launcher.',
    waPhoto: '(I\'m attaching a photo of my box\'s Settings → About.)',
    labels: { ref: 'Reference', name: 'Name', greeting: 'Name on screen', phone: 'WhatsApp', email: 'Email', state: 'State', car: 'Car', plate: 'Plate', box: 'Box', package: 'Package', nav: 'Map app', music: 'Music', dayTile: 'Daily info', language: 'Greeting language', driver2: 'Second driver', install: 'Install', notes: 'Notes' },
  },
};

let lang = 'ms';
/** Founder slots left, from the Sheet; null until it answers (or without one). */
let slotsLeft = null;
const MS = {};

/* The page is written in BM; the BM text is read from it once, so both languages swap cleanly. */
function captureMs() {
  document.querySelectorAll('[data-i18n]').forEach((el) => { MS[el.dataset.i18n] = el.textContent; });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { MS[el.dataset.i18nHtml] = el.innerHTML; });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { MS[el.dataset.i18nPh] = el.placeholder; });
}

function setLang(next) {
  lang = next === 'en' ? 'en' : 'ms';
  const dict = lang === 'en' ? EN : MS;
  document.documentElement.lang = lang === 'en' ? 'en' : 'ms';
  document.querySelectorAll('[data-i18n]').forEach((el) => { const v = dict[el.dataset.i18n]; if (v != null) el.textContent = v; });
  document.querySelectorAll('[data-i18n-html]').forEach((el) => { const v = dict[el.dataset.i18nHtml]; if (v != null) el.innerHTML = v; });
  document.querySelectorAll('[data-i18n-ph]').forEach((el) => { const v = dict[el.dataset.i18nPh]; if (v != null) el.placeholder = v; });
  document.querySelectorAll('.lang button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.lang === lang)));
  try { localStorage.setItem('j7-lang', lang); } catch (e) { /* private mode */ }
  tick();
  check();
  showSlots();
}

function showSlots() {
  if (slotsLeft != null) document.getElementById('slots').textContent = MSG[lang].left(slotsLeft);
}

/* Countdown to the founder price closing. */
function tick() {
  const el = document.getElementById('countdown');
  const ms = CLOSES - new Date();
  if (ms <= 0) { el.textContent = MSG[lang].closed; return; }
  const d = Math.floor(ms / 864e5);
  const h = Math.floor((ms % 864e5) / 36e5);
  const m = Math.floor((ms % 36e5) / 6e4);
  el.textContent = d > 0 ? MSG[lang].days(d, h) : MSG[lang].hours(h, m);
}

/* Quick compatibility check. */
function check() {
  const box = document.getElementById('ck-box').value;
  const android = document.getElementById('ck-android').value;
  const ram = document.getElementById('ck-ram').value;
  const out = document.getElementById('ck-result');
  const m = MSG[lang];
  let text = '';
  let kind = '';
  if (box === 'no') { text = m.nobox; kind = 'bad'; }
  else if (android === '9') { text = m.old; kind = 'bad'; }
  else if (ram === '2') { text = m.lowram; kind = 'maybe'; }
  else if ([box, android, ram].includes('unsure')) { text = m.unsure; kind = 'maybe'; }
  else if (box === 'yes' && android && ram) { text = Number(ram) >= 4 ? m.good4 : m.good3; kind = 'good'; }
  out.textContent = text;
  out.className = 'result' + (kind ? ' ' + kind : '');
}

/* Plate as JPJ writes it: letters, a space, numbers, optional letter. */
function cleanPlate(v) {
  const s = v.toUpperCase().replace(/[^A-Z0-9]/g, '');
  const m = s.match(/^([A-Z]{1,4})(\d{1,4})([A-Z]?)$/);
  return m ? `${m[1]} ${m[2]}${m[3]}` : null;
}

function cleanPhone(v) {
  const d = v.replace(/\D/g, '').replace(/^60/, '0');
  return /^01\d{8,9}$/.test(d) ? d : null;
}

/* A photo of Settings → About, shrunk so the Sheet can take it. */
function shrink(file) {
  return new Promise((resolve) => {
    if (!file) return resolve(null);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1280 / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      resolve(c.toDataURL('image/jpeg', 0.8));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}

async function submit(e) {
  e.preventDefault();
  const form = e.target;
  const f = form.elements;
  const err = document.getElementById('err');
  const m = MSG[lang];
  form.querySelectorAll('.invalid').forEach((el) => el.classList.remove('invalid'));
  err.textContent = '';

  let bad = [...form.querySelectorAll('[required]')].filter((el) => (el.type === 'checkbox' ? !el.checked : el.type === 'radio' ? !form.querySelector(`[name="${el.name}"]:checked`) : !el.value.trim()));
  const plate = cleanPlate(f['plate'].value);
  const phone = cleanPhone(f['phone'].value);
  if (f['plate'].value && !plate) bad.push(f['plate']);
  if (f['phone'].value && !phone) bad.push(f['phone']);
  if (bad.length) {
    bad.forEach((el) => (el.type === 'radio' ? el.closest('.cards') : el).classList.add('invalid'));
    err.textContent = !plate && f['plate'].value ? m.plate : !phone && f['phone'].value ? m.phone : m.required;
    bad[0].focus();
    return;
  }

  const btn = document.getElementById('submit');
  btn.disabled = true;
  btn.textContent = m.sending;

  const ref = `J7-${plate.replace(' ', '')}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const data = {
    ref,
    submittedAt: new Date().toISOString(),
    siteLanguage: lang,
    name: f['name'].value.trim(),
    greeting: f['greeting'].value.trim(),
    phone,
    email: f['email'].value.trim(),
    state: f['state'].value,
    variant: f['variant'].value,
    colour: f['colour'].value,
    plate,
    android: f['android'].value,
    ram: f['ram'].value,
    box: f['box'].value.trim(),
    package: form.querySelector('[name="package"]:checked').value,
    nav: f['nav'].value,
    music: f['music'].value,
    dayTile: f['dayTile'].value,
    language: f['language'].value,
    driver2: f['driver2'].value.trim(),
    install: f['install'].value,
    notes: f['notes'].value.trim(),
  };

  if (SHEET_URL) {
    try {
      const shot = await shrink(f['shot'].files[0]);
      // text/plain keeps this a "simple" request: Apps Script answers without a preflight.
      await fetch(SHEET_URL, { method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' }, body: JSON.stringify({ ...data, shot }) });
    } catch (x) { /* WhatsApp below still carries the booking */ }
  }

  const L = m.labels;
  const body = [
    `${L.ref}: ${ref}`,
    `${L.name}: ${data.name}`,
    data.greeting && `${L.greeting}: ${data.greeting}`,
    `${L.phone}: ${data.phone}`,
    data.email && `${L.email}: ${data.email}`,
    `${L.state}: ${data.state}`,
    `${L.car}: ${data.variant}, ${data.colour}`,
    `${L.plate}: ${data.plate}`,
    `${L.box}: Android ${data.android}, ${data.ram}${data.box ? ', ' + data.box : ''}`,
    `${L.package}: ${data.package}`,
    `${L.nav}: ${data.nav} · ${L.music}: ${data.music}`,
    `${L.dayTile}: ${data.dayTile} · ${L.language}: ${data.language}`,
    data.driver2 && `${L.driver2}: ${data.driver2}`,
    `${L.install}: ${data.install}`,
    data.notes && `${L.notes}: ${data.notes}`,
  ].filter(Boolean);
  const text = [m.waIntro, '', ...body, '', m.waPhoto].join('\n');
  document.getElementById('wa-send').href = `https://wa.me/${WHATSAPP}?text=${encodeURIComponent(text)}`;
  document.getElementById('ref').textContent = ref;
  form.hidden = true;
  const done = document.getElementById('done');
  done.hidden = false;
  done.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

document.addEventListener('DOMContentLoaded', () => {
  captureMs();
  let saved = null;
  try { saved = localStorage.getItem('j7-lang'); } catch (e) { /* private mode */ }
  setLang(saved || 'ms');
  document.querySelectorAll('.lang button').forEach((b) => b.addEventListener('click', () => setLang(b.dataset.lang)));
  ['ck-box', 'ck-android', 'ck-ram'].forEach((id) => document.getElementById(id).addEventListener('change', check));
  document.querySelectorAll('[data-pick]').forEach((a) => a.addEventListener('click', () => {
    const v = a.dataset.pick === 'pro' ? 'Pro RM149' : 'Standard RM99';
    const r = document.querySelector(`[name="package"][value="${v}"]`);
    if (r) r.checked = true;
  }));
  document.getElementById('form').addEventListener('submit', submit);
  tick();
  setInterval(tick, 30000);
  if (SHEET_URL) {
    fetch(SHEET_URL).then((r) => r.json()).then((d) => {
      if (typeof d.left === 'number') { slotsLeft = d.left; showSlots(); }
    }).catch(() => { /* the counter just stays at 30 */ });
  }
});
