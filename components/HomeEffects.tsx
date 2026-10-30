// Browser ရဲ့ window၊ document နဲ့ React effect ကိုသုံးဖို့ Client Component သတ်မှတ်ထားသည်။
"use client";

// Component ပေါ်လာပြီးနောက် event listener နဲ့ animation တွေ ပြင်ဆင်ဖို့ သုံးသည်။
import { useEffect } from "react";

// Home page ရဲ့ navigation highlight၊ header style နဲ့ scroll animation များကို ထိန်းချုပ်သည်။
export default function HomeEffects() {
  useEffect(() => {
    // Navigation ထဲမှ ဒီစာမျက်နှာအတွင်းရှိ section ကိုညွှန်သော # link များကို စုထားသည်။
    const links = [
      ...document.querySelectorAll<HTMLAnchorElement>('.navA a[href^="#"]'),
    ];
    // # ကိုဖယ်ပြီး သက်ဆိုင်ရာ id ရှိသော section ကိုရှာသည်။ မရှိသော section များကို ဖယ်ထုတ်သည်။
    // Type guard က ကျန်သောတန်ဖိုးများသည် HTMLElement ဖြစ်ကြောင်း TypeScript ကို အသိပေးသည်။
    const sections = links
      .map((link) => document.getElementById(link.hash.slice(1)))
      .filter((section): section is HTMLElement => section !== null);
    // Header ရဲ့ အောက်ခြေနေရာနဲ့ CSS class ကို အသုံးပြုနိုင်ဖို့ ရယူထားသည်။
    const header = document.querySelector("header");
    // လက်ရှိ scroll နေရာအလိုက် active link နဲ့ header ပုံစံကို ပြန်တွက်သည်။
    function update() {
      // Header အောက်ခြေထက် 1px အောက်ကို လက်ရှိ section စစ်ဆေးမည့် မျဉ်းအဖြစ် သုံးသည်။
      // Header မရှိလျှင် 0 ကို အခြေခံပြီး တွက်သည်။
      const line = (header?.getBoundingClientRect().bottom ?? 0) + 1;
      // စစ်ဆေးမည့်မျဉ်းကို ဖုံးလွှမ်းထားသော section ကို လက်ရှိ section အဖြစ် ရွေးသည်။
      let active = sections.find((section) => {
        const bounds = section.getBoundingClientRect();
        return bounds.top <= line && bounds.bottom > line;
      });
      // စာမျက်နှာအဆုံးရောက်လျှင် မျက်နှာပြင်ထဲ မြင်နေရသေးသော နောက်ဆုံး section ကို ရွေးသည်။
      // Math.ceil က scroll တန်ဖိုး ဒဿမအနည်းငယ်ကွာခြားမှုကြောင့် အဆုံးရောက်တာ မလွတ်စေရန် ဖြစ်သည်။
      if (
        window.scrollY > 0 &&
        Math.ceil(window.scrollY + window.innerHeight) >=
          document.documentElement.scrollHeight
      ) {
        // မူရင်း sections အစီအစဉ်မပြောင်းဘဲ မိတ္တူကို နောက်မှရှေ့သို့ ရှာသည်။
        // မြင်နေရသော section မတွေ့လျှင် ယခင် active ကို ဆက်သုံးသည်။
        active =
          [...sections].reverse().find((section) => {
            const bounds = section.getBoundingClientRect();
            return bounds.top < window.innerHeight && bounds.bottom > 0;
          }) ?? active;
      }
      // လက်ရှိ section နဲ့ ကိုက်သော link ကိုသာ active CSS class ပေးသည်။
      links.forEach((link) => {
        const selected = link.hash === `#${active?.id}`;
        link.classList.toggle("active", selected);
        // Screen reader သုံးသူများအတွက် လက်ရှိကြည့်နေသောနေရာကို ဖော်ပြသည်။
        if (selected) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
      // Product section ထိပ်က မျက်နှာပြင်အပေါ်မှ 70px သို့ရောက်လာလျှင် (သို့) ကျော်သွားလျှင်
      // header နောက်ခံနဲ့ link အရောင်ပြောင်းသော class ထည့်သည်။ Section မရှိလျှင် Infinity ကြောင့် မထည့်ပါ။
      header?.classList.toggle(
        "over-products",
        (document.getElementById("product")?.getBoundingClientRect().top ??
          Infinity) <= 70,
      );
    }
    // Scroll၊ မျက်နှာပြင်အရွယ်၊ URL hash ပြောင်းချိန်နဲ့ page load ပြီးချိန်တိုင်း ပြန်စစ်သည်။
    const events = ["scroll", "resize", "hashchange", "load"];
    // passive: true က listener အတွင်း browser ရဲ့ default event ကို မတားဆီးကြောင်း သတ်မှတ်သည်။
    events.forEach((event) =>
      window.addEventListener(event, update, { passive: true }),
    );
    // Event တစ်ခုခုကို မစောင့်ဘဲ စတင်ချိန်မှာလည်း navigation နဲ့ header ကို မှန်အောင်ပြင်သည်။
    update();
    // Observer များကို cleanup လုပ်ချိန် ပြန်သုံးနိုင်ဖို့ ဒီ scope မှာ သိမ်းထားသည်။
    let observer: IntersectionObserver | undefined;
    let mutationObserver: MutationObserver | undefined;
    // Animation အတွက် စာရင်းသွင်းပြီးသော element များကို မှတ်ထားပြီး ထပ်မသွင်းစေရန် သုံးသည်။
    const revealed = new Set<Element>();
    // အသုံးပြုသူက motion လျှော့ရန် မရွေးထားဘဲ browser က ပံ့ပိုးမှ scroll animation ကို ဖွင့်သည်။
    if (
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      "IntersectionObserver" in window
    ) {
      // Element များ မျက်နှာပြင်အတွင်း ဝင်လာခြင်းကို စောင့်ကြည့်သည်။
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              // CSS ရဲ့ ပေါ်လာသည့် animation ကို စတင်ပြီး ဒီ element ကို ထပ်မစောင့်ကြည့်တော့ပါ။
              // ထို့ကြောင့် element တစ်ခုအတွက် animation တစ်ကြိမ်သာ ပြသည်။
              entry.target.classList.add("is-visible");
              observer?.unobserve(entry.target);
            }
          });
        },
        // မြင်ရသောအချိုး 12% ကို ဖြတ်ချိန်မှာလည်း callback ခေါ်သည်။
        // စောင့်ကြည့်မည့် မျက်နှာပြင်ဧရိယာရဲ့ အောက်ခြေကို 40px အတွင်းဘက်သို့ လျှော့ထားသည်။
        { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
      );
      // Animation ပေးမည့် content နဲ့ product element များကိုရှာပြီး observer ထဲ ထည့်သည်။
      function observe() {
        document
          .querySelectorAll(
            ".textbox, .social-glass, .products-heading, .product-categories, .products-toolbar, .product-list, .about-copy, .about-media, .location-card, .product-card",
          )
          .forEach((element) => {
            // စာရင်းသွင်းပြီးသား element ကို ကျော်ပြီး အသစ်ကိုသာ မှတ်ထားသည်။
            if (revealed.has(element)) return;
            revealed.add(element);
            // ဒီ selector များနဲ့ ကိုက်လျှင် ညာဘက်မှ၊ ကျန် element များကို ဘယ်ဘက်မှ ဝင်လာစေသည်။
            const direction = element.matches(
              ".social-glass, .products-toolbar, .about-media, .location-card",
            )
              ? "right"
              : "left";
            // CSS မှာ သတ်မှတ်ထားသော ဖျောက်ထားသည့်အခြေအနေနဲ့ ဝင်လာမည့်ဦးတည်ရာကို သတ်မှတ်သည်။
            element.classList.add(
              "reveal-on-scroll",
              `reveal-from-${direction}`,
            );
            // Element မြင်ကွင်းထဲ ဝင်လာချိန်ကို စတင်စောင့်ကြည့်သည်။
            observer?.observe(element);
          });
      }
      // လက်ရှိ DOM ထဲရှိ element များကို အရင် စာရင်းသွင်းသည်။
      observe();
      // Product list ရဲ့ တိုက်ရိုက် child များ ထည့်/ဖယ်ချိန်တွင် အသစ်ပေါ်လာသော element များကို ထပ်ရှာသည်။
      mutationObserver = new MutationObserver(observe);
      const list = document.querySelector(".product-list");
      if (list) mutationObserver.observe(list, { childList: true });
    }
    // Component ဖြုတ်ချိန် (သို့) effect ပြန်စမည့်အချိန်မှာ listener နဲ့ observer များကို ရှင်းသည်။
    return () => {
      events.forEach((event) => window.removeEventListener(event, update));
      observer?.disconnect();
      mutationObserver?.disconnect();
      // ထည့်ထားသော animation class များကို ဖယ်ပြီး element များကို မူလအခြေအနေ ပြန်ထားသည်။
      revealed.forEach((element) =>
        element.classList.remove(
          "reveal-on-scroll",
          "reveal-from-left",
          "reveal-from-right",
          "is-visible",
        ),
      );
    };
  }, []); // Dependency မရှိသောကြောင့် ပုံမှန် re-render တိုင်း effect ကို ပြန်မလုပ်ပါ။
  // ဒီ component က effect များကိုသာ ထိန်းချုပ်ပြီး ကိုယ်ပိုင် UI မပြပါ။
  return null;
}
