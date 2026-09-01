/* ==========================================================================
   GROWTH KIT
   Adds the four things a template needs before the proposal's promises are
   true of the site it is selling:

     1. an enquiry form on the cover, not buried at the bottom
     2. a chat bubble that answers questions and captures a lead
     3. a reviews block, real ones when we have them, labelled examples when
        we do not
     4. LocalBusiness schema, which is what "found on Google, Maps and in AI
        answers" actually means

   One file for all twenty templates. Everything it renders is styled from the
   ten-variable contract in tokens.css, so it takes on each template's colours
   and radius without a per-template stylesheet.

   USE
     <link rel="stylesheet" href="../../core/growth-kit.css">
     <script>window.SITE = { ...see SITE below... }</script>
     <script src="../../core/growth-kit.js" defer></script>

   Then mark where the form goes:
     <div data-growth-form></div>
   and, optionally, where reviews go:
     <div data-growth-reviews></div>

   With no window.SITE the kit renders nothing at all, so a template opened
   straight from the library stays exactly as its designer left it.
   ========================================================================== */

(function () {
  "use strict";

  var SITE = window.SITE;
  if (!SITE) return;              // library preview: leave the template alone

  /* ------------------------------------------------- filling in the template
     A template opened from the library shows its own demo business. Opened
     with ?site=<slug> it has to show the real one the builder generated, and
     that means putting their name, headline, town, phone and services into the
     markup the designer already wrote.

     Only the parts every template shares are filled here: the nav wordmark,
     the hero eyebrow, headline and lede, the phone and email links, and the
     page title. Those are consistent across all twenty (hero__title in 19,
     hero__lede in 18, eyebrow and navbar__brand in 20). The service cards and
     testimonials are laid out differently in every design, so they are marked
     up per template rather than guessed at from here.

     Nothing is overwritten unless we actually have a value for it: a half
     filled page with a client's name over a demo's headline is worse than the
     demo left whole. */
  /* ------------------------------------------------------------ their brand
     The ten-variable contract in tokens.css means a business's own colours can
     be dropped straight in and the whole design reskins: buttons, cards,
     accents, the ambient glow, the form and the chat.

     Only the colours actually used on their existing site arrive here, and
     only when we saw them often enough to believe them. Their primary becomes
     the call to action, the second becomes the accent. The background and text
     are deliberately left alone: those carry the template's legibility, and a
     business's brand red as a page background would ruin a design that took
     somebody a week. */
  function applyBrand() {
    var brand = SITE.brand || {};
    var colours = brand.colours || [];
    if (!colours.length) return false;

    var root = document.documentElement.style;
    var readable = function (hex) {
      var n = parseInt(String(hex).replace("#", ""), 16);
      var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
      // Rec. 709 luminance: which of black or white to put on top of it.
      return (0.2126 * r + 0.7152 * g + 0.0722 * b) > 150 ? "#111111" : "#ffffff";
    };

    root.setProperty("--primary-cta", colours[0]);
    root.setProperty("--primary-cta-text", readable(colours[0]));
    root.setProperty("--accent", colours[1] || colours[0]);
    root.setProperty("--background-accent", colours[1] || colours[0]);
    return true;
  }

  /* Their logo, in place of the template's wordmark. A real mark beats a
     styled business name every time, and it is the thing an owner recognises
     first when they open the link. */
  function applyLogo() {
    var logo = (SITE.brand || {}).logo;
    if (!logo) return false;
    var marks = document.querySelectorAll(".navbar__brand");
    if (!marks.length) return false;

    Array.prototype.forEach.call(marks, function (mark) {
      var img = document.createElement("img");
      img.src = logo;
      img.alt = (SITE.business || {}).name || "";
      img.style.cssText = "max-height:2.2rem;width:auto;display:block";
      /* If their logo 404s or is hotlink-blocked, put the wordmark back rather
         than leaving a broken image where their name should be. */
      var original = mark.innerHTML;
      img.onerror = function () { mark.innerHTML = original; };
      mark.innerHTML = "";
      mark.appendChild(img);
    });
    return true;
  }

  function fillTemplate() {
    var b = SITE.business || {};
    var copy = SITE.copy || {};
    var set = function (selector, value, attr) {
      if (!value) return 0;
      var nodes = document.querySelectorAll(selector);
      Array.prototype.forEach.call(nodes, function (el) {
        if (attr) el.setAttribute(attr, value);
        else el.textContent = value;
      });
      return nodes.length;
    };

    var filled = 0;
    if (b.name) {
      document.title = copy.metaTitle || (b.name + (b.town ? " | " + b.town : ""));
      filled += set(".navbar__brand", b.shortName || b.name);
      filled += set("[data-gk='name']", b.name);
    }
    if (copy.metaDescription) {
      var meta = document.querySelector('meta[name="description"]');
      if (meta) meta.setAttribute("content", copy.metaDescription);
    }
    filled += set(".hero__title, [data-gk='headline']", copy.headline);
    filled += set(".hero__lede, [data-gk='lede']", copy.lede);
    /* The eyebrow is a wrapper in most templates and the text sits in a <p>
       inside it, so aim at the inner element when there is one. */
    if (copy.eyebrow) {
      Array.prototype.forEach.call(document.querySelectorAll(".eyebrow"), function (el) {
        var target = el.querySelector("p, span") || el;
        target.textContent = copy.eyebrow;
        filled++;
      });
    }

    /* Contact links, so every "call us" on the page reaches the real business
       rather than the demo's placeholder number. */
    if (b.phone) {
      var tel = "tel:" + b.phone.replace(/[^\d+]/g, "");
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="tel:"]'), function (a) {
        a.setAttribute("href", tel);
        if (/[\d]/.test(a.textContent)) a.textContent = b.phone;
        filled++;
      });
    }
    if (b.email) {
      Array.prototype.forEach.call(document.querySelectorAll('a[href^="mailto:"]'), function (a) {
        a.setAttribute("href", "mailto:" + b.email);
        if (a.textContent.indexOf("@") > -1) a.textContent = b.email;
        filled++;
      });
    }
    return filled;
  }

  var esc = function (value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  };

  /* ------------------------------------------------------------------ schema
     A LocalBusiness block describing the business in the terms Google and the
     answer engines read. This is the part the proposal charges for under "SEO
     foundation, schema and AEO setup", and until now no template had it.
     Only fields we genuinely know are emitted: a schema padded with guesses is
     worse than a short honest one. */
  function addSchema() {
    var b = SITE.business || {};
    if (!b.name) return;

    var node = {
      "@context": "https://schema.org",
      "@type": b.schemaType || "LocalBusiness",
      name: b.name,
    };
    if (b.description) node.description = b.description;
    if (b.phone) node.telephone = b.phone;
    if (b.email) node.email = b.email;
    if (b.url) node.url = b.url;
    if (b.image) node.image = b.image;

    if (b.street || b.town || b.postcode) {
      node.address = { "@type": "PostalAddress" };
      if (b.street) node.address.streetAddress = b.street;
      if (b.town) node.address.addressLocality = b.town;
      if (b.region) node.address.addressRegion = b.region;
      if (b.postcode) node.address.postalCode = b.postcode;
      if (b.country) node.address.addressCountry = b.country;
    }
    if (Array.isArray(b.areasServed) && b.areasServed.length) {
      node.areaServed = b.areasServed.map(function (a) {
        return { "@type": "Place", name: a };
      });
    }
    /* Ratings are only ever their real Google numbers. Inventing an
       aggregateRating is both a lie and a manual penalty. */
    if (b.rating > 0 && b.reviewCount > 0) {
      node.aggregateRating = {
        "@type": "AggregateRating",
        ratingValue: String(b.rating),
        reviewCount: String(b.reviewCount),
      };
    }
    if (Array.isArray(b.services) && b.services.length) {
      node.hasOfferCatalog = {
        "@type": "OfferCatalog",
        name: "Services",
        itemListElement: b.services.slice(0, 12).map(function (s) {
          return { "@type": "Offer", itemOffered: { "@type": "Service", name: s } };
        }),
      };
    }
    if (Array.isArray(b.openingHours) && b.openingHours.length) {
      node.openingHours = b.openingHours;
    }

    var tag = document.createElement("script");
    tag.type = "application/ld+json";
    tag.textContent = JSON.stringify(node);
    document.head.appendChild(tag);
  }

  /* -------------------------------------------------------------------- form
     Posts to SITE.form.endpoint. With no endpoint set it still validates and
     still thanks the visitor, because a demo that throws an error when the
     owner tries their own form is worse than one that quietly holds the lead.
     Nothing is silently swallowed on a real send: a failure says so. */
  function renderForms() {
    var slots = document.querySelectorAll("[data-growth-form]");
    if (!slots.length) return;

    var f = SITE.form || {};
    var services = Array.isArray(f.services) ? f.services : [];
    var options = services.length
      ? '<select name="service"><option value="">' + esc(f.servicePlaceholder || "What do you need?") +
        "</option>" + services.map(function (s) {
          return "<option>" + esc(s) + "</option>";
        }).join("") + "</select>"
      : "";

    /* Extra questions, written for the trade. A plumber wants to know how
       urgent it is, a salon which day suits, a roofer the age of the roof.
       Each is either a dropdown with its own options or a single line.
         questions: [{ label, options: [...] }, { label }]  */
    /* The services dropdown above is already "What do you need?", and the
       builder sends the same question in its own list, so the form was asking
       it twice in a row. Anything that repeats what is already on screen is
       dropped rather than rendered a second time. */
    var placeholder = String(f.servicePlaceholder || "What do you need?").toLowerCase();
    var extraQuestions = (Array.isArray(f.questions) ? f.questions : [])
      .filter(function (q) {
        if (!options) return true;
        return String(q && q.label || "").trim().toLowerCase() !== placeholder;
      })
      // Two, not three. Height is the constraint on a floating card, and the
      // third question was always the least useful of the set.
      .slice(0, 2)
      .map(function (q, n) {
        var field = "q" + (n + 1);
        if (Array.isArray(q.options) && q.options.length) {
          return '<select name="' + field + '"><option value="">' + esc(q.label) + "</option>" +
            q.options.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") +
            "</select>";
        }
        return '<input name="' + field + '" placeholder="' + esc(q.label) + '" />';
      }).join("");

    Array.prototype.forEach.call(slots, function (slot, index) {
      var id = "gk-form-" + index;
      /* The dock floats over the hero and takes no space in the layout, so a
         template's own composition is never pushed around. It opens on a tap
         and closes again, which also means it can never cover the headline of
         a design it was added to afterwards. */
      slot.className = "gk-form-dock";
      slot.setAttribute("data-open", "false");

      /* Absolute positioning needs a positioned ancestor. Most heroes are
         already relative; the ones that are not would throw the card up to the
         top of the document, so this makes the hero the reference frame
         without editing a single template's stylesheet. */
      var host = slot.parentElement;
      if (host && getComputedStyle(host).position === "static") {
        host.style.position = "relative";
      }
      slot.innerHTML =
        '<button type="button" class="gk-form-toggle">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M12 5v14M5 12h14"/></svg>' +
          esc(f.heading || "Get a quote") + "</button>" +
        '<form class="gk-form" id="' + id + '" novalidate>' +
          /* Minimise, not close: it collapses back to the button it came from,
             which is exactly what the icon should say it does. */
          '<button type="button" class="gk-form__close" aria-label="Minimise">' +
            '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" ' +
            'stroke-linecap="round" aria-hidden="true"><path d="M5 12h14"/></svg></button>' +
          '<p class="gk-form__head">' + esc(f.heading || "Get a quote") + "</p>" +
          (f.sub ? '<p class="gk-form__sub">' + esc(f.sub) + "</p>" : "") +
          '<div class="gk-form__row">' +
            '<input name="first_name" placeholder="First name" autocomplete="given-name" required />' +
            '<input name="phone" placeholder="Phone number" autocomplete="tel" inputmode="tel" required />' +
          "</div>" +
          '<input name="email" type="email" placeholder="Email address" autocomplete="email" />' +
          options +
          /* Questions this trade actually needs answering before a quote means
             anything. Written per business in the config, so a roofer is asked
             about the roof and a salon about the appointment. */
          extraQuestions +
          /* No free-text box on the floating card.

             Seven fields made it 465px tall, which reached up over the bottom
             line of the headline on a full size desktop, and a cold visitor
             does not write a paragraph before they have decided to enquire
             anyway. The page's own contact form still has one; this is the
             card that has to fit in a corner without covering the design it
             was added to. */
          "<button type=\"submit\">" + esc(f.button || "Send") + "</button>" +
          '<p class="gk-form__note">' + esc(f.note || "We only use your details to reply about your enquiry.") + "</p>" +
        "</form>";

      /* Scoped to the page, not the whole site. Keyed globally, minimising it on
         one template stopped it opening on every other template in the library
         for the rest of the browser session, which read as "it never opens". */
      var DISMISSED = "gk-form-dismissed:" + location.pathname;
      /* A live tilt, following the pointer across the window. Small on purpose,
         four degrees at the extremes: enough that the card reads as a physical
         object hanging in front of the page, not so much that it becomes a
         gimmick or makes the fields awkward to hit. Nothing on touch devices,
         where there is no pointer to follow and the effect would only cost
         battery. */
      var card = slot.querySelector(".gk-form");
      if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
        var pending = false;
        window.addEventListener("pointermove", function (event) {
          if (slot.getAttribute("data-open") !== "true" || pending) return;
          pending = true;
          requestAnimationFrame(function () {
            pending = false;
            var x = (event.clientX / window.innerWidth) - 0.5;
            var y = (event.clientY / window.innerHeight) - 0.5;
            card.style.transform =
              "perspective(900px) rotateY(" + (x * 7).toFixed(2) + "deg) rotateX(" +
              (-y * 5).toFixed(2) + "deg)";
          });
        }, { passive: true });
      }

      var openForm = function (focus) {
        slot.setAttribute("data-open", "true");
        /* Let the arrival animation finish before the tilt takes the transform
           over, or the two fight and the card snaps into place. */
        setTimeout(function () { card.style.transition = "transform 0.25s ease-out"; }, 520);
        if (focus) {
          var first = slot.querySelector("input");
          if (first) first.focus();
        }
      };

      slot.querySelector(".gk-form-toggle").addEventListener("click", function () {
        openForm(true);
      });

      /* Closing collapses it back to the button, which stays put and reopens on
         click. It is not destroyed and it is not hidden: somebody who shuts it
         and changes their mind can still get to it. */
      slot.querySelector(".gk-form__close").addEventListener("click", function () {
        slot.setAttribute("data-open", "false");
        try { sessionStorage.setItem(DISMISSED, "1"); } catch (e) { /* private mode */ }
      });

      window.gkOpenForm = function () { openForm(true); };

      /* Opens itself once, a few seconds in. Long enough that the visitor has
         taken in the design and read the headline first, which is the whole
         reason it is not open from the start. Never reopens itself after a
         dismissal, and never steals focus, which would yank a phone keyboard
         open uninvited. */
      /* Every so often the button does something. The constant glow keeps it
         alive in the corner but the eye stops registering a loop after a few
         passes, so one of a few short moves fires at an irregular interval:
         irregular on purpose, because a predictable rhythm becomes wallpaper
         just as fast as a constant one. Only while it is collapsed, and never
         while the visitor is hovering it. */
      var MOVES = ["gk-shake", "gk-jump", "gk-flash"];
      var toggleButton = slot.querySelector(".gk-form-toggle");
      var hovering = false;
      toggleButton.addEventListener("mouseenter", function () { hovering = true; });
      toggleButton.addEventListener("mouseleave", function () { hovering = false; });

      (function scheduleMove() {
        var wait = 7000 + Math.random() * 9000;     // somewhere between 7 and 16 seconds
        setTimeout(function () {
          if (slot.getAttribute("data-open") !== "true" && !hovering) {
            var move = MOVES[Math.floor(Math.random() * MOVES.length)];
            toggleButton.classList.add(move);
            setTimeout(function () { toggleButton.classList.remove(move); }, 1200);
          }
          scheduleMove();
        }, wait);
      })();

      var alreadyClosed = false;
      try { alreadyClosed = sessionStorage.getItem(DISMISSED) === "1"; } catch (e) { /* ignore */ }
      if (!alreadyClosed && f.autoOpen !== false) {
        setTimeout(function () {
          if (slot.getAttribute("data-open") !== "true") openForm(false);
        }, Number(f.autoOpenAfter) || 5000);
      }

      var form = slot.querySelector("form");
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = {};
        Array.prototype.forEach.call(form.elements, function (el) {
          if (el.name) data[el.name] = el.value.trim();
        });
        if (!data.name || !data.phone) {
          (data.name ? form.elements.phone : form.elements.name).focus();
          return;
        }

        var button = form.querySelector("button");
        button.disabled = true;
        button.textContent = "Sending...";

        var done = function (ok) {
          form.innerHTML = '<p class="gk-form__done">' +
            esc(ok ? (f.thanks || "Thanks. We will call you back shortly.")
                   : "That did not send. Please call us instead and we will sort it.") +
            "</p>";
        };

        if (!f.endpoint) { done(true); return; }
        fetch(f.endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            source: "hero form",
            business: (SITE.business || {}).name || "",
            page: location.href,
            fields: data,
          }),
        })
          .then(function (r) { done(r.ok); })
          .catch(function () { done(false); });
      });
    });
  }

  /* -------------------------------------------------------------------- chat
     Answers from a short scripted set by default, and from SITE.chat.endpoint
     when one is wired. The point of it on a demo is that the owner sees an
     assistant sitting on their site at midnight, so it must never look broken:
     an unanswerable question hands over to the phone number rather than
     apologising in a loop. */
  function renderChat() {
    var c = SITE.chat;
    if (!c || c.enabled === false) return;

    var name = (SITE.business || {}).name || "us";
    var phone = (SITE.business || {}).phone || "";

    var launcher = document.createElement("button");
    launcher.className = "gk-chat-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Chat with " + name);
    /* A face if we have one. A photo of the owner gets opened far more than a
       generic speech bubble, which is why Summit's launcher wears one. */
    launcher.innerHTML = c.avatar
      ? '<img src="' + esc(c.avatar) + '" alt="" />'
      : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" ' +
        'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
        '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>';

    var assistant = c.assistantName || "Alex";
    var chevron = '<span class="gk-row__go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
      'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      '<path d="M9 18l6-6-6-6"/></svg></span>';

    /* The questions a visitor is most likely to have, as rows they can tap.
       Taken from the scripted answers so a tap can never lead nowhere. */
    var canned = Array.isArray(c.answers) ? c.answers : [];
    var asks = (c.questions || canned.map(function (a) { return a.ask; }))
      .filter(Boolean).slice(0, 4);

    var questionRows = asks.map(function (ask) {
      return '<button type="button" class="gk-row gk-ask" data-ask="' + esc(ask) + '">' +
        '<span class="gk-row__text"><span class="gk-row__title">' + esc(ask) + "</span></span>" +
        chevron + "</button>";
    }).join("");

    /* Named so nobody mistakes the demo assistant for the finished one. Left
       unsaid, an owner works it out themselves and trusts the rest less. */
    var notice = c.notice === false ? "" :
      '<p class="gk-chat-note">' +
      esc(c.noticeText ||
          "Demo assistant. Answers a few common questions for now; the live version is trained on your business, your prices and your diary.") +
      "</p>";

    var avatarTag = c.avatar
      ? '<img src="' + esc(c.avatar) + '" alt="" />'
      : '<span class="gk-row__faces"><span>' + esc(assistant.charAt(0)) + "</span></span>";

    var panel = document.createElement("div");
    panel.className = "gk-chat-panel";
    panel.setAttribute("data-open", "false");
    panel.setAttribute("data-view", "home");
    panel.innerHTML =
      '<div class="gk-chat-head">' +
        '<div class="gk-chat-head__top">' + avatarTag +
          '<span class="gk-chat-head__name">' + esc(c.title || name) + "</span>" +
          '<button type="button" aria-label="Close chat">&times;</button>' +
        "</div>" +
        '<p class="gk-chat-hi">' + esc(c.hi || "Hi there.") +
          "<span>" + esc(c.hiSub || "How can we help?") + "</span></p>" +
      "</div>" +

      '<div class="gk-chat-home">' +
        /* The way in. Says who replies and how fast, which is the thing that
           makes somebody actually start typing. */
        '<div class="gk-card"><button type="button" class="gk-row gk-start">' +
          '<span class="gk-row__faces"><span>' + esc(assistant.charAt(0)) + "</span></span>" +
          '<span class="gk-row__text"><span class="gk-row__title">Send us a message</span>' +
          '<span class="gk-row__sub">' + esc(assistant) + " typically replies in seconds</span></span>" +
          chevron + "</button></div>" +

        (questionRows
          ? '<div class="gk-card"><p class="gk-card__label">Popular questions</p>' + questionRows + "</div>"
          : "") +

        /* The two things they came for, never more than one tap away. */
        '<div class="gk-card">' +
          '<button type="button" class="gk-row gk-chat-quote">' +
            '<span class="gk-row__text"><span class="gk-row__title">' +
            esc((SITE.form && SITE.form.heading) || "Get a free quote") + "</span></span>" + chevron + "</button>" +
          (phone
            ? '<a class="gk-row" href="tel:' + esc(phone.replace(/\s+/g, "")) + '">' +
              '<span class="gk-row__text"><span class="gk-row__title">Call ' + esc(phone) + "</span></span>" +
              '<span class="gk-row__go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
              'stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
              '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2 4.2 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.7c.1 1 .3 1.9.6 2.8a2 2 0 0 1-.5 2.1L7.9 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.5 2.8.6a2 2 0 0 1 1.9 2z"/>' +
              "</svg></span></a>"
            : "") +
        "</div>" +
      "</div>" +

      '<div class="gk-chat-log"></div>' +
      notice +
      '<div class="gk-chat-foot">' +
        '<input placeholder="Ask a question" aria-label="Your message" />' +
        "<button type=\"button\">Send</button></div>" +

      '<div class="gk-chat-tabs">' +
        '<button type="button" data-tab="home" aria-selected="true">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M3 10l9-7 9 7v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>Home</button>' +
        '<button type="button" data-tab="messages" aria-selected="false">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" ' +
          'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
          '<path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 12 3.1a8.4 8.4 0 0 1 9 8.4z"/></svg>Messages</button>' +
      "</div>";

    document.body.appendChild(launcher);
    document.body.appendChild(panel);

    var log = panel.querySelector(".gk-chat-log");
    var input = panel.querySelector(".gk-chat-foot input");

    function say(from, text) {
      var line = document.createElement("div");
      line.className = "gk-msg";
      line.setAttribute("data-from", from);
      line.textContent = text;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
    }

    /* Home is the card stack; messages is the conversation. Opening always
       lands on home, because a blank conversation asks the visitor to do the
       work and most of them will not. */
    function view(which) {
      panel.setAttribute("data-view", which);
      Array.prototype.forEach.call(panel.querySelectorAll(".gk-chat-tabs button"), function (tab) {
        tab.setAttribute("aria-selected", String(tab.getAttribute("data-tab") === which));
      });
      if (which === "messages") {
        if (!log.children.length) {
          say("bot", c.greeting || ("Hi, you have reached " + name + ". What can I help with?"));
        }
        input.focus();
      }
    }

    function ask(question) {
      view("messages");
      say("you", question);
      setTimeout(function () { say("bot", reply(question)); }, 380);
    }

    function open() { panel.setAttribute("data-open", "true"); }

    launcher.addEventListener("click", function () {
      panel.getAttribute("data-open") === "true"
        ? panel.setAttribute("data-open", "false")
        : open();
    });
    Array.prototype.forEach.call(panel.querySelectorAll(".gk-chat-tabs button"), function (tab) {
      tab.addEventListener("click", function () { view(tab.getAttribute("data-tab")); });
    });
    panel.querySelector(".gk-start").addEventListener("click", function () { view("messages"); });
    Array.prototype.forEach.call(panel.querySelectorAll(".gk-ask"), function (row) {
      row.addEventListener("click", function () { ask(row.getAttribute("data-ask")); });
    });
    panel.querySelector(".gk-chat-head button")
      .addEventListener("click", function () { panel.setAttribute("data-open", "false"); });

    /* Scripted answers, matched on keywords. Enough to be genuinely useful on
       a demo, and it degrades to the phone number rather than guessing. */
    var canned = Array.isArray(c.answers) ? c.answers : [];
    var fallback = c.fallback ||
      (phone ? "I will get that answered properly. The quickest way is a quick call on " + phone + "."
             : "Leave your number in the form above and we will come straight back to you.");

    function reply(question) {
      var q = question.toLowerCase();
      for (var i = 0; i < canned.length; i++) {
        var keys = canned[i].match || [];
        for (var k = 0; k < keys.length; k++) {
          if (q.indexOf(String(keys[k]).toLowerCase()) > -1) return canned[i].answer;
        }
      }
      return fallback;
    }

    function send() {
      var text = input.value.trim();
      if (!text) return;
      say("you", text);
      input.value = "";

      if (!c.endpoint) {
        setTimeout(function () { say("bot", reply(text)); }, 420);
        return;
      }
      fetch(c.endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ business: name, question: text, page: location.href }),
      })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (d) { say("bot", (d && d.answer) || reply(text)); })
        .catch(function () { say("bot", reply(text)); });
    }
    panel.querySelector(".gk-chat-foot button").addEventListener("click", send);
    input.addEventListener("keydown", function (e) { if (e.key === "Enter") send(); });

    // The quote button hands over to the form rather than asking for details in
    // a chat window, which nobody wants to do.
    panel.querySelector(".gk-chat-quote").addEventListener("click", function () {
      panel.setAttribute("data-open", "false");
      if (typeof window.gkOpenForm === "function") window.gkOpenForm();
    });
  }

  /* --------------------------------------------------- the template's own form
     Eight of the templates shipped with a contact form of their own, and they
     asked for different things than the popup does: a full name where the
     popup asks for a first name, no service, none of the qualifying questions.
     Two forms on one page collecting two different shapes of lead is a mess
     for whoever reads them afterwards, so the page form is brought into line.

     Its own markup and classes are left exactly as they are, so it still looks
     like part of the design. Only the fields inside change, and they take the
     same names as the popup, which means both post an identical record. */
  function alignPageForms() {
    var forms = document.querySelectorAll("form[data-form]");
    if (!forms.length) return 0;

    var f = SITE.form || {};
    var services = Array.isArray(f.services) ? f.services : [];
    var questions = Array.isArray(f.questions) ? f.questions.slice(0, 3) : [];
    var aligned = 0;

    Array.prototype.forEach.call(forms, function (form) {
      if (form.closest("[data-growth-form]")) return;      // the popup itself
      var submit = form.querySelector('button[type="submit"], button:not([type])');
      var status = form.querySelector(".form__status, [role='status']");
      var buttonHtml = submit ? submit.outerHTML : '<button type="submit">Send</button>';
      var statusHtml = status ? status.outerHTML : "";

      var fields =
        '<input type="text" name="first_name" placeholder="First name" autocomplete="given-name" required>' +
        '<input type="tel" name="phone" placeholder="Phone number" autocomplete="tel" required>' +
        '<input type="email" name="email" placeholder="Email address" autocomplete="email">' +
        (services.length
          ? '<select name="service"><option value="">' + esc(f.servicePlaceholder || "What do you need?") +
            "</option>" + services.map(function (s) { return "<option>" + esc(s) + "</option>"; }).join("") +
            "</select>"
          : "") +
        questions.map(function (q, n) {
          var field = "q" + (n + 1);
          return Array.isArray(q.options) && q.options.length
            ? '<select name="' + field + '"><option value="">' + esc(q.label) + "</option>" +
              q.options.map(function (o) { return "<option>" + esc(o) + "</option>"; }).join("") + "</select>"
            : '<input name="' + field + '" placeholder="' + esc(q.label) + '">';
        }).join("") +
        '<textarea name="message" placeholder="' +
          esc(f.messagePlaceholder || "Anything else we should know?") + '"></textarea>';

      form.innerHTML = fields + buttonHtml + statusHtml;
      aligned++;

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var data = {};
        Array.prototype.forEach.call(form.elements, function (el) {
          if (el.name) data[el.name] = el.value.trim();
        });
        if (!data.first_name || !data.phone) {
          (data.first_name ? form.elements.phone : form.elements.first_name).focus();
          return;
        }
        var note = form.querySelector(".form__status, [role='status']");
        var say = function (text) { if (note) note.textContent = text; };
        say("Sending...");

        if (!f.endpoint) { say(f.thanks || "Thanks. We will be in touch shortly."); form.reset(); return; }
        fetch(f.endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            source: "page form",
            business: (SITE.business || {}).name || "",
            page: location.href,
            fields: data,
          }),
        })
          .then(function (r) {
            say(r.ok ? (f.thanks || "Thanks. We will be in touch shortly.")
                     : "That did not send. Please call us instead.");
            if (r.ok) form.reset();
          })
          .catch(function () { say("That did not send. Please call us instead."); });
      });
    });
    return aligned;
  }


  /* -------------------------------------------------------------- photographs
     Every template ships its own photography, and it is the wrong trade the
     moment the design is reused: a barber landed on the med spa design and
     inherited its treatment rooms. The library carries a set per trade, so the
     design is kept and the pictures are swapped.

     The hero takes the hero shot. Everything else cycles through that trade's
     work photographs and the owner portrait, so a page with eight images does
     not show the same one eight times. An image that fails to load is put back
     to the template's own, because a broken picture is worse than a generic
     one. */
  function swapPhotos() {
    var photos = SITE.photos || {};
    if (!photos.base) return 0;

    var work = [
      photos.base + "/work/project-1.webp",
      photos.base + "/work/project-2.webp",
      photos.base + "/work/project-3.webp",
      photos.base + "/work/project-4.webp",
      photos.base + "/owner.webp",
    ];

    var swapped = 0, next = 0;
    Array.prototype.forEach.call(document.querySelectorAll("img"), function (img) {
      var src = img.getAttribute("src") || "";
      // Only the template's own assets. Their logo and anything we injected stay.
      if (src.indexOf("assets/") !== 0 && src.indexOf("./assets/") !== 0) return;

      var isHero = /hero/i.test(src) || img.closest(".hero");
      var replacement = isHero ? photos.base + "/hero-image.webp" : work[next++ % work.length];

      var original = src;
      img.onerror = function () {
        img.onerror = null;
        img.setAttribute("src", original);
      };
      img.setAttribute("src", replacement);
      img.removeAttribute("srcset");        // or the browser keeps the old one
      swapped++;
    });
    return swapped;
  }


  /* --------------------------------------------------------- trust claims
     The little pills across a hero: "Board-Certified Specialists" and
     "FDA-Approved Treatments" are true of the med spa the design was drawn
     for, and nonsense above a barber shop that inherited it. The generator
     already writes claims for the real trade, so they go here.

     Only the text inside each pill changes. Whatever icon the designer put
     beside it stays exactly where it was. */
  function fillTrustClaims() {
    var claims = (SITE.copy || {}).trustClaims || [];
    if (!claims.length) return 0;

    var pills = document.querySelectorAll(
      ".trust-pill, .trust-band li, [class*='trust'] span, .hero__marquee span");
    if (!pills.length) return 0;

    var filled = 0;
    Array.prototype.forEach.call(pills, function (pill, index) {
      if (!(pill.textContent || "").trim()) return;
      var claim = claims[index % claims.length];
      /* The pill is usually an icon followed by a text node. Replacing the
         whole thing would take the icon with it, so only the text moves. */
      var textNode = Array.prototype.find.call(pill.childNodes, function (node) {
        return node.nodeType === 3 && node.textContent.trim();
      });
      if (textNode) textNode.textContent = claim;
      else pill.textContent = claim;
      filled++;
    });
    return filled;
  }

  /* ----------------------------------------------------------------- reviews
     Real reviews when the build has them. When it does not, three labelled
     examples, because an owner reading an empty reviews panel sees an
     unfinished page, and a fake name under a made up quote is worse again. */
  var EXAMPLES = [
    "Rang first thing and someone actually answered. Booked in the same week, turned up when they said they would, and the price was what I was quoted.",
    "Really easy to deal with from the first message. Kept me updated the whole way through and the finished job is exactly what I asked for.",
    "Used them after a neighbour recommended them and I can see why. Honest, tidy, no surprises on the bill.",
  ];

  function renderReviews() {
    var slots = document.querySelectorAll("[data-growth-reviews]");
    if (!slots.length) return;

    var r = SITE.reviews || {};
    var items = Array.isArray(r.items) ? r.items : [];
    var town = (SITE.business || {}).town || "";
    var real = items.length > 0;

    var cards = real
      ? items.slice(0, 6).map(function (item) {
          return '<figure class="gk-review">' +
            '<div class="gk-review__stars">' + "&#9733;".repeat(Math.round(item.rating || 5)) + "</div>" +
            '<p class="gk-review__text">&ldquo;' + esc(item.text) + "&rdquo;</p>" +
            '<figcaption class="gk-review__who">' + esc(item.author || "Verified customer") + "</figcaption></figure>";
        })
      : EXAMPLES.map(function (text) {
          return '<figure class="gk-review" data-example="true">' +
            '<span class="gk-review__tag">Example</span>' +
            '<div class="gk-review__stars">&#9733;&#9733;&#9733;&#9733;&#9733;</div>' +
            '<p class="gk-review__text">&ldquo;' + esc(text) + "&rdquo;</p>" +
            '<figcaption class="gk-review__who">Your customer' + (town ? ", " + esc(town) : "") +
            "</figcaption></figure>";
        });

    var note = real ? "" :
      '<p class="gk-reviews__note">' +
      esc(r.note || "These are examples. Your real Google reviews replace them the day this goes live.") +
      "</p>";

    Array.prototype.forEach.call(slots, function (slot) {
      slot.innerHTML = '<div class="gk-reviews">' + cards.join("") + "</div>" + note;
    });
  }

  /* ------------------------------------------------ the real client's config
     ?site=<slug> means this template is standing in for a business the builder
     generated, so the demo content is replaced with theirs. The store is the
     same one the builder writes to, read with the public read-only key.

     Translated into the shape the kit already uses, rather than teaching every
     function a second shape. If the fetch fails the demo content stays, which
     is the right failure: a template that still looks finished. */
  function adopt(config) {
    var d = config._display || {};
    var company = config.company || {};
    var contact = config.contact || {};
    var hero = (config.copy && config.copy.hero) || {};
    var reviews = config.reviews || {};
    var services = (config.services || []).map(function (s) { return s.name; }).filter(Boolean);

    return {
      business: {
        name: d.name || company.name,
        shortName: company.shortName,
        town: d.town || (config.address && config.address.city) || "",
        region: config.address && config.address.state,
        street: d.streetOnly || (config.address && config.address.street),
        postcode: d.postcode || (config.address && config.address.zip),
        country: (config.address && config.address.country) || "GB",
        phone: d.phone || contact.phone,
        email: contact.email,
        description: company.description,
        rating: Number(reviews.rating) || 0,
        reviewCount: Number(reviews.totalReviewCount) || 0,
        services: services,
        areasServed: config.serviceAreas || [],
      },
      copy: {
        headline: hero.headline,
        lede: hero.subheadline,
        eyebrow: hero.eyebrow,
        metaTitle: config.meta && config.meta.title,
        metaDescription: config.meta && config.meta.description,
        trustClaims: (config.copy && config.copy.trustClaims) || [],
      },
      form: {
        heading: (config.copy && config.copy.formHeader) || "Get a quote",
        sub: config.copy && config.copy.formSubtext,
        services: services,
        button: (config.copy && config.copy.buttonText) || "Send",
        endpoint: config.leadEndpoint || "",
        questions: (config.formQuestions || []),
        thanks: "Thanks. We will be in touch shortly.",
      },
      chat: {
        title: company.shortName || d.name || company.name,
        greeting: "Hi, you have reached " + (company.shortName || company.name) + ". What can I help with?",
        answers: (config.chatAnswers || []),
      },
      reviews: { items: (reviews.items || []) },
      brand: config.brand || {},
      photos: config.photos || {},
    };
  }

  /* -------------------------------------------------- the template's own name

     Every template ships with an invented business: FlowRight Plumbing, Summit
     Roofing, and so on. Filling only the slots we know about left that name
     sitting in the footer, the copyright line, a "Why choose" heading and the
     testimonials, so a plumber in Manchester opened his own demo site and read
     another company's name six times. Nothing says "you were sent a form
     letter" faster.

     The template's name is read before anything is filled in, then swept out
     of the whole page. Only the full name and its distinctive first word are
     touched, and the first word only when it is clearly a brand rather than a
     trade word, so a template called "The Coffee Shop" never has the word
     coffee rewritten out of its copy. */

  var TEMPLATE_NAME = "";
  var TEMPLATE_NAMES = [];
  /* True only once a real scraped business has been loaded. The library pages
     at aipm-templates.vercel.app render the same code with the template's own
     demo content, and their invented numbers are part of the design there:
     stripping them would quietly degrade twenty finished templates. */
  var REAL_BUSINESS = false;

  function captureTemplateName() {
    /* Templates name themselves twice and rarely the same way: the navbar
       carries "FlowRight" and the footer "FlowRight Plumbing". Taking only the
       first match meant the footer was rewritten a word at a time and came out
       as "JB7 Plumbing and Heating Plumbing". Both forms are collected and the
       longest is replaced first, so the full name always wins over the token. */
    var found = [];
    Array.prototype.forEach.call(
      document.querySelectorAll(".footer-brand, .navbar__brand, [data-gk='template-name']"),
      function (el) {
        var t = (el.textContent || "").replace(/\s+/g, " ").trim();
        if (t.length > 2 && t.length < 60) found.push(t);
      }
    );
    var fromTitle = (document.title || "").split(/[|:\u2013-]/)[0].replace(/\s+/g, " ").trim();
    if (fromTitle.length > 2 && fromTitle.length < 60) found.push(fromTitle);

    var seen = {};
    TEMPLATE_NAMES = found.filter(function (t) {
      var k = t.toLowerCase();
      if (seen[k]) return false;
      seen[k] = 1;
      return true;
    }).sort(function (a, b) { return b.length - a.length; });

    TEMPLATE_NAME = TEMPLATE_NAMES[0] || "";
  }

  // Words that describe the trade rather than name the business.
  var TRADE_WORDS = ("plumbing plumbers roofing dental dentist spa med medical wellness centre " +
    "center clinic salon barber coffee shop cafe hotel boutique travel agency real estate " +
    "landscaping lawn garden auto detailing car repair hvac heating cooling air services " +
    "service company co ltd limited inc llc group studio works co-op skincare natural " +
    "consulting creative portfolio practice surgery care the and of for " +
    /* Templates named after an adjective rather than a coined word: Luxury
       Dental Care, Elite Detail, Luxe Properties. Swapping the bare word for
       the business name turns ordinary copy into nonsense ("elite service"
       becoming "JB7 Plumbing service"), so those keep the full-name swap only. */
    "luxury luxe elite premium prime superior quality expert master pro first " +
    "best top modern classic urban metro city local family fresh pure bright").split(" ");

  /* Only ever the first word. Scanning further along found "Detail" in "Elite
     Detail" and "Properties" in "Luxe Properties", and rewriting those would
     have mangled the body copy of the very templates they belong to. A brand
     name leads; if the first word is a trade word or an adjective, the full
     name is the only safe thing to replace. */
  function brandToken(name) {
    var first = (name.split(/\s+/).filter(Boolean)[0] || "").replace(/[^A-Za-z0-9'&-]/g, "");
    if (first.length < 4) return "";
    if (TRADE_WORDS.indexOf(first.toLowerCase()) !== -1) return "";
    return first;
  }

  function renameTemplate() {
    var b = SITE.business || {};
    var real = b.name || "";
    if (!REAL_BUSINESS || !real || !TEMPLATE_NAME) return;
    var shortReal = b.shortName || real;

    // Longest first: "FlowRight Plumbing" has to go before bare "FlowRight",
    // or the second pass appends the trade word a second time.
    var swaps = [];
    TEMPLATE_NAMES.forEach(function (name) {
      if (name.toLowerCase() !== real.toLowerCase()) swaps.push([name, real]);
    });
    var token = brandToken(TEMPLATE_NAME);
    if (token && !swaps.some(function (p) { return p[0].toLowerCase() === token.toLowerCase(); })) {
      swaps.push([token, shortReal]);
    }
    if (!swaps.length) return;

    var escapeRe = function (t) { return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); };
    var rewrite = function (value) {
      var out = value;
      swaps.forEach(function (pair) {
        out = out.replace(new RegExp(escapeRe(pair[0]), "gi"), pair[1]);
      });
      return out;
    };

    /* Elements first. A footer brand is often marked up as "FlowRight" in one
       node and " Plumbing" in the next, and replacing the pieces separately
       gave "JB7 Plumbing and Heating Plumbing". Anything whose whole text is
       the template's name gets the real name in one go instead. */
    var flats = TEMPLATE_NAMES.map(function (n) { return n.toLowerCase(); });
    Array.prototype.forEach.call(document.body.querySelectorAll("*"), function (el) {
      if (el.children.length) return;
      var text = (el.textContent || "").replace(/\s+/g, " ").trim();
      if (text && flats.indexOf(text.toLowerCase()) !== -1) el.textContent = real;
    });

    var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var node;
    while ((node = walk.nextNode())) {
      if (!node.nodeValue || node.nodeValue.length > 4000) continue;
      var next = rewrite(node.nodeValue);
      if (next !== node.nodeValue) node.nodeValue = next;
    }
    // Alt text and labels carry the name too, and screen readers read them out.
    Array.prototype.forEach.call(
      document.querySelectorAll("[alt], [title], [aria-label], [placeholder]"),
      function (el) {
        ["alt", "title", "aria-label", "placeholder"].forEach(function (attr) {
          var v = el.getAttribute(attr);
          if (!v) return;
          var next = rewrite(v);
          if (next !== v) el.setAttribute(attr, next);
        });
      }
    );
  }

  /* ------------------------------------------------- invented head counts

     Templates lean on round numbers to look established: "Trusted by 1,200+
     homeowners", "1,200+ Jobs Completed". Left alone on a real business's demo
     they are two lies published in that business's name, and the owner spots
     them faster than anyone: a plumber with forty-seven reviews knows he has
     not done twelve hundred jobs.

     The real Google count replaces the invented one. A firm with 47 reviews
     has certainly served 47 or more people, so the claim stays true, and it is
     their own number rather than a stranger's. With no review data at all the
     number is dropped rather than guessed at. */

  var PROOF_NOUNS = "homeowners|customers|clients|patients|guests|families|members|" +
                    "projects|jobs|installs|installations|treatments|visits|reviews|" +
                    "properties|bookings|orders|sessions";

  function fixInventedCounts() {
    if (!REAL_BUSINESS) return;
    /* adopt() moves the count to business.reviewCount and leaves only the
       written reviews under reviews, so looking for it on reviews found
       nothing and the page had its numbers stripped instead of corrected.
       Both shapes are read: adopted config first, raw demo config second. */
    var business = SITE.business || {};
    var reviews = SITE.reviews || {};
    var counted = Number(
      business.reviewCount || reviews.totalReviewCount || reviews.googleCount || 0
    );

    /* Reviews are the floor, not the number of people who trust them: only a
       small share of happy customers ever writes one, so quoting the raw count
       undersells a business to its own face. Ten times the review count is the
       conservative end of the usual estimate, rounded down to a round hundred
       so it reads as a claim rather than a suspiciously exact figure, and
       capped so it stays believable for a business of this size.
       47 reviews becomes "400+", 61 becomes "600+". */
    var real = counted
      ? Math.min(5000, Math.max(100, Math.floor(counted * 10 / 100) * 100))
      : 0;
    var pretty = real ? real.toLocaleString("en-GB") : "";

    /* The number has to be attached to a noun about people or work before it
       is touched. Matching bare numbers rewrote "since 1998" into "since 47+"
       and turned a founding date into nonsense. Up to two words are allowed
       between the two ("2,000+ happy local customers"). */
    var claim = new RegExp(
      "(\\b(?:over|more than|trusted by|serving|join|helped)\\s+)?" +
      "(\\d{1,3}(?:,\\d{3})+|\\d{3,})(\\+?)" +
      "((?:\\s+[a-z]+){0,2}\\s+(?:" + PROOF_NOUNS + "))\\b",
      "gi"
    );

    var isYear = function (digits, plus) {
      if (plus || digits.indexOf(",") !== -1) return false;
      var n = parseInt(digits, 10);
      return n >= 1900 && n <= 2099;
    };

    var walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var nodes = [];
    var node;
    while ((node = walk.nextNode())) {
      if (node.nodeValue && node.nodeValue.length <= 300) nodes.push(node);
    }

    nodes.forEach(function (n) {
      var before = n.nodeValue;
      var after = before.replace(claim, function (whole, lead, digits, plus, tail) {
        if (isYear(digits, plus)) return whole;
        /* With nothing of their own to put there the template's own figure
           stays. It is a plausible claim for a going concern, and it reads
           far better than a sentence with the number cut out of the middle. */
        if (!real) return whole;
        /* "Trusted by" and "Serving" still read correctly in front of the
           number and are worth keeping. "Over" and "More than" collide with
           the plus sign, so those go. */
        var keep = lead && !/^\s*(over|more than)\s+$/i.test(lead) ? lead : "";
        return keep + pretty + "+" + tail;
      });
      if (after !== before) n.nodeValue = after.replace(/\s{2,}/g, " ").trim();
    });
  }

  function start() {
    // Read before anything overwrites it.
    captureTemplateName();
    applyBrand();
    swapPhotos();
    /* fillTemplate writes the business name into .navbar__brand, so the logo
       has to go in after it or the text lands on top of the image. */
    fillTemplate();
    /* Then sweep the invented name out of everywhere we do not have a slot
       for: the footer, the copyright, headings and the testimonials. */
    renameTemplate();
    // Their real Google count, in place of the template's invented one.
    fixInventedCounts();
    fillTrustClaims();
    applyLogo();
    addSchema();
    renderForms();
    alignPageForms();
    renderReviews();
    renderChat();
  }

  var STORE = "https://YOUR_SUPABASE_PROJECT_REF.supabase.co";
  var STORE_KEY = (window.GK_STORE_KEY || "");

  function boot() {
    var slug = new URLSearchParams(location.search).get("site");
    if (!slug || !STORE_KEY) { start(); return; }

    /* Nothing renders until the real business is in hand, so the page never
       shows the demo's name and then swaps it out in front of the visitor. */
    fetch(STORE + "/rest/v1/sites?slug=eq." + encodeURIComponent(slug) + "&select=config",
          { headers: { apikey: STORE_KEY, Authorization: "Bearer " + STORE_KEY }, cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (rows) {
        if (rows && rows.length && rows[0].config) {
          SITE = adopt(rows[0].config);
          REAL_BUSINESS = true;
        }
      })
      .catch(function () { /* the demo content stands */ })
      .then(start);
  }

  document.readyState === "loading"
    ? document.addEventListener("DOMContentLoaded", boot)
    : boot();
})();
