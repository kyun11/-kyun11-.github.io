(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".nav");
  const navLinks = [...document.querySelectorAll(".nav a")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const reveals = [...document.querySelectorAll(".reveal, .mix-panel")];
  const counters = [...document.querySelectorAll("[data-count]")];

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 12);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      toggle.setAttribute("aria-label", open ? "메뉴 열기" : "메뉴 닫기");
      nav.classList.toggle("is-open", !open);
    });

    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "메뉴 열기");
        nav.classList.remove("is-open");
      });
    });
  }

  document.querySelectorAll('a[href="#top"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
      history.replaceState(null, "", "#top");
    });
  });

  const setActiveNav = () => {
    const offset = 120;
    const y = window.scrollY + offset;
    const nearBottom =
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
    let current = sections[0]?.id;

    if (nearBottom) {
      current = sections[sections.length - 1]?.id;
    } else {
      for (const section of sections) {
        if (section.offsetTop <= y) current = section.id;
      }
    }

    navLinks.forEach((link) => {
      const active = link.getAttribute("href") === `#${current}`;
      link.classList.toggle("is-active", active);
    });
  };

  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animateCount = (el) => {
    const target = Number(el.dataset.count || 0);
    const duration = 1100;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      const value = Math.round(easeOut(progress) * target);
      el.textContent = value.toLocaleString("ko-KR");
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  const counted = new WeakSet();

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-inview");

          entry.target.querySelectorAll?.("[data-count]").forEach((el) => {
            if (counted.has(el)) return;
            counted.add(el);
            animateCount(el);
          });

          if (entry.target.matches("[data-count]") && !counted.has(entry.target)) {
            counted.add(entry.target);
            animateCount(entry.target);
          }

          io.unobserve(entry.target);
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
    );

    reveals.forEach((el) => io.observe(el));
    counters.forEach((el) => {
      const parent = el.closest(".stat, .reveal") || el;
      io.observe(parent);
    });
  } else {
    reveals.forEach((el) => el.classList.add("is-inview"));
    counters.forEach(animateCount);
  }
})();
