/* ═══════════════════════════════════════════════════════════
   Wifitom Service – tracking (GA4 + Google Ads) + cookie banner
   ───────────────────────────────────────────────────────────
   COMPLETEAZĂ DOAR ID-URILE DE MAI JOS. Cât timp sunt goale,
   nu se încarcă nimic de la Google.
   ═══════════════════════════════════════════════════════════ */
var WF_CONFIG = {
  GA4_ID: "G-LWSE3W8DXC", // Google Analytics 4 – Wifitom
  ADS_ID: "",            // ex: "AW-123456789"  (Google Ads)
  ADS_LABEL_CALL: "",    // eticheta conversiei „Click telefon"  (ex: "AbC-dEfGhIj")
  ADS_LABEL_WHATSAPP: "" // eticheta conversiei „Click WhatsApp" (ex: "KlM-nOpQrSt")
};

/* ─── Consent Mode v2: implicit refuzat până la acord ─── */
window.dataLayer = window.dataLayer || [];
function gtag(){ dataLayer.push(arguments); }

function wfGetChoice(){
  try { return localStorage.getItem("cookieChoice"); } catch(e){ return null; }
}
function wfSetChoice(v){
  try { localStorage.setItem("cookieChoice", v); } catch(e){}
}

var wfGranted = wfGetChoice() === "accepted";
gtag("consent", "default", {
  ad_storage: wfGranted ? "granted" : "denied",
  ad_user_data: wfGranted ? "granted" : "denied",
  ad_personalization: wfGranted ? "granted" : "denied",
  analytics_storage: wfGranted ? "granted" : "denied",
  wait_for_update: 500
});

/* gtag se încarcă la prima interacțiune (scroll/atingere/click/tastă),
   ca să nu încetinească încărcarea paginii. */
(function(){
  var id = WF_CONFIG.GA4_ID || WF_CONFIG.ADS_ID;
  if (!id) return;
  gtag("js", new Date());
  if (WF_CONFIG.GA4_ID) gtag("config", WF_CONFIG.GA4_ID);
  if (WF_CONFIG.ADS_ID) gtag("config", WF_CONFIG.ADS_ID);
  var done = false, evs = ["scroll","pointerdown","touchstart","keydown","mousemove"];
  function load(){
    if (done) return; done = true;
    evs.forEach(function(e){ removeEventListener(e, load, {passive:true}); });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + id;
    document.head.appendChild(s);
  }
  evs.forEach(function(e){ addEventListener(e, load, {passive:true}); });
})();

/* ─── Evenimente: telefon, WhatsApp, recenzie Google ─── */
function wfTrack(eventName, adsLabel, extra){
  if (!(WF_CONFIG.GA4_ID || WF_CONFIG.ADS_ID)) return;
  gtag("event", eventName, extra || {});
  if (WF_CONFIG.ADS_ID && adsLabel) {
    gtag("event", "conversion", { send_to: WF_CONFIG.ADS_ID + "/" + adsLabel });
  }
}

document.addEventListener("click", function(e){
  var a = e.target.closest && e.target.closest("a");
  if (!a) return;
  var href = a.getAttribute("href") || "";
  var page = location.pathname;
  if (href.indexOf("tel:") === 0) {
    wfTrack("click_telefon", WF_CONFIG.ADS_LABEL_CALL, { numar: href.replace("tel:", ""), pagina: page });
  } else if (href.indexOf("wa.me") !== -1) {
    wfTrack("click_whatsapp", WF_CONFIG.ADS_LABEL_WHATSAPP, { pagina: page });
  } else if (href.indexOf("g.page/r/") !== -1) {
    wfTrack("click_recenzie_google", null, { pagina: page });
  }
}, true);

/* ─── Cookie banner ─── */
function wfHideBanner(){
  document.documentElement.classList.remove("cb");
  var b = document.getElementById("cookieBanner");
  if (b) b.classList.remove("show");
}
function acceptCookies(){
  wfSetChoice("accepted");
  gtag("consent", "update", {
    ad_storage: "granted", ad_user_data: "granted",
    ad_personalization: "granted", analytics_storage: "granted"
  });
  wfHideBanner();
}
function declineCookies(){
  wfSetChoice("declined");
  wfHideBanner();
}
/* bannerul apare direct la prima afișare (clasa „cb” pusă în <head>) */
