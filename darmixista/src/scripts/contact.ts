const ENDPOINT = 'https://api.web3forms.com/submit';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type State = 'idle' | 'sending' | 'sent' | 'error';

export function initContact(): void {
  const root = document.documentElement;
  if (root.dataset.contactReady) return;
  root.dataset.contactReady = 'true';

  document.querySelectorAll<HTMLFormElement>('[data-contact-form]').forEach(setupForm);
  setupCopy();
  setupClock();
  setupTypingGuard();
}

export const LIMITS = {
  name: { min: 2, max: 80 },
  email: { max: 120 },
  message: { min: 10, max: 2000, maxLinks: 3 },
  perDay: 3,
  cooldownMs: 60_000,
  minFillMs: 3_000,
};

const LOG_KEY = 'darmixista:contact-log';
const DAY_MS = 24 * 60 * 60 * 1000;
const URL_RE = /(https?:\/\/|www\.)\S+/gi;
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F‪-‮⁦-⁩]/g;

interface SendLog {
  times: number[];
  lastHash?: string;
}

const clean = (value: string) => value.replace(CONTROL_RE, '').replace(/\r\n?/g, '\n').trim();

function hash(text: string): string {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(36);
}

function readLog(): SendLog {
  try {
    const log = JSON.parse(localStorage.getItem(LOG_KEY) ?? '{}') as SendLog;
    const now = Date.now();
    return { times: (log.times ?? []).filter((t) => now - t < DAY_MS), lastHash: log.lastHash };
  } catch {
    return { times: [] };
  }
}

function writeLog(log: SendLog) {
  try {
    localStorage.setItem(LOG_KEY, JSON.stringify(log));
  } catch {
  }
}

function setupForm(form: HTMLFormElement) {
  const d = form.dataset;
  const card = form.parentElement!;
  const sent = card.querySelector<HTMLElement>('[data-form-sent]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const label = form.querySelector<HTMLElement>('[data-submit-label]');
  const counter = form.querySelector<HTMLElement>('[data-char-count]');
  let startedAt = 0;

  const setState = (state: State, message = '') => {
    form.dataset.state = state;
    if (label) label.textContent = state === 'sending' ? d.labelSending ?? '' : d.labelSend ?? '';
    if (status) {
      status.textContent = message;
      if (state === 'error') status.dataset.tone = 'error';
      else delete status.dataset.tone;
    }
  };

  const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | HTMLTextAreaElement | null;
  const showError = (name: string, message: string) => {
    const input = field(name);
    const wrap = input?.closest<HTMLElement>('.cf-field');
    const out = form.querySelector<HTMLElement>(`[data-error-for="${name}"]`);
    if (out) out.textContent = message;
    if (wrap) {
      if (message) wrap.dataset.invalid = 'true';
      else delete wrap.dataset.invalid;
    }
    input?.setAttribute('aria-invalid', String(Boolean(message)));
  };

  const validate = (): { name: string; email: string; message: string } | null => {
    const name = clean(field('name')?.value ?? '').replace(/\s+/g, ' ');
    const email = clean(field('email')?.value ?? '').toLowerCase();
    const message = clean(field('message')?.value ?? '');
    const links = message.match(URL_RE)?.length ?? 0;
    const L = LIMITS;
    const errors: Record<string, string> = {
      name: !name
        ? d.msgRequired ?? ''
        : name.length < L.name.min || name.length > L.name.max || URL_RE.test(name)
          ? d.msgName ?? ''
          : '',
      email: !email
        ? d.msgRequired ?? ''
        : email.length > L.email.max || !EMAIL_RE.test(email)
          ? d.msgEmail ?? ''
          : '',
      message: !message
        ? d.msgRequired ?? ''
        : message.length < L.message.min
          ? d.msgShort ?? ''
          : message.length > L.message.max
            ? d.msgLong ?? ''
            : links > L.message.maxLinks
              ? d.msgLinks ?? ''
              : '',
    };
    URL_RE.lastIndex = 0;
    Object.entries(errors).forEach(([k, v]) => showError(k, v));
    const firstInvalid = Object.keys(errors).find((k) => errors[k]);
    if (firstInvalid) {
      field(firstInvalid)?.focus();
      return null;
    }
    return { name, email, message };
  };

  const updateCounter = () => {
    if (!counter) return;
    const length = field('message')?.value.length ?? 0;
    counter.textContent = `${length}/${LIMITS.message.max}`;
    if (length > LIMITS.message.max * 0.9) counter.dataset.warn = 'true';
    else delete counter.dataset.warn;
  };
  updateCounter();

  form.addEventListener('input', (e) => {
    if (!startedAt) startedAt = Date.now();
    const target = e.target as HTMLInputElement;
    if (target.name && target.closest('.cf-field')?.hasAttribute('data-invalid')) showError(target.name, '');
    if (target.name === 'message') updateCounter();
    if (form.dataset.state === 'error') setState('idle');
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.state === 'sending') return;
    const values = validate();
    if (!values) return;

    const data = new FormData(form);
    const tooFast = !startedAt || Date.now() - startedAt < LIMITS.minFillMs;
    if (data.get('botcheck') || tooFast) return showSent(false);

    const log = readLog();
    const fingerprint = hash(`${values.email}|${values.message}`);
    if (log.lastHash === fingerprint) return setState('error', d.msgDuplicate ?? '');
    if (log.times.length >= LIMITS.perDay) return setState('error', d.msgDaily ?? '');
    const last = log.times[log.times.length - 1];
    if (last && Date.now() - last < LIMITS.cooldownMs) return setState('error', d.msgCooldown ?? '');

    const type = String(data.get('project_type') ?? '').slice(0, 20);
    const subject = `${d.subject} — ${values.name}${type ? ` (${type})` : ''}`;

    if (!d.key) {
      const body = `${values.message}\n\n— ${values.name} <${values.email}>${type ? `\n${type}` : ''}`;
      window.location.href = `mailto:${d.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      return;
    }

    setState('sending');
    try {
      const controller = new AbortController();
      const timeout = window.setTimeout(() => controller.abort(), 15000);
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: d.key,
          subject,
          from_name: 'Darmixista · Portafolio',
          name: values.name,
          email: values.email,
          replyto: values.email,
          project_type: type,
          message: values.message,
          botcheck: false,
        }),
        signal: controller.signal,
      });
      window.clearTimeout(timeout);
      const json = (await res.json().catch(() => ({}))) as { success?: boolean };
      if (res.status === 429) throw new Error('rate-limited');
      if (!res.ok || !json.success) throw new Error('send-failed');
      writeLog({ times: [...log.times, Date.now()], lastHash: fingerprint });
      showSent(true);
    } catch {
      setState('error', d.msgError ?? '');
    }
  });

  function showSent(real: boolean) {
    form.reset();
    updateCounter();
    startedAt = 0;
    setState('sent');
    form.hidden = true;
    if (sent) {
      sent.hidden = false;
      sent.dataset.real = String(real);
      sent.querySelector<HTMLElement>('[data-form-reset]')?.focus({ preventScroll: true });
    }
  }

  card.querySelector('[data-form-reset]')?.addEventListener('click', () => {
    if (sent) sent.hidden = true;
    form.hidden = false;
    setState('idle');
    field('name')?.focus({ preventScroll: true });
  });
}

function setupCopy() {
  document.addEventListener('click', async (e) => {
    const btn = (e.target as Element | null)?.closest<HTMLElement>('[data-copy]');
    if (!btn) return;
    const text = btn.dataset.copy ?? '';
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const area = document.createElement('textarea');
      area.value = text;
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.append(area);
      area.select();
      document.execCommand('copy');
      area.remove();
    }
    const label = btn.querySelector<HTMLElement>('[data-copy-label]');
    if (!label) return;
    const original = label.dataset.original ?? label.textContent ?? '';
    label.dataset.original = original;
    label.textContent = `${btn.dataset.copiedLabel ?? ''} ✓`;
    btn.dataset.done = 'true';
    window.setTimeout(() => {
      label.textContent = original;
      delete btn.dataset.done;
    }, 1800);
  });
}

function setupClock() {
  const clocks = document.querySelectorAll<HTMLTimeElement>('[data-local-time]');
  if (!clocks.length) return;
  const formatters = new Map<HTMLTimeElement, Intl.DateTimeFormat>();
  clocks.forEach((el) => {
    const tz = el.dataset.tz ?? 'UTC';
    formatters.set(
      el,
      new Intl.DateTimeFormat(el.dataset.locale ?? 'es-MX', {
        timeZone: tz,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    );
    const offset = new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'shortOffset' })
      .formatToParts(new Date())
      .find((p) => p.type === 'timeZoneName')?.value;
    const out = el.parentElement?.querySelector<HTMLElement>('[data-local-offset]');
    if (out && offset) out.textContent = offset.replace('-', '−');
  });
  const tick = () => {
    const now = new Date();
    clocks.forEach((el) => {
      el.textContent = formatters.get(el)!.format(now);
      el.dateTime = now.toISOString();
    });
  };
  tick();
  window.setInterval(tick, 1000);
}

function setupTypingGuard() {
  const root = document.documentElement;
  const coarse = window.matchMedia('(pointer: coarse)');
  const isField = (el: EventTarget | null) =>
    el instanceof HTMLElement && el.matches('[data-contact-form] input:not([type="radio"]):not([type="checkbox"]), [data-contact-form] textarea');

  document.addEventListener('focusin', (e) => {
    if (coarse.matches && isField(e.target)) root.dataset.typing = 'true';
  });
  document.addEventListener('focusout', (e) => {
    if (!isField(e.target)) return;
    window.setTimeout(() => {
      if (!isField(document.activeElement)) delete root.dataset.typing;
    }, 50);
  });
}
