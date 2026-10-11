/**
 * Paneles <dialog> de detalles. Mientras uno está abierto, el escenario no cambia de sección
 * (html[data-dialog="open"]) y el contenido del panel sí se puede desplazar.
 */
export function initDialogs(): void {
  const root = document.documentElement;
  // Evita registrar los eventos dos veces (p. ej. con recarga en caliente en desarrollo)
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
    // Animación de salida: el panel vuelve a su posición oculta y luego se cierra
    dialog.dataset.closing = 'true';
    window.setTimeout(() => {
      // Primero se cierra (ya está fuera de pantalla) y después se limpia la marca
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
        // Animación de entrada: se abre en su posición oculta y en el siguiente frame se desliza
        dialog.dataset.opening = 'true';
        dialog.showModal();
        root.dataset.dialog = 'open';
        void dialog.offsetWidth; // fija el estado inicial antes de animar
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
    // Clic en el fondo oscuro (fuera del panel) cierra
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) close(dialog);
    });
    // Escape: se anima igual que el botón
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
