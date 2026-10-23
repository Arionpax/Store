(function () {
  var S = window.STORE, $ = function (s) { return document.querySelector(s); };
  var ARROW = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M5 11l6-6M6 5h5v5"/></svg>';
  var MARK = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round" aria-hidden="true"><path d="M6 3h12v18l-6-4-6 4z"/></svg>';
  var BAD = /robot check|captcha|access denied|just a moment|attention required|sign in|not found|forbidden|unavailable/i;
  var NOTE = "Open the seller's page for details, price and reviews.";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function slug(s) { return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""); }
  function host(u) { try { return new URL(u).hostname.replace(/^www\./, ""); } catch (e) { return ""; } }
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return "p" + (h >>> 0).toString(36); }

  var P = S.products.map(function (p) { p.id = p.name ? slug(p.name) : hash(p.url || p.query || ""); p.cat = p.cat || "picks"; return p; });
  var catLabel = { picks: "Picks" }; S.cats.forEach(function (c) { catLabel[c.id] = c.label; });
  var META = {}, saved = [];
  try { META = JSON.parse(localStorage.getItem("meta") || "{}"); } catch (e) {}
  try { saved = JSON.parse(localStorage.getItem("saved") || "[]"); } catch (e) {}
  var cat = "all", q = "", sort = "featured", onlySaved = false;
  function persist() { try { localStorage.setItem("saved", JSON.stringify(saved)); } catch (e) {} }
  function isSaved(p) { return saved.indexOf(p.id) > -1; }
  function toggle(p) { var i = saved.indexOf(p.id); if (i > -1) saved.splice(i, 1); else saved.push(p.id); persist(); render(); }

  /* what to display: your fields win, then auto-fetched data, then a neutral fallback */
  function show(p) {
    var m = META[p.url] || {}, h = host(p.url || "");
    return {
      name: p.name || m.title || (/amazon|amzn/.test(h) ? "Amazon product" : h ? h + " product" : "Product"),
      desc: p.desc || m.desc || NOTE,
      image: p.image || m.image || ""
    };
  }
  function link(p) {
    if (p.url) return p.url;
    return S.market + "/s?k=" + encodeURIComponent(p.query || p.name) + (S.tag ? "&tag=" + encodeURIComponent(S.tag) : "");
  }
  function track(p) { try { if (window.goatcounter && window.goatcounter.count) window.goatcounter.count({ path: "click/" + p.id, title: show(p).name, event: true }); } catch (e) {} }

  /* automatic metadata (Open Graph) for non-skipped domains, cached in the browser */
  function skipped(u) { var h = host(u); return (S.autoSkip || []).some(function (d) { return h.indexOf(d) > -1; }); }
  function fresh(m) { return m && Date.now() - m.t < (m.fail ? 864e5 : 12096e5); }
  var chain = Promise.resolve(), timer;
  function enrich() {
    if (!S.autoFetch) return;
    P.forEach(function (p) {
      if (!p.url || (p.name && p.image && p.desc) || skipped(p.url) || fresh(META[p.url])) return;
      chain = chain.then(function () {
        return fetch("https://api.microlink.io/?url=" + encodeURIComponent(p.url)).then(function (r) { return r.json(); }).then(function (j) {
          var d = (j && j.data) || {}, t = (d.title || "").trim();
          if (j.status !== "success" || !t || BAD.test(t)) throw 0;
          META[p.url] = { t: Date.now(), title: t, desc: (d.description || "").trim(), image: (d.image && d.image.url) || (d.logo && d.logo.url) || "" };
        }).catch(function () { META[p.url] = { t: Date.now(), fail: 1 }; }).then(function () {
          try { localStorage.setItem("meta", JSON.stringify(META)); } catch (e) {}
          clearTimeout(timer); timer = setTimeout(render, 150);
        });
      });
    });
  }

  function actions(p) {
    var a = el("div", "act"), go = el("a", "cta"), sv = el("button", "save"), nm = show(p).name;
    go.href = link(p); go.target = "_blank"; go.rel = "sponsored noopener noreferrer";
    go.setAttribute("aria-label", "Check price for " + nm + " (opens in a new tab)");
    go.appendChild(el("span", "", "Check price")); go.insertAdjacentHTML("beforeend", ARROW);
    go.addEventListener("click", function () { track(p); });
    sv.type = "button"; sv.innerHTML = MARK; sv.setAttribute("aria-pressed", isSaved(p));
    sv.setAttribute("aria-label", (isSaved(p) ? "Remove " : "Save ") + nm + (isSaved(p) ? " from saved" : ""));
    sv.addEventListener("click", function () { toggle(p); });
    a.appendChild(go); a.appendChild(sv); return a;
  }

  function card(p, i) {
    var v = show(p), c = el("article", "card rise"), ph = el("div", "ph");
    c.style.setProperty("--i", Math.min(i, 12));
    function fallback() { ph.className = "ph fallback"; ph.textContent = ""; ph.appendChild(el("span", "ini", v.name.slice(0, 2).toLowerCase())); if (p.featured) ph.appendChild(el("span", "pick", "pick")); }
    if (v.image) {
      var img = new Image(); img.src = v.image; img.alt = v.name; img.referrerPolicy = "no-referrer"; img.loading = "lazy"; img.decoding = "async"; img.onerror = fallback; ph.appendChild(img);
      if (p.featured) ph.appendChild(el("span", "pick", "pick"));
    } else fallback();
    var b = el("div", "body"), n = el("button", "name", v.name);
    n.type = "button"; n.addEventListener("click", function () { openQV(p); });
    b.appendChild(el("span", "cat", catLabel[p.cat] || p.cat)); b.appendChild(n); b.appendChild(el("p", "desc", v.desc));
    if (p.tags && p.tags.length) { var t = el("div", "tags"); p.tags.forEach(function (x) { t.appendChild(el("span", "tag", x)); }); b.appendChild(t); }
    b.appendChild(actions(p)); c.appendChild(ph); c.appendChild(b); return c;
  }

  var grid = $("#products"), chips = $("#chips");
  function match(p) {
    if (cat !== "all" && p.cat !== cat) return false;
    if (onlySaved && !isSaved(p)) return false;
    if (!q) return true;
    var v = show(p);
    return (v.name + " " + v.desc + " " + (p.tags || []).join(" ") + " " + (catLabel[p.cat] || "")).toLowerCase().indexOf(q) > -1;
  }
  function count(id) { return P.filter(function (p) { return id === "all" || p.cat === id; }).length; }
  function drawChips() {
    chips.textContent = "";
    ["all"].concat(S.cats.map(function (c) { return c.id; }), ["picks"]).forEach(function (id) {
      if (id !== "all" && !count(id)) return;
      var b = el("button", "chip"); b.type = "button"; b.setAttribute("aria-pressed", cat === id);
      b.appendChild(document.createTextNode(id === "all" ? "All" : catLabel[id])); b.appendChild(el("small", "", count(id)));
      b.addEventListener("click", function () { cat = id; render(); });
      chips.appendChild(b);
    });
  }
  function render() {
    if (cat !== "all" && !count(cat)) cat = "all";
    var list = P.filter(match);
    if (sort === "name") list.sort(function (a, b) { return show(a).name.localeCompare(show(b).name); });
    else list = list.filter(function (p) { return p.featured; }).concat(list.filter(function (p) { return !p.featured; }));
    grid.textContent = ""; list.forEach(function (p, i) { grid.appendChild(card(p, i)); });
    $("#empty").hidden = list.length > 0;
    $("#n").textContent = list.length + (list.length === 1 ? " product" : " products");
    $("#sc").textContent = saved.length;
    $("#savedBtn").setAttribute("aria-pressed", onlySaved);
    drawChips();
  }

  var qv = $("#qv"), qvb = $("#qvb");
  function openQV(p) {
    var v = show(p);
    qvb.textContent = "";
    var x = el("button", "tb close", "Close"); x.type = "button"; x.addEventListener("click", function () { qv.close(); });
    qvb.appendChild(x); qvb.appendChild(el("span", "cat", catLabel[p.cat] || p.cat)); qvb.appendChild(el("h3", "", v.name)); qvb.appendChild(el("p", "", v.desc));
    if (p.tags && p.tags.length) { var t = el("div", "tags"); p.tags.forEach(function (g) { t.appendChild(el("span", "tag", g)); }); qvb.appendChild(t); }
    qvb.appendChild(actions(p)); qvb.appendChild(el("p", "note", "Prices and availability change. Check the current price on the seller's page."));
    qv.showModal();
  }
  qv.addEventListener("click", function (e) { if (e.target === qv) qv.close(); });
  qv.addEventListener("close", render);

  grid.addEventListener("pointermove", function (e) {
    var c = e.target.closest(".card"); if (!c) return; var r = c.getBoundingClientRect();
    c.style.setProperty("--x", e.clientX - r.left + "px"); c.style.setProperty("--y", e.clientY - r.top + "px");
  });
  var qi = $("#q");
  qi.addEventListener("input", function () { q = qi.value.trim().toLowerCase(); render(); });
  $("#sort").addEventListener("change", function (e) { sort = e.target.value; render(); });
  $("#savedBtn").addEventListener("click", function () { onlySaved = !onlySaved; render(); });
  document.addEventListener("keydown", function (e) {
    var t = e.target.tagName;
    if (e.key === "/" && t !== "INPUT" && t !== "SELECT" && !qv.open) { e.preventDefault(); qi.focus(); }
    else if (e.key === "Escape" && document.activeElement === qi) { qi.value = ""; q = ""; render(); qi.blur(); }
  });

  var root = document.documentElement;
  $("#theme").addEventListener("click", function () {
    var next = root.dataset.theme === "light" ? "dark" : "light"; root.dataset.theme = next;
    $('meta[name="theme-color"]').content = next === "light" ? "#f6f1de" : "#0e1407";
    try { localStorage.setItem("theme", next); } catch (e) {}
  });

  $("#hub").href = S.hub; $("#yr").textContent = new Date().getFullYear();
  $("#disc").textContent = S.disclosure; $("#disc2").textContent = "Links are affiliate links.";
  render(); enrich();
})();
