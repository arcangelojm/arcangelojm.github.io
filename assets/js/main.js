(() => {
  const header = document.querySelector('[data-site-header]');
  if (header) {
    // A leitura de scrollY fica dentro de requestAnimationFrame: sem reflow forçado na carga (PageSpeed, 17/11/2026).
    let ticking = false;
    const updateHeader = () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        header.classList.toggle('is-scrolled', window.scrollY > 24);
        ticking = false;
      });
    };
    updateHeader();
    window.addEventListener('scroll', updateHeader, { passive: true });
  }

  // Páginas longas no celular (auditoria A1): blocos secundários e respostas do FAQ chegam abertos no HTML
  // (conteúdo visível sem JS) e fecham só no celular; o visitante abre o que quiser ler.
  if (window.matchMedia('(max-width: 767px)').matches) {
    document.querySelectorAll('details[data-collapse="mobile"]').forEach((item) => {
      item.open = false;
      item.classList.add('is-collapsible');
    });
    document.querySelectorAll('.m-more[data-collapse="mobile"]').forEach((box, index) => {
      const button = box.querySelector('.m-more__summary');
      const body = box.querySelector('.m-more__body');
      if (!button || !body) return;
      body.id = body.id || `m-more-${index + 1}`;
      button.setAttribute('aria-controls', body.id);
      button.setAttribute('aria-expanded', 'false');
      button.hidden = false;
      body.hidden = true;
      box.classList.add('is-collapsible');
      button.addEventListener('click', () => {
        const open = button.getAttribute('aria-expanded') !== 'true';
        button.setAttribute('aria-expanded', String(open));
        body.hidden = !open;
      });
    });
  }

  // Mega menu: o CSS abre por :hover e :focus-within (funciona sem JS); o JS acrescenta intenção,
  // clique, Esc e fechamento com atraso de 220 ms, para o painel não fechar no caminho do mouse.
  document.querySelectorAll('.has-mega').forEach((item) => {
    const trigger = item.querySelector('[data-mega-trigger]');
    const panel = item.querySelector('.mega-panel');
    let timer;
    // escaped: o usuário fechou com Esc; o painel só reabre por ação explícita ou depois que o foco sai do item.
    let escaped = false;
    // hoverOpenedAt: instante em que o mouseenter abriu o painel; um clique logo depois não deve fechá-lo.
    let hoverOpenedAt = 0;
    if (!trigger || !panel) return;
    const open = (on) => {
      trigger.setAttribute('aria-expanded', String(on));
      panel.setAttribute('data-open', String(on));
      item.classList.toggle('is-dismissed', !on);
    };
    item.addEventListener('mouseenter', () => {
      window.clearTimeout(timer);
      escaped = false;
      if (window.matchMedia('(hover: hover)').matches && panel.getAttribute('data-open') !== 'true') {
        hoverOpenedAt = Date.now();
        open(true);
      }
    });
    // Foco pelo teclado (Tab até "Serviços" ou dentro do painel): o painel abre e aria-expanded acompanha (WCAG 4.1.2).
    // Foco por clique ou toque no gatilho fica com o handler de clique, para o toque não abrir e fechar no mesmo gesto.
    item.addEventListener('focusin', (event) => {
      window.clearTimeout(timer);
      if (escaped) return;
      if (event.target === trigger && !trigger.matches(':focus-visible')) return;
      open(true);
    });
    item.addEventListener('mouseleave', () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => open(false), 220);
    });
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      window.clearTimeout(timer);
      escaped = false;
      const isOpen = panel.getAttribute('data-open') === 'true';
      // Painel aberto pelo mouse há menos de 300 ms: o clique confirma a abertura, não fecha.
      if (isOpen && Date.now() - hoverOpenedAt < 300) return;
      open(!isOpen);
    });
    item.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      escaped = true;
      open(false);
      trigger.focus();
    });
    item.addEventListener('focusout', () => {
      window.setTimeout(() => {
        if (!item.contains(document.activeElement)) {
          escaped = false;
          open(false);
        }
      }, 0);
    });
    document.addEventListener('click', (event) => {
      if (!item.contains(event.target)) open(false);
    });
  });

  // Menu do celular: sem JS abre por :target; com JS vira botão com aria-expanded e foco controlado.
  const mobileToggle = document.querySelector('[data-mobile-toggle]');
  const mobilePanel = document.getElementById('menu-movel');
  if (mobileToggle && mobilePanel) {
    const label = mobileToggle.querySelector('[data-mobile-label]');
    const setMobile = (on) => {
      mobileToggle.setAttribute('aria-expanded', String(on));
      mobilePanel.setAttribute('data-open', String(on));
      if (label) label.textContent = on ? 'Fechar menu' : 'Abrir menu';
      document.querySelector('main').inert = on;
      document.querySelector('.site-footer').inert = on;
      document.body.style.overflowY = on ? 'hidden' : '';
      if (on) mobilePanel.querySelector('a')?.focus();
    };
    if (window.location.hash === '#menu-movel') history.replaceState(null, '', window.location.pathname);
    mobileToggle.addEventListener('click', (event) => {
      event.preventDefault();
      setMobile(mobilePanel.getAttribute('data-open') !== 'true');
    });
    mobilePanel.querySelector('[data-mobile-close]')?.addEventListener('click', (event) => {
      event.preventDefault();
      setMobile(false);
      mobileToggle.focus();
    });
    // Foco preso no painel aberto: o Tab circula entre o botão de fechar do cabeçalho e os itens visíveis do painel.
    const focusables = () => [mobileToggle, ...mobilePanel.querySelectorAll('a[href], button:not([disabled])')]
      .filter((el) => el.getClientRects().length > 0);
    document.addEventListener('keydown', (event) => {
      if (mobilePanel.getAttribute('data-open') !== 'true') return;
      if (event.key === 'Escape') {
        setMobile(false);
        mobileToggle.focus();
        return;
      }
      if (event.key !== 'Tab') return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0];
      const last = list[list.length - 1];
      const index = list.indexOf(document.activeElement);
      if (event.shiftKey && (index <= 0)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (index === -1 || index === list.length - 1)) {
        event.preventDefault();
        first.focus();
      }
    });
    window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
      if (event.matches) setMobile(false);
    });
  }

  // Acordeão dos grupos de serviço no celular: sem JS os grupos ficam abertos; com JS começam fechados.
  document.querySelectorAll('[data-accordion]').forEach((button) => {
    const list = document.getElementById(button.getAttribute('aria-controls'));
    if (!list) return;
    const set = (on) => { button.setAttribute('aria-expanded', String(on)); list.hidden = !on; };
    set(false);
    button.addEventListener('click', () => set(button.getAttribute('aria-expanded') !== 'true'));
  });

  // Botão fixo de WhatsApp: some enquanto o hero (que já tem o CTA) está na tela, para não cobrir texto.
  const floatButton = document.querySelector('.whatsapp-float');
  const heroSection = document.querySelector('main .hero');
  if (floatButton && heroSection && 'IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      floatButton.classList.toggle('is-hidden', entry.isIntersecting);
    }, { threshold: 0.05 }).observe(heroSection);
  }

  // ---------- armazenamento seguro (navegação privada ou bloqueio não pode quebrar a página) ----------
  const store = (kind) => { try { return window[kind]; } catch { return null; } };
  const readJson = (kind, key) => { try { return JSON.parse(store(kind)?.getItem(key) || 'null'); } catch { return null; } };
  const writeJson = (kind, key, value) => { try { store(kind)?.setItem(key, JSON.stringify(value)); } catch { /* sem armazenamento: segue sem salvar */ } };
  window.dataLayer = window.dataLayer || [];
  const track = (payload) => window.dataLayer.push(payload);

  // ---------- UTMs: guardados na sessão, para o envio valer mesmo depois de navegar entre páginas ----------
  const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content'];
  const readUtms = () => {
    const params = new URLSearchParams(window.location.search);
    const saved = readJson('sessionStorage', 'utm_v1') || {};
    let found = false;
    UTM_KEYS.forEach((key) => {
      const value = (params.get(`utm_${key}`) || '').trim().slice(0, 200);
      if (value) { saved[key] = value; found = true; }
    });
    if (found) writeJson('sessionStorage', 'utm_v1', saved);
    return saved;
  };

  // ---------- formulário de lead (POST /api/lead; sem JS o form faz o mesmo POST e o servidor redireciona) ----------
  const DDDS = new Set('11 12 13 14 15 16 17 18 19 21 22 24 27 28 31 32 33 34 35 37 38 41 42 43 44 45 46 47 48 49 51 53 54 55 61 62 63 64 65 66 67 68 69 71 73 74 75 77 79 81 82 83 84 85 86 87 88 89 91 92 93 94 95 96 97 98 99'.split(' '));
  const phoneDigits = (value) => {
    let digits = value.replace(/\D/g, '');
    if (digits.length > 11 && digits.startsWith('55')) digits = digits.slice(2);
    return digits.slice(0, 11);
  };
  const phoneValid = (digits) => (digits.length === 10 || digits.length === 11) && DDDS.has(digits.slice(0, 2)) && (digits.length === 11 ? digits[2] === '9' : /[2-9]/.test(digits[2]));
  const phoneFormat = (digits, closing) => {
    if (!digits) return '';
    if (digits.length <= 2) return closing && digits.length === 2 ? `(${digits}) ` : `(${digits}`;
    const rest = digits.slice(2);
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${rest.slice(0, 4)}${rest.length > 4 ? `-${rest.slice(4)}` : ''}`;
    return `(${digits.slice(0, 2)}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
  };
  const checks = {
    nome: (el) => (!el.value.trim() ? 'Informe o seu nome.' : !/\p{L}.*\p{L}/u.test(el.value) ? 'Informe o seu nome, com pelo menos duas letras.' : ''),
    whatsapp: (el) => (!el.value.trim() ? 'Informe o seu WhatsApp com DDD.' : !phoneValid(phoneDigits(el.value)) ? 'Confira o número: use DDD e 9 dígitos. Exemplo: (65) 99999-9999.' : ''),
    email: (el) => (el.value.trim() && el.validity.typeMismatch ? 'Confira o e-mail: ele parece incompleto. Exemplo: nome@email.com.' : ''),
    cidade: (el) => (el.value.trim() && (!/^[\p{L}\p{M} '’\-/,]+$/u.test(el.value.trim()) || /https?|www/i.test(el.value)) ? 'Informe só a cidade e a UF, sem endereço de site. Exemplo: Cuiabá/MT.' : ''),
    assunto: (el) => (!el.value ? 'Escolha o assunto da sua mensagem.' : ''),
    consentimento: (el) => (!el.checked ? 'Marque o consentimento para o escritório usar os seus dados no retorno.' : '')
  };
  const sleep = (ms) => new Promise((resolve) => window.setTimeout(resolve, ms));

  document.querySelectorAll('[data-lead-form]').forEach((form) => {
    // Com JS, as mensagens aparecem junto ao campo; sem JS, vale a validação nativa do navegador.
    form.noValidate = true;
    const button = form.querySelector('button[type="submit"]');
    const label = button.querySelector('.button__label');
    const idleLabel = label.textContent;
    const alertBox = form.querySelector('.m-form__alert');
    const alertText = alertBox.querySelector('[data-form-message]');
    const started = Date.now();
    form.elements.namedItem('ts').value = String(started);
    form.elements.namedItem('origem_url').value = `${window.location.origin}${window.location.pathname}`;
    const utms = readUtms();
    UTM_KEYS.forEach((key) => { const el = form.elements.namedItem(`utm_${key}`); if (el && utms[key]) el.value = utms[key]; });

    const errorBox = (el) => document.getElementById(`${el.id}-erro`);
    const setError = (el, message) => {
      const box = errorBox(el);
      if (!box) return;
      box.textContent = message;
      box.hidden = !message;
      if (message) el.setAttribute('aria-invalid', 'true'); else el.removeAttribute('aria-invalid');
    };
    const validate = (el) => { const message = (checks[el.name] || (() => ''))(el); setError(el, message); return !message; };
    const fields = Object.keys(checks).map((name) => form.elements.namedItem(name)).filter(Boolean);

    const phone = form.elements.namedItem('whatsapp');
    phone.addEventListener('input', (event) => {
      const deleting = (event.inputType || '').startsWith('delete');
      phone.value = phoneFormat(phoneDigits(phone.value), !deleting);
    });
    fields.forEach((el) => {
      el.addEventListener('blur', () => { if (el.value || el.getAttribute('aria-invalid')) validate(el); });
      el.addEventListener(el.type === 'checkbox' || el.tagName === 'SELECT' ? 'change' : 'input', () => { if (el.getAttribute('aria-invalid')) validate(el); });
    });

    const setBusy = (busy) => {
      form.dataset.busy = busy ? 'true' : '';
      form.setAttribute('aria-busy', String(busy));
      button.disabled = busy;
      label.textContent = busy ? button.dataset.loadingLabel : idleLabel;
      button.classList.toggle('is-loading', busy);
    };
    const showAlert = (message) => {
      if (message) alertText.textContent = message;
      alertBox.hidden = false;
      alertBox.scrollIntoView({ block: 'nearest' });
    };

    // Voltar do /obrigado/ pelo histórico (cache de página): o botão não pode ficar preso em "enviando".
    window.addEventListener('pageshow', (event) => { if (event.persisted) setBusy(false); });

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (form.dataset.busy) return;
      alertBox.hidden = true;
      const invalid = fields.filter((el) => !validate(el));
      if (invalid.length) { invalid[0].focus(); return; }
      setBusy(true);
      // O servidor recusa envios com menos de 3 s de preenchimento; um autopreenchimento rápido espera o restante.
      const remaining = 3200 - (Date.now() - started);
      if (remaining > 0) await sleep(remaining);
      form.elements.namedItem('tf').value = String(Date.now());
      try {
        const response = await fetch('/api/lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
          body: new URLSearchParams(new FormData(form)),
          signal: AbortSignal.timeout(15000)
        });
        const data = await response.json().catch(() => null);
        if (response.ok && data && data.ok) {
          writeJson('sessionStorage', 'lead_v1', {
            nome: form.elements.namedItem('nome').value.trim().split(/\s+/)[0].slice(0, 40),
            assunto: form.elements.namedItem('assunto').value.slice(0, 120),
            servico: form.elements.namedItem('pagina').value.slice(0, 120),
            form_id: form.dataset.formId,
            pending: true
          });
          window.location.assign(data.redirect || '/obrigado/');
          return;
        }
        if (response.status === 422 && data && data.fields) {
          const bad = Object.entries(data.fields).map(([name, message]) => {
            const el = form.elements.namedItem(name);
            if (el && el.id && errorBox(el)) { setError(el, message); return el; }
            return null;
          }).filter(Boolean);
          if (bad.length) { bad[0].focus(); setBusy(false); return; }
        }
        showAlert(response.status === 429 || response.status === 422 ? (data && data.message) : '');
      } catch {
        showAlert('');
      }
      setBusy(false);
    });
  });

  // ---------- /obrigado/: nome e assunto vêm da sessão (nunca da URL); aberta direto, a versão é genérica e sem evento ----------
  const lead = readJson('sessionStorage', 'lead_v1');
  const onThanks = Boolean(document.querySelector('[data-lead]'));
  document.querySelectorAll('[data-lead]').forEach((slot) => {
    const value = lead && typeof lead[slot.dataset.lead] === 'string' ? lead[slot.dataset.lead].trim().slice(0, 120) : '';
    if (value) slot.textContent = `${slot.dataset.prefix || ''}${slot.dataset.lead === 'assunto' ? `“${value}”` : value}`;
  });
  if (onThanks && lead && lead.assunto) {
    document.querySelectorAll('main .hero a[href^="https://wa.me/"]').forEach((link) => {
      const number = (link.getAttribute('href').match(/^https:\/\/wa\.me\/(\d{10,15})/) || [])[1];
      if (number) link.href = `https://wa.me/${number}?text=${encodeURIComponent(`Olá! Enviei o formulário do site da Janaina Souto Advocacia Previdenciária sobre: ${lead.assunto}.`)}`;
    });
  }
  // Evento de conversão: uma vez por envio real, sem dado pessoal.
  if (onThanks && lead && lead.pending) {
    track({ event: 'generate_lead', service_name: lead.servico || lead.assunto || '', form_id: lead.form_id || '' });
    writeJson('sessionStorage', 'lead_v1', { ...lead, pending: false });
  }

  // ---------- evento whatsapp_click em todo link wa.me (sem dado pessoal: sem o texto da mensagem) ----------
  document.addEventListener('click', (event) => {
    const link = event.target instanceof Element ? event.target.closest('a[href*="wa.me/"]') : null;
    if (!link) return;
    track({ event: 'whatsapp_click', link_url: link.href.split('?')[0], page_path: window.location.pathname });
  });

  // ---------- aviso de cookies (LGPD): escolha em localStorage, Consent Mode v2, GA4 e Clarity só após o aceite ----------
  const CONSENT_KEY = 'consent_v1';
  const tags = window.__tags || {};
  const gtagFn = (...args) => { if (typeof window.gtag === 'function') window.gtag(...args); };
  const loaded = { ga4: false, clarity: false };
  const applyConsent = (choice) => {
    const grant = (on) => (on ? 'granted' : 'denied');
    gtagFn('consent', 'update', { analytics_storage: grant(choice.analytics), ad_storage: grant(choice.marketing), ad_user_data: grant(choice.marketing), ad_personalization: grant(choice.marketing) });
    if (choice.analytics) {
      if (tags.ga4 && !loaded.ga4) {
        loaded.ga4 = true;
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(tags.ga4)}`;
        document.head.appendChild(script);
        gtagFn('js', new Date());
        gtagFn('config', tags.ga4);
      }
      if (tags.clarity && !loaded.clarity) {
        loaded.clarity = true;
        window.clarity = window.clarity || function clarity() { (window.clarity.q = window.clarity.q || []).push(arguments); };
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://www.clarity.ms/tag/${encodeURIComponent(tags.clarity)}`;
        document.head.appendChild(script);
      }
    }
    if (loaded.clarity && typeof window.clarity === 'function') window.clarity('consent', Boolean(choice.analytics));
    // Marketing: o pixel de anúncios entra aqui quando houver um ID (Fase 11); hoje nenhuma tag de marketing existe.
  };

  const banner = document.querySelector('[data-cookie-banner]');
  if (banner) {
    const panel = banner.querySelector('[data-cookie-panel]');
    const customize = banner.querySelector('[data-cookie-customize]');
    const boxAnalytics = banner.querySelector('[name="cookie-analytics"]');
    const boxMarketing = banner.querySelector('[name="cookie-marketing"]');
    const root = document.documentElement;
    let opener = null;
    const syncHeight = () => root.style.setProperty('--cookie-h', `${banner.offsetHeight}px`);
    // A altura vem do próprio ResizeObserver (sem ler offsetHeight logo depois de mudar a classe do documento,
    // o que forçava o recálculo do layout da página inteira no carregamento: PageSpeed de 23/11/2026).
    const resizer = 'ResizeObserver' in window ? new ResizeObserver((entries) => {
      const box = entries[0] && entries[0].borderBoxSize && entries[0].borderBoxSize[0];
      if (box) root.style.setProperty('--cookie-h', `${Math.round(box.blockSize)}px`); else syncHeight();
    }) : null;
    const setPanel = (open) => {
      panel.hidden = !open;
      customize.setAttribute('aria-expanded', String(open));
    };
    const show = (fromUser) => {
      const saved = readJson('localStorage', CONSENT_KEY);
      boxAnalytics.checked = Boolean(saved && saved.analytics);
      boxMarketing.checked = Boolean(saved && saved.marketing);
      banner.hidden = false;
      root.classList.add('has-cookie-banner');
      if (resizer) resizer.observe(banner); else syncHeight();
      if (fromUser) { setPanel(true); banner.querySelector('.cookie-banner__title').focus(); }
    };
    const hide = () => {
      banner.hidden = true;
      root.classList.remove('has-cookie-banner');
      root.style.removeProperty('--cookie-h');
      if (resizer) resizer.disconnect();
      setPanel(false);
      if (opener) { opener.focus(); opener = null; }
    };
    const save = (analytics, marketing) => {
      const previous = readJson('localStorage', CONSENT_KEY);
      const choice = { v: 1, analytics, marketing, at: new Date().toISOString() };
      writeJson('localStorage', CONSENT_KEY, choice);
      applyConsent(choice);
      hide();
      // Quem revoga depois de ter aceitado: as tags já carregadas só param com a página nova.
      if (previous && ((previous.analytics && !analytics) || (previous.marketing && !marketing)) && (loaded.ga4 || loaded.clarity)) window.location.reload();
    };
    banner.querySelector('[data-cookie-accept]').addEventListener('click', () => save(true, true));
    banner.querySelector('[data-cookie-reject]').addEventListener('click', () => save(false, false));
    banner.querySelector('[data-cookie-save]').addEventListener('click', () => save(boxAnalytics.checked, boxMarketing.checked));
    customize.addEventListener('click', () => setPanel(panel.hidden));
    banner.addEventListener('keydown', (event) => {
      // Esc só fecha o aviso quando já existe uma escolha salva (reabertura pelo rodapé); no primeiro acesso ele não decide nada.
      if (event.key === 'Escape' && readJson('localStorage', CONSENT_KEY)) hide();
    });
    document.querySelectorAll('[data-cookie-open]').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      opener = link;
      show(true);
    }));
    const saved = readJson('localStorage', CONSENT_KEY);
    // Primeira visita: o aviso aparece depois do carregamento, sem disputar a primeira pintura da página.
    const showLater = () => window.requestAnimationFrame(() => show(false));
    if (saved && saved.v === 1) applyConsent(saved);
    else if (document.readyState === 'complete') showLater();
    else window.addEventListener('load', showLater, { once: true });
  }

  const year = document.querySelector('[data-current-year]');
  if (year) year.textContent = String(new Date().getFullYear());
})();
