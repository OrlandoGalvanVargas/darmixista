export function initDialogs(): void {
  const root = document.documentElement;
  if (root.dataset.dialogsReady) return;
  root.dataset.dialogsReady = 'true';
  let opener: HTMLElement | null = null;

  const close = (dialog: HTMLDialogElement) => {
    if (!dialog.open || dialog.dataset.closing) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      dialog.close();
      return;
    }
    dialog.dataset.closing = 'true';
    window.setTimeout(() => {
      dialog.close();
      delete dialog.dataset.closing;
    }, 400);
  };

  document.addEventListener('click', (e) => {
    const target = e.target as Element | null;
    const trigger = target?.closest<HTMLElement>('[data-open-dialog]');
    if (trigger) {
      const dialog = document.getElementById(trigger.dataset.openDialog ?? '');
      if (dialog instanceof HTMLDialogElement && !dialog.open) {
        opener = trigger;
        dialog.dataset.opening = 'true';
        dialog.showModal();
        root.dataset.dialog = 'open';
        void dialog.offsetWidth;
        requestAnimationFrame(() => delete dialog.dataset.opening);
      }
      return;
    }
    const closer = target?.closest<HTMLElement>('[data-close-dialog]');
    if (closer) {
      const dialog = closer.closest('dialog');
      if (dialog) close(dialog);
    }
  });

  document.querySelectorAll<HTMLDialogElement>('dialog.project-dialog').forEach((dialog) => {
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) close(dialog);
    });
    dialog.addEventListener('cancel', (e) => {
      e.preventDefault();
      close(dialog);
    });
    dialog.addEventListener('close', () => {
      delete root.dataset.dialog;
      opener?.focus({ preventScroll: true });
      opener = null;
    });
  });
}
