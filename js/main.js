/* PLUMBING_V 3 — Bespoke Studio · meccanica invisibile canonica.
   ────────────────────────────────────────────────────────────────
   CONFINE (inviolabile): questo file contiene SOLO plumbing — la meccanica
   che il visitatore non percepisce come design. NIENTE markup di sezioni,
   NIENTE stile, NIENTE struttura: concept, griglia, tipografia, hero e
   animazioni-firma si progettano DA ZERO per ogni cliente (GATE #3).
   Se qui dentro scivola del layout, questo diventa il nuovo scheletro
   condiviso — cioè il difetto "copia-incolla" che il metodo combatte.

   Come si usa: si COPIA nella cartella js/ del sito e si adatta la sola
   costante SITE. Le animazioni-firma del sito si scrivono nel proprio
   main.js DOPO questo file (o in coda a questo file, sotto il marcatore).
   Ogni bug nuovo si corregge QUI (bump PLUMBING_V + changelog nel README)
   e poi nel sito: mai il contrario.

   Fix già incorporati (non rimuovere):
   - ScrollTrigger registrato SUBITO allo script load, MAI dentro l'intro
     o un setTimeout (bug APF #5 del 16/7: race col watchdog → sezioni
     che sparivano allo scroll).
   - Reveal con once:true (niente re-animazioni da zero ri-scorrendo).
   - Watchdog 1,5s che forza visibile e UCCIDE i trigger non scattati.
   - Lightbox su [hidden] + override CSS !important (bug: display:flex
     batteva [hidden] e la lightbox restava visibile).
   - Foto-contenuto MAI lazy (regola workflow §8): il plumbing non tocca
     il loading, ma il lint lo verifica.
   - Orari Europe/Rome con finestre multiple e scavalco di mezzanotte
     (pattern Il Cavallante 18:00–00:30). */

(function () {
  'use strict';
  var root = document.documentElement;
  root.classList.add('js');
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reducedMotion) root.classList.add('reduced-motion');

  /* ══════════ CONFIG PER-SITO — l'unica parte da adattare ══════════ */
  var SITE = {
    slug: 'moes-niguarda',            // usato per localStorage lang
    /* NIENTE WhatsApp: la scheda Google espone solo il fisso 02 39461172.
       Un wa.me su un fisso manderebbe le persone in un vicolo cieco. */
    whatsapp: {
      number: '',                     // '39xxxxxxxxxx' — vuoto = niente wiring
      message: 'Ciao! Vorrei informazioni.',
      ids: ['ctaPrenota', 'heroWhatsapp', 'doveWhatsapp', 'barWhatsapp'],
    },
    /* orari: per giorno (0=domenica) un array di finestre [inizio, fine]
       in minuti-stringa 'HH:MM'. Fine oltre '24:00' = scavalca mezzanotte
       (es. ['18:00','24:30'] = apre alle 18, chiude alle 00:30 del giorno
       dopo). Giorno chiuso = []. */
    /* Tabella oraria di Google ESPANSA, letta a schermo il 26/7/2026.
       Chiusura a mezzanotte = '24:00' nella notazione del plumbing.
       Domenica: nessuna finestra del mattino. */
    hours: {
      0: [['17:00', '24:00']],
      1: [['07:00', '14:30'], ['17:00', '24:00']],
      2: [['07:00', '14:30'], ['17:00', '24:00']],
      3: [['07:00', '14:30'], ['17:00', '24:00']],
      4: [['07:00', '14:30'], ['17:00', '24:00']],
      5: [['07:00', '14:30'], ['17:00', '24:00']],
      6: [['08:00', '13:00'], ['17:00', '24:00']],
    },
    hoursStatusId: 'orarioStato',     // elemento testo stato
    hoursTableSelector: '[data-day]', // righe/li con data-day da evidenziare
    todayClass: 'is-today',
    introId: 'intro',
    introDuration: 1800,
    /* ⚠️ REGOLA ANTI-FLASH: le .banda hanno una animazione-FIRMA propria
       (entrata da sinistra). Se restassero anche nel reveal generico
       avrebbero DUE tween sull'opacità e flasherebbero. */
    revealSelector: '.reveal:not(.banda)',
    inViewClass: 'in-view',
    breakpointMenu: 960,
    /* dizionario EN: SOLO overlay — l'HTML è la versione italiana.
       ⚠️ Il markup interno (<br>, <b>) va replicato IDENTICO. */
    EN: {
      'intro.skip': 'skip',
      'nav.giornata': 'The day', 'nav.carta': 'Pizzas', 'nav.sala': 'The room',
      'nav.dove': 'Find us', 'nav.voci': 'Reviews',

      'hero.r1': 'It is all written', 'hero.r2': 'on our awning',
      'hero.p': 'Cappuccino at seven in the morning, piadine and pizza at noon, draught beer and spritz until midnight. One door, on via Paolo Rotta, open <b>seventeen hours</b>.',
      'hero.cta1': 'Call and book', 'hero.cta2': 'See the pizzas',

      'detto.cit': '«Even though sandwiches were not on the menu, they were kind enough to make me one, and it was simply delicious.»',
      'detto.chi': 'Viviana Pedone — Google review',
      'detto.coda': 'That is not something you can put on a menu. It is the reason people come back.',

      'gio.eti': 'Seventeen hours',
      'gio.titolo': 'The same door, five different moments',
      'gio.1t': 'Seven',
      'gio.1p': 'We open as a bar. Coffee, cappuccino, a pastry at the counter. It is the part of us almost nobody expects — and in fact pastries come up in the reviews more often than the word «dinner».',
      'gio.2t': 'Midday',
      'gio.2p': 'The set menu is written on the blackboard in the room, not in an app: <b>one course 9 €</b>, <b>full menu 10 €</b>, drinks not included. It changes, so it is worth asking what is on today.',
      'gio.3t': 'Five',
      'gio.3p': 'We reopen and aperitivo begins — the single most mentioned word in our reviews. Spritz is 3 €, and the craft beer selection goes beyond our house taps.',
      'gio.4t': 'Evening',
      'gio.4p': 'Round pizza from the oven, piadine, stuffed focaccia. The room is large and the tables spill onto the pavement, under the awning.',
      'gio.5t': 'Midnight',
      'gio.5p': 'We close. Every day, Sundays included — the only difference is that on Sunday there is no morning.',

      'car.eti': 'The menu',
      'car.titolo': 'Twenty pizzas, and they named them themselves',
      'car.p': 'Starting at six euros. Below is part of the list: the full one is longer, and also covers piadine, stuffed focaccia and house desserts at 3.50 €.',
      'car.nota': 'Prices as published on our Google listing. <b>House desserts 3.50 €</b>: Nutella piadina, house tiramisù, tartufo nero, vanilla gelato.',
      'pz.margherita': 'tomato, mozzarella, basil',
      'pz.napoli': 'tomato, anchovy fillets, garlic, leccine olives, basil, oregano',
      'pz.wurstel': 'tomato, mozzarella, frankfurters',
      'pz.bucatini': 'tomato, chopped onion, guanciale, pecorino romano, pepper',
      'pz.bufala': 'tomato, buffalo mozzarella, basil',
      'pz.friarielli': 'provola, Neapolitan broccoli rabe, sausage, grana',
      'pz.arlecchino': 'mozzarella, olives, cherry tomatoes, pistachio pesto and chopped pistachio',
      'pz.anni80': 'tomato, mozzarella, cooked ham, mushrooms, artichokes, olives',
      'pz.norma': 'tomato, mozzarella, fried aubergine, grated salted ricotta',
      'pz.montanara': 'tomato, mozzarella, taleggio, speck',
      'pz.pizzica': 'mozzarella, cherry tomatoes, anchovy fillets, oregano, burrata',
      'pz.moes': 'smoked provola, spicy salami, fried aubergine, ricotta cream, basil',
      'pz.stacurcia': 'tomato, mozzarella, gorgonzola, nduja, spicy salami, peppers, olives',
      'pz.stella': 'tomato, mozzarella, porcini mushrooms, bresaola, rosemary',
      'pz.perfetta': 'tomato, buffalo mozzarella, rocket, cherry tomatoes, Parma ham, grana shavings, balsamic reduction',
      'pz.pistacchio': 'focaccia with mortadella, burrata, pistachio pesto and chopped pistachio',

      'sal.eti': 'The place',
      'sal.titolo': '«A neighbourhood bar, a good point of reference»',
      'sal.p1': 'A customer wrote that on Google, and it is the best definition we could have been given. The room is large, the floor is wood, framed football shirts hang on the walls along with a photograph of Niguarda from when the Bianchi ice-cream shop stood here.',
      'sal.p2': 'The words that come back most often in our reviews are not dishes: they are <b>atmosphere</b>, <b>friendliness</b>, <b>warmth</b>, <b>informal</b>. Put together they even beat aperitivo.',

      'gal.titolo': 'From the counter to the tables',
      'voc.eti': 'In their words',
      'voc.titolo': 'Six hundred and three Google reviews',

      'dov.eti': 'Find us',
      'dov.titolo': 'Via Privata Paolo Rotta 10, Niguarda',
      'dov.p': 'A short walk from the <b>Niguarda Centro</b> tram stop. You will recognise us by the awning and the tables on the pavement.',
      'dov.cap': 'Opening hours',
      'dov.tel': 'Call: 02 39461172', 'dov.mappa': 'Open directions',
      'g.lun': 'Monday', 'g.mar': 'Tuesday', 'g.mer': 'Wednesday', 'g.gio': 'Thursday',
      'g.ven': 'Friday', 'g.sab': 'Saturday', 'g.dom': 'Sunday', 'g.chiuso': 'closed',

      'faq.titolo': 'What people ask us on the phone',
      'faq.q1': 'What time do you open?',
      'faq.a1': 'Monday to Friday at <b>7 in the morning</b>, Saturday at 8. Then we close at 14:30 and reopen at 17:00, until midnight. On Sunday we are open evenings only, from 17:00.',
      'faq.q2': 'Do you serve breakfast?',
      'faq.a2': 'Yes. At seven in the morning the counter is a bar counter: coffee, cappuccino and pastries. It is the part of us almost nobody expects.',
      'faq.q3': 'Is there a set menu?',
      'faq.a3': 'Yes, and it is written on the blackboard in the room: <b>one course 9 €</b>, <b>full menu 10 €</b>, drinks not included. It changes, so it is worth calling to find out what is on today.',
      'faq.q4': 'Can we sit outside?',
      'faq.a4': 'Yes, there are tables and stools on the pavement in front of the place, under the awning.',
      'faq.q5': 'Do we need to book?',
      'faq.a5': 'The room is large and there is often space without booking, but on busy evenings a reservation is recommended: one phone call is enough.',
      'faq.q6': 'Do you have craft beer?',
      'faq.a6': 'Yes, alongside the classic taps we keep a craft beer selection, and behind the counter there is the cocktail side too: spritz is 3 €.',

      'foot.ind': 'Via Privata Paolo Rotta 10<br>20162 Milan · Niguarda',
      'foot.orari': 'Mon–Fri 07:00–14:30 · 17:00–00:00<br>Sat 08:00–13:00 · 17:00–00:00<br>Sun 17:00–00:00',
      'foot.nota': 'Demonstration website built by Bespoke Studio from public data on the Google listing. Prices and availability to be confirmed on site.',

      'bar.chiama': 'Call', 'bar.carta': 'Pizzas', 'bar.dove': 'Find us',
    },
  };
  /* ═════════════════════════════════════════════════════════════════ */

  /* ---------- WhatsApp wiring ---------- */
  if (SITE.whatsapp.number) {
    var waHref = 'https://wa.me/' + SITE.whatsapp.number + '?text=' +
      encodeURIComponent(SITE.whatsapp.message);
    SITE.whatsapp.ids.forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.href = waHref; el.target = '_blank'; el.rel = 'noopener'; }
    });
  }

  /* ---------- GSAP: registrazione IMMEDIATA + reveal + watchdog ---------- */
  var hasGsap = typeof gsap !== 'undefined';
  var hasST = hasGsap && typeof ScrollTrigger !== 'undefined';
  if (hasST) gsap.registerPlugin(ScrollTrigger);

  function showAllReveals() {
    var els = document.querySelectorAll(SITE.revealSelector);
    els.forEach(function (el) { el.classList.add(SITE.inViewClass); });
    if (hasGsap) {
      if (hasST) {
        els.forEach(function (el) {
          ScrollTrigger.getAll().forEach(function (st) {
            if (st.trigger === el && !st.progress) st.kill();
          });
        });
      }
      gsap.set(els, { opacity: 1, y: 0, x: 0 });
    }
  }
  // FIX FOUC (18/7): il watchdog è SOLO un fallback se GSAP non c'è (o reduced-motion).
  // Rivelare in anticipo tutti i .reveal mentre gli scroll-trigger sono attivi causava il
  // flash (scompaiono/ricompaiono) sotto la piega. Con GSAP attivo, rivelano gli ScrollTrigger.
  setTimeout(function () { if (!hasGsap || reducedMotion) showAllReveals(); }, 1500);

  if (hasGsap && !reducedMotion) {
    // reveal generico: le animazioni-FIRMA del sito vanno oltre questo,
    // ma si registrano ANCHE LORO subito, mai dopo l'intro.
    // ⚠️ REGOLA ANTI-FLASH (18/7): un elemento .reveal deve avere UNA SOLA animazione che
    // ne porta l'opacità a 1. Se un elemento ha una FIRMA che ne anima l'opacità (stagger,
    // timeline, ecc.), ESCLUDILO da qui via SITE.revealSelector (es. '.reveal:not(.mondo)'),
    // altrimenti il reveal generico + la firma si sovrappongono e l'elemento FLASHA.
    // immediateRender:false → lo stato "from" (opacity:0) NON viene ri-applicato ad ogni
    // ScrollTrigger.refresh() (che scatta al window.load mentre scrolli) → niente flash su refresh.
    gsap.utils.toArray(SITE.revealSelector).forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 28 }, {
        opacity: 1, y: 0, duration: 0.7, ease: 'power2.out', immediateRender: false,
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
      });
    });
  } else {
    // fallback senza GSAP: IntersectionObserver + classe
    if ('IntersectionObserver' in window && !reducedMotion) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { e.target.classList.add(SITE.inViewClass); io.unobserve(e.target); }
        });
      }, { threshold: 0.12 });
      document.querySelectorAll(SITE.revealSelector).forEach(function (el) { io.observe(el); });
    } else {
      showAllReveals();
    }
  }

  /* ---------- intro skippabile (NON gate-a nulla) ---------- */
  var intro = document.getElementById(SITE.introId);
  /* ⚠️ L'hook si legge AL MOMENTO DELLA CHIAMATA, mai catturato per valore
     qui. Il codice-firma vive sotto il marcatore di fine plumbing — cioè
     gira DOPO questa riga — quindi `window.bespokeHeroEntrance ||
     function(){}` congelava la funzione vuota e l'entrata dell'hero non
     partiva più: titolo a opacity 0 per sempre, hero vuota sul live.
     (20/7/2026, riprodotto a schermo su Benessere Futuro #159.) */
  function heroEntrance() {
    if (typeof window.bespokeHeroEntrance === 'function') window.bespokeHeroEntrance();
  }
  function hideIntro() {
    if (!intro) return;
    var el = intro; intro = null;
    el.classList.add('hide');
    setTimeout(function () { el.remove(); }, 700);
    heroEntrance();
  }
  // rimozione IMMEDIATA (niente fade): serve quando qualcosa deve stare sopra
  // l'intro subito, es. l'apertura del menu. Durante il fade l'intro resta
  // hit-testable e i link del drawer non sono cliccabili.
  function killIntroNow() {
    if (!intro) return;
    var el = intro; intro = null;
    el.remove();
    heroEntrance();
  }
  if (reducedMotion || !intro) {
    if (intro) { intro.remove(); intro = null; }
    heroEntrance();
  } else {
    setTimeout(hideIntro, SITE.introDuration);
    setTimeout(hideIntro, 6000); // safety net: l'intro non può incastrarsi
    intro.addEventListener('click', hideIntro);
  }

  /* ---------- burger menu (inert + focus + Escape + resize) ---------- */
  var burger = document.getElementById('burger');
  /* 26/7/2026 (Il Papiro #168) — IL PANNELLO SI RISOLVE DA `aria-controls`.
     Il canone apriva sempre `#mainNav`, dando per scontato che la nav
     desktop FOSSE anche il drawer. Molti siti invece hanno un drawer
     separato (`#mobile-menu`) con `hidden`, mentre `#mainNav` su mobile è
     `display:none`: il burger aggiungeva `nav-open` a un elemento nascosto
     e il menu non si apriva. È la stessa decisione già presa il 20/7 per
     qa-motion — «è lì che il markup accessibile dice qual è il pannello» —
     che però non era mai rientrata qui. */
  var nav = (function () {
    var byAria = burger && burger.getAttribute('aria-controls');
    return (byAria && document.getElementById(byAria)) || document.getElementById('mainNav');
  })();
  if (burger && nav) {
    var navUsaHidden = nav.hasAttribute('hidden');
    var lastFocus = null;
    var closeNav = function () {
      nav.classList.remove('nav-open');
      if (navUsaHidden) nav.hidden = true;
      burger.setAttribute('aria-expanded', 'false');
      if (lastFocus) { lastFocus.focus(); lastFocus = null; }
    };
    var openNav = function () {
      // L'intro ha z-index alto ed è figlia del body: se è ancora a schermo
      // copre il drawer (che vive nello stacking context dell'header) e i link
      // risultano non cliccabili. Aprire il menu chiude l'intro.
      // (bug trovato da qa-motion su Linea Uomo, 19/7/2026 → PLUMBING_V 2)
      if (typeof killIntroNow === 'function') killIntroNow();
      lastFocus = document.activeElement;
      if (navUsaHidden) nav.hidden = false;
      nav.classList.add('nav-open');
      burger.setAttribute('aria-expanded', 'true');
      var first = nav.querySelector('a, button');
      if (first) first.focus();
    };
    burger.addEventListener('click', function () {
      nav.classList.contains('nav-open') ? closeNav() : openNav();
    });
    nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeNav); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) closeNav();
    });
    window.addEventListener('resize', function () {
      if (window.innerWidth > SITE.breakpointMenu) closeNav();
    });
  }

  /* ---------- lightbox accessibile ---------- */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightboxImg');
  var lightboxClose = document.getElementById('lightboxClose');
  if (lightbox && lightboxImg) {
    var opener = null;
    var openLb = function (src, alt) {
      lightboxImg.src = src; lightboxImg.alt = alt || '';
      lightbox.hidden = false;
      document.body.style.overflow = 'hidden';
      if (lightboxClose) lightboxClose.focus();
    };
    var closeLb = function () {
      lightbox.hidden = true; lightboxImg.src = '';
      document.body.style.overflow = '';
      if (opener) { opener.focus(); opener = null; }
    };
    document.querySelectorAll('[data-full]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        opener = btn;
        var img = btn.querySelector('img');
        openLb(btn.getAttribute('data-full'), img ? img.alt : '');
      });
    });
    if (lightboxClose) lightboxClose.addEventListener('click', closeLb);
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) closeLb(); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !lightbox.hidden) closeLb();
    });
  }

  /* ---------- orari dinamici Europe/Rome (finestre multiple + scavalco) ---------- */
  function romeNow() {
    try {
      var f = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false,
      });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      var get = function (t) { return p.find(function (x) { return x.type === t; }).value; };
      return { day: map[get('weekday')], mins: parseInt(get('hour'), 10) * 60 + parseInt(get('minute'), 10) };
    } catch (e) {
      var d = new Date();
      return { day: d.getDay(), mins: d.getHours() * 60 + d.getMinutes() };
    }
  }
  var toMin = function (hm) {
    var a = hm.split(':');
    return parseInt(a[0], 10) * 60 + parseInt(a[1], 10);
  };
  var fmt = function (m) {
    m = m % 1440;
    return ('0' + Math.floor(m / 60)).slice(-2) + ':' + ('0' + (m % 60)).slice(-2);
  };
  var DAYS_IT = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function hoursState() {
    var now = romeNow();
    // finestra del giorno corrente
    var wins = SITE.hours[now.day] || [];
    for (var i = 0; i < wins.length; i++) {
      var s = toMin(wins[i][0]), e = toMin(wins[i][1]);
      if (now.mins >= s && now.mins < Math.min(e, 1440)) {
        return { open: true, day: now.day, closesAt: fmt(e) };
      }
    }
    // coda dopo mezzanotte della sera PRIMA
    var prev = (now.day + 6) % 7;
    var pw = SITE.hours[prev] || [];
    for (var j = 0; j < pw.length; j++) {
      var pe = toMin(pw[j][1]);
      if (pe > 1440 && now.mins < pe - 1440) {
        return { open: true, day: prev, closesAt: fmt(pe) };
      }
    }
    // chiuso: prossima apertura (oggi o nei prossimi 7 giorni)
    for (var k = 0; k < wins.length; k++) {
      if (now.mins < toMin(wins[k][0])) {
        return { open: false, day: now.day, opensToday: fmt(toMin(wins[k][0])) };
      }
    }
    for (var d = 1; d <= 7; d++) {
      var nd = (now.day + d) % 7;
      var nw = SITE.hours[nd] || [];
      if (nw.length) return { open: false, day: now.day, opensDay: nd, opensAt: fmt(toMin(nw[0][0])) };
    }
    return { open: false, day: now.day };
  }

  function renderHours() {
    var el = document.getElementById(SITE.hoursStatusId);
    var st = hoursState();
    document.querySelectorAll(SITE.hoursTableSelector).forEach(function (row) {
      row.classList.toggle(SITE.todayClass,
        parseInt(row.getAttribute('data-day'), 10) === st.day);
    });
    if (!el) return;
    var en = root.lang === 'en';
    var txt;
    if (st.open) {
      txt = (en ? 'Open now' : 'Aperto ora') + ' · ' + (en ? 'closes at ' : 'chiude alle ') + st.closesAt;
    } else if (st.opensToday) {
      txt = (en ? 'Closed · opens today at ' : 'Chiuso · apre oggi alle ') + st.opensToday;
    } else if (st.opensAt !== undefined) {
      txt = (en ? 'Closed · opens ' + DAYS_EN[st.opensDay] + ' at ' : 'Chiuso · apre ' + DAYS_IT[st.opensDay] + ' alle ') + st.opensAt;
    } else {
      txt = en ? 'Closed' : 'Chiuso';
    }
    el.textContent = txt;
  }
  renderHours();
  setInterval(renderHours, 60000);

  /* ---------- i18n overlay (EN sopra l'IT del DOM) ---------- */
  var originals = {}; // attr -> key -> testo IT
  var I18N_ATTRS = [
    ['data-i18n', null],
    ['data-i18n-aria', 'aria-label'],
    ['data-i18n-alt', 'alt'],
    ['data-i18n-placeholder', 'placeholder'],
    ['data-i18n-title', 'title'],
  ];
  function setLang(lang) {
    root.lang = lang === 'en' ? 'en' : 'it';
    I18N_ATTRS.forEach(function (pair) {
      var dattr = pair[0], target = pair[1];
      if (!originals[dattr]) originals[dattr] = {};
      document.querySelectorAll('[' + dattr + ']').forEach(function (el) {
        var key = el.getAttribute(dattr);
        var store = originals[dattr];
        /* innerHTML, NON textContent: gli elementi tradotti contengono
           quasi sempre markup (<strong>, <br>) e con textContent il primo
           passaggio a EN lo appiattisce — tornando in italiano il grassetto
           non torna più. I valori del dizionario sono statici e scritti da
           noi. (20/7/2026: la flotta era già così, il boilerplate no.) */
        if (!(key in store)) store[key] = target ? el.getAttribute(target) : el.innerHTML;
        var val = lang === 'en' && SITE.EN[key] !== undefined ? SITE.EN[key] : store[key];
        if (target) el.setAttribute(target, val); else el.innerHTML = val;
      });
    });
    renderHours();
    /* stato visivo della coppia di bottoni lingua, se il sito la usa */
    document.querySelectorAll('[data-lang]').forEach(function (b) {
      var on = b.getAttribute('data-lang') === root.lang;
      b.classList.toggle('is-on', on);
      if (b.tagName === 'BUTTON') b.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    try { localStorage.setItem(SITE.slug + '-lang', lang); } catch (e) {}
  }
  /* 26/7/2026 (Il Papiro #168) — SI CABLANO ENTRAMBE LE FORME DI SELETTORE.
     Il canone conosceva solo il toggle singolo `#langToggle`, ma nella
     flotta esiste da tempo anche la COPPIA di bottoni `[data-lang]`
     (Warsa, Mido…): `i18n-roundtrip` era già stato insegnato a riconoscerle
     il 20/7, il plumbing no. Chi copiava il boilerplate e usava la coppia
     si ritrovava il cambio lingua MORTO, e nessun lint statico se ne
     accorgeva (lo becca solo qa-motion, a runtime). */
  var langToggle = document.getElementById('langToggle');
  if (langToggle) {
    langToggle.addEventListener('click', function () {
      setLang(root.lang === 'en' ? 'it' : 'en');
    });
  }
  document.querySelectorAll('[data-lang]').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); });
  });
  try {
    if (localStorage.getItem(SITE.slug + '-lang') === 'en') setLang('en');
  } catch (e) {}

  /* ---------- action-bar mobile (opzionale: #actionBar) ---------- */
  var actionBar = document.getElementById('actionBar');
  if (actionBar) {
    var onScroll = function () {
      actionBar.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.6);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ══════════ FINE PLUMBING — da qui in giù SOLO il codice-firma
     del sito (animazioni e interazioni uniche del cliente), che si
     registra comunque SUBITO, mai dentro setTimeout/intro. ══════════ */

  /* ═══════════════════════════════════════════════════════════════════
     FIRMA — LA TENDA
     Sulla loro facciata, sopra le vetrine, c'è scritto PIADAVINO
     CAPPUCCINO, su una tenda a righe con il bordo a festoni. Qui la
     tenda SI SROTOLA in orizzontale all'ingresso: scaleX dal centro.
     Movimento ORIZZONTALE di proposito — la firma di #168 (ieri) è un
     ventaglio radiale, e due gesti simili di fila si somigliano.
     ⚠️ RETE DI SICUREZZA: telo e parole partono da CSS a piena opacità
     e senza transform. Se GSAP non c'è, la tenda è semplicemente già
     srotolata — nessun elemento resta invisibile (lezione Yum! Ramen).
     ═══════════════════════════════════════════════════════════════════ */
  var telo = document.querySelector('.tenda__telo');
  var festone = document.querySelector('.tenda__festone');
  var parole = document.querySelector('.tenda__parole');

  window.bespokeHeroEntrance = function () {
    if (!hasGsap || reducedMotion || !telo) return;
    var tl = gsap.timeline();
    tl.fromTo([telo, festone],
      { scaleX: 0.04, transformOrigin: 'center top' },
      { scaleX: 1, duration: 0.75, ease: 'power3.out', immediateRender: false }
    );
    tl.fromTo(parole,
      { opacity: 0, y: 10 },
      { opacity: 1, y: 0, duration: 0.45, ease: 'power2.out', immediateRender: false },
      '-=0.2'
    );
    tl.fromTo('.apertura__riga',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out', stagger: 0.09, immediateRender: false },
      '-=0.25'
    );
  };

  /* le bande della giornata entrano da sinistra, una dopo l'altra:
     il tempo che scorre in orizzontale, coerente con la tenda. */
  if (hasGsap && hasST && !reducedMotion) {
    gsap.utils.toArray('.giornata__bande .banda').forEach(function (el, i) {
      gsap.fromTo(el,
        { opacity: 0, x: -22 },
        {
          opacity: 1, x: 0, duration: 0.55, ease: 'power2.out',
          delay: (i % 5) * 0.04, immediateRender: false,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        }
      );
    });
  }
})();
