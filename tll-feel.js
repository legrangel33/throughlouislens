/* throughlouislens — shared "feel" layer
   - Smaller custom cursor (Dune-style dot follower)
   - Instant-return nav (hide on scroll-down, show on scroll-up)
   - Lenis-lite smooth scroll with inertia
   - Live clock
   Call window.TLL.init(rootEl) from each page's componentDidMount.
*/
(function(){
  const TLL = window.TLL = window.TLL || {};
  let _booted = false;
  let _scrollBooted = false;

  TLL.init = function(root){
    root = root || document;

    // ───── Site-wide card lift on hover (one-shot stylesheet inject) ─────
    if (!TLL._liftCss) {
      TLL._liftCss = true;
      const css = `
        [data-work-card],[data-cmp]{transition:transform .35s cubic-bezier(.2,0,0,1),border-color .35s cubic-bezier(.2,0,0,1),background .35s cubic-bezier(.2,0,0,1),box-shadow .4s cubic-bezier(.2,0,0,1) !important;will-change:transform;}
        [data-work-card]:hover,[data-cmp]:hover{transform:translateY(-6px);box-shadow:0 22px 44px -18px rgba(0,0,0,.65),0 0 0 1px rgba(27,79,216,.25);}
        /* Status pill (Read / Soon) — always visible, pinned top-right */
        [data-work-card] [data-work-view]{
          position:absolute !important;
          top:18px !important; right:18px !important;
          left:auto !important; bottom:auto !important;
          transform:none !important; opacity:1 !important;
          padding:7px 14px !important;
          font-size:11px !important; letter-spacing:.18em !important;
          background:rgba(245,240,232,.95) !important;
          backdrop-filter:blur(6px); -webkit-backdrop-filter:blur(6px);
          box-shadow:0 4px 14px -4px rgba(0,0,0,.5);
        }
        [data-work-card]:hover [data-work-view]{transform:none !important; opacity:1 !important; background:#F5F0E8 !important;}
        @media (prefers-reduced-motion: reduce){
          [data-work-card]:hover,[data-cmp]:hover{transform:none;box-shadow:none;}
        }
      `;
      const s = document.createElement('style');
      s.setAttribute('data-tll-feel','lift');
      s.textContent = css;
      document.head.appendChild(s);
    }

    // ───── Site-wide mobile rules (one-shot stylesheet inject) ─────
    if (!TLL._mobCss) {
      TLL._mobCss = true;
      const css = `
        @media (max-width: 1024px) {
          /* Tablet / split-view: 3-col card grids drop to 2-col, titles scale down */
          [data-stagger-root]{grid-template-columns:1fr 1fr !important; gap:16px !important;}
          a[data-work-card]{min-height:280px;}
          a[data-work-card] [style*="font-size:32px"]{font-size:24px !important; line-height:1.05 !important;}
          a[data-work-card] [style*="font-size:24px"]{font-size:20px !important;}
          /* Reserve right-side room so the Read/Soon pill never collides with the title */
          a[data-work-card] > div[style*="bottom:24px"]{padding-right:84px !important;}
        }
        @media (max-width: 1024px) {
          /* Nav: hide text links, show hamburger from tablet down */
          nav[data-tll-nav] [data-nav-links]{display:none !important;}
          nav[data-tll-nav] [data-tll-mob-wrap]{display:block !important;}
          nav[data-tll-nav] [data-tll-mob-toggle]{display:inline-flex !important;}
        }
        @media (max-width: 640px) {
          nav[data-tll-nav]{padding:10px 16px !important; gap:8px !important;}
          /* Popular Guides intro block: stack, left-align, full width */
          section#guides{padding:48px 14px 40px !important;}
          section#guides > [data-reveal]{grid-template-columns:1fr !important; gap:18px !important; margin-bottom:20px !important;}
          section#guides h2{text-align:left !important; font-size:clamp(40px,11vw,72px) !important;}
          section#guides > [data-reveal] > div{display:flex !important; flex-direction:column !important; align-items:flex-start !important;}
          section#guides > [data-reveal] > div > a{align-self:flex-start !important; width:auto !important;}
          section#guides > [data-reveal] p{margin:0 0 20px !important; font-size:14px !important; max-width:none !important; width:100% !important;}
          /* Hero bottom row breathing room before triptych */
          section#top{padding-bottom:20px !important;}
          /* Make both hero-bottom lines align uniformly when stacked */
          section#top div[data-r="hero-bottom"] > div{text-align:left !important; font-size:11px !important; letter-spacing:.18em !important; line-height:1.6 !important;}
          section#top div[data-r="hero-bottom"]{gap:6px !important; margin-top:20px !important; padding:0 !important;}
          /* Reduce CTA padding so it sits cleanly when stacked */
          section#top [data-r="hero-ctas"] a{padding:14px 22px !important; font-size:13px !important;}
          /* Card grids → single column, generous gap */
          [data-stagger-root]{grid-template-columns:1fr !important; gap:12px !important;}
          /* Cards drop rigid 4:3 so content breathes */
          a[data-work-card]{aspect-ratio:auto !important; min-height:260px !important; border-radius:12px !important;}
          a[data-work-card] [style*="font-size:32px"]{font-size:22px !important; line-height:1.05 !important;}
          a[data-work-card] [style*="font-size:24px"]{font-size:18px !important;}
          a[data-work-card] [style*="font-size:22px"]{font-size:17px !important;}
          a[data-work-card] [style*="font-size:14px"]{font-size:12px !important;}
          a[data-work-card] [style*="font-size:13px"]{font-size:11px !important;}
          /* About section: image stacks above the two text blocks on phone */
          div[style*="aspect-ratio:4/5"]{aspect-ratio:1/1 !important; max-height:520px !important;}
          /* Section vertical rhythm on phone — tightened ~20% */
          section{padding-top:52px !important; padding-bottom:38px !important;}
          /* Generic 1.4fr 1fr 1fr (TOC / hero pairs) → single col */
          div[style*="grid-template-columns:1.4fr 1fr 1fr"]{grid-template-columns:1fr !important; gap:12px !important;}
          /* AI guide: 1fr 1fr term grids → single col */
          section[id] div[style*="grid-template-columns:1fr 2fr"]{grid-template-columns:1fr !important; gap:14px !important;}
          section[id] div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr !important; gap:10px !important;}
          /* Page H1s (All Guides., Workflow Templates., etc) */
          h1{font-size:clamp(40px,8.8vw,88px) !important; letter-spacing:-.025em !important;}
          /* Chapter titles inside guides */
          [data-chapter-title]{font-size:clamp(30px,8.8vw,52px) !important; letter-spacing:-.022em !important;}
          h2{text-wrap:balance;}
          h3{font-size:24px !important; line-height:1.05 !important;}
          /* Hero brand wordmark on home */
          h1[data-hero-h1]{font-size:clamp(28px,7.2vw,52px) !important;}
          /* What you'll need card: full width on phone */
          a[href="https://claude.ai"] > div[style*="grid-template-columns:1fr 1fr"]{grid-template-columns:1fr !important; gap:16px !important; padding:20px !important;}
          a[href="https://claude.ai"]{max-width:100% !important;}
          a[href="https://claude.ai"] [style*="text-align:right"]{text-align:left !important;}
          a[href="https://claude.ai"] [style*="align-items:flex-end"]{align-items:flex-start !important;}
        }
      `;
      const s = document.createElement('style');
      s.setAttribute('data-tll-feel','mobile');
      s.textContent = css;
      document.head.appendChild(s);
    }

    // ───── Mobile hamburger toggle (build once per nav) ─────
    document.querySelectorAll('nav[data-tll-nav]').forEach(nav => {
      if (nav.querySelector('[data-tll-mob-wrap]')) return;
      let linksWrap = nav.querySelector('[data-nav-links]');
      if (!linksWrap) {
        // Fallback: any container of a[data-nav-link]
        const anyLink = nav.querySelector('a[data-nav-link]');
        if (anyLink) linksWrap = anyLink.parentElement;
      }
      if (!linksWrap) return;
      // Tag it so our mobile CSS hides it
      if (!linksWrap.hasAttribute('data-nav-links')) linksWrap.setAttribute('data-nav-links','');


      const wrap = document.createElement('div');
      wrap.setAttribute('data-tll-mob-wrap','');
      wrap.style.cssText = 'position:relative;display:none;pointer-events:auto;';

      const ICON_OPEN = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>';
      const ICON_CLOSE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"/><line x1="18" y1="6" x2="6" y2="18"/></svg>';

      const btn = document.createElement('button');
      btn.setAttribute('data-tll-mob-toggle','');
      btn.setAttribute('aria-label','Menu');
      btn.style.cssText = 'display:none;width:42px;height:42px;border-radius:50%;border:1px solid rgba(245,240,232,.35);background:rgba(10,10,10,.85);backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);color:#F5F0E8;align-items:center;justify-content:center;cursor:pointer;padding:0;transition:background .2s, border-color .2s;';
      btn.innerHTML = ICON_OPEN;

      const panel = document.createElement('div');
      panel.setAttribute('data-tll-mob-panel','');
      panel.style.cssText = 'position:absolute;top:calc(100% + 12px);right:0;display:none;flex-direction:column;gap:6px;padding:14px;background:#0A0A0A;border:1px solid #262626;border-radius:14px;min-width:220px;box-shadow:0 22px 50px -18px rgba(0,0,0,.7);z-index:60;';
      // Copy each link from the text nav, restyled as menu rows
      linksWrap.querySelectorAll('a').forEach(a => {
        const row = a.cloneNode(true);
        // Drop attrs that page-level CSS hides at small widths
        row.removeAttribute('data-nav-link');
        row.removeAttribute('data-cursor-target');
        row.style.cssText = 'display:block;padding:14px 16px;font-family:\'SF Mono\',ui-monospace,Menlo,monospace;font-size:13px;letter-spacing:.22em;text-transform:uppercase;color:#F5F0E8;text-decoration:none;border-radius:10px;transition:background .2s;';
        row.addEventListener('mouseenter', ()=>{ row.style.background='#141414'; });
        row.addEventListener('mouseleave', ()=>{ row.style.background='transparent'; });
        row.addEventListener('click', ()=>{ panel.style.display='none'; btn.innerHTML=ICON_OPEN; });
        panel.appendChild(row);
      });

      wrap.appendChild(btn);
      wrap.appendChild(panel);
      linksWrap.parentNode.insertBefore(wrap, linksWrap.nextSibling);

      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = panel.style.display === 'flex';
        panel.style.display = open ? 'none' : 'flex';
        btn.innerHTML = open ? ICON_OPEN : ICON_CLOSE;
      });
      document.addEventListener('click', (e) => {
        if (!wrap.contains(e.target) && panel.style.display === 'flex') {
          panel.style.display = 'none';
          btn.innerHTML = ICON_OPEN;
        }
      });
    });


    // ───── Live clock ─────
    const pad = n => String(n).padStart(2,'0');
    const tickClock = () => {
      const d = new Date();
      root.querySelectorAll('[data-clock]').forEach(el=>{
        el.textContent = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
      });
    };
    tickClock();
    if (TLL._clock) clearInterval(TLL._clock);
    TLL._clock = setInterval(tickClock, 1000);

    // ───── Small custom cursor (Dune-style) ─────
    const ring = root.querySelector('[data-cursor-ring]');
    const dot  = root.querySelector('[data-cursor-dot]');
    if (ring && dot && !TLL._cursorBooted) {
      TLL._cursorBooted = true;
      // Override the inline sizes from the markup with the smaller "feel" sizes
      ring.style.width = '22px'; ring.style.height = '22px';
      dot.style.width  = '6px';  dot.style.height  = '6px';
      let tx = innerWidth/2, ty = innerHeight/2, rx = tx, ry = ty;
      window.addEventListener('mousemove', e => {
        tx = e.clientX; ty = e.clientY;
        dot.style.transform = `translate3d(${tx}px,${ty}px,0) translate(-50%,-50%)`;
      }, { passive: true });
      (function raf(){
        rx += (tx-rx)*0.22; ry += (ty-ry)*0.22;
        ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;
        requestAnimationFrame(raf);
      })();
    }

    // Bind hover-grow on every interactive element. Re-runs are idempotent
    // because we stamp `_tllHover` on each handled element.
    const bindHovers = () => {
      if (!ring) return;
      const targets = root.querySelectorAll(
        'a, button, [data-cursor-target], [data-work-card], [data-cmp], [data-term], [data-toc-link], [data-svc], summary'
      );
      targets.forEach(el => {
        if (el._tllHover) return;
        el._tllHover = true;
        el.addEventListener('mouseenter', () => {
          ring.style.width = '42px';
          ring.style.height = '42px';
          ring.style.background = '#F5F0E8';
        });
        el.addEventListener('mouseleave', () => {
          ring.style.width = '22px';
          ring.style.height = '22px';
          ring.style.background = 'transparent';
        });
      });
    };
    bindHovers();
    // Rebind every 1.5s to catch any late-rendered elements (reveals etc.)
    if (TLL._bindLoop) clearInterval(TLL._bindLoop);
    TLL._bindLoop = setInterval(bindHovers, 1500);

    // ───── Instant-return nav ─────
    const nav = root.querySelector('[data-tll-nav]');
    if (nav && !nav._tllNavBooted) {
      nav._tllNavBooted = true;
      nav.style.transition = 'transform .28s cubic-bezier(.2,0,0,1)';
      let lastY = window.scrollY;
      let hidden = false;
      const onScroll = () => {
        const y = window.scrollY;
        if (y < 60) {
          if (hidden) { nav.style.transform = 'translateY(0)'; hidden = false; }
        } else if (y > lastY + 6 && !hidden) {
          nav.style.transform = 'translateY(-110%)';
          hidden = true;
        } else if (y < lastY - 2 && hidden) {
          nav.style.transform = 'translateY(0)';
          hidden = false;
        }
        lastY = y;
      };
      window.addEventListener('scroll', onScroll, { passive: true });
    }

    // ───── Smooth scroll (Lenis-lite) ─────
    // Only enable on fine-pointer devices (skip touch/mobile)
    if (!_scrollBooted && matchMedia('(pointer:fine)').matches && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
      _scrollBooted = true;
      let target = window.scrollY;
      let current = window.scrollY;
      let raf = null;
      let userDriven = false; // when true, native scroll (keyboard / anchor / scrollbar) is in charge

      const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
      const loop = () => {
        const next = current + (target - current) * 0.14;
        current = next;
        if (Math.abs(target - current) > 0.35) {
          window.scrollTo(0, current);
          raf = requestAnimationFrame(loop);
        } else {
          window.scrollTo(0, target);
          current = target;
          raf = null;
        }
      };

      const onWheel = (e) => {
        // Don't hijack ctrl-zoom or modifier scrolls
        if (e.ctrlKey || e.metaKey) return;
        e.preventDefault();
        target = Math.max(0, Math.min(target + e.deltaY, maxScroll()));
        if (!raf) raf = requestAnimationFrame(loop);
      };
      window.addEventListener('wheel', onWheel, { passive: false });

      // Resync target when user scrolls via keyboard / scrollbar / anchor link
      let resyncTimer;
      window.addEventListener('scroll', () => {
        if (raf) return; // we're driving — ignore
        clearTimeout(resyncTimer);
        resyncTimer = setTimeout(() => {
          target = window.scrollY;
          current = window.scrollY;
        }, 60);
      }, { passive: true });

      // Make anchor links smoothly retarget the lerp
      document.addEventListener('click', (e) => {
        const a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a) return;
        const id = a.getAttribute('href').slice(1);
        if (!id) return;
        const t = document.getElementById(id);
        if (!t) return;
        e.preventDefault();
        const rect = t.getBoundingClientRect();
        target = Math.max(0, Math.min(window.scrollY + rect.top - 24, maxScroll()));
        if (!raf) raf = requestAnimationFrame(loop);
      });
    }
  };
})();
