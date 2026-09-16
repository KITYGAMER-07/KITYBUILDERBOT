// Helper for interacting with Telegram WebApp SDK
export const tg = typeof window !== 'undefined' ? window.Telegram?.WebApp : null;

export const initTelegramApp = () => {
  if (tg) {
    try {
      tg.ready();
      tg.expand();
      // Apply telegram theme colors if available
      if (tg.themeParams) {
        const root = document.documentElement;
        if (tg.themeParams.bg_color) root.style.setProperty('--tg-theme-bg-color', tg.themeParams.bg_color);
        if (tg.themeParams.secondary_bg_color) root.style.setProperty('--tg-theme-secondary-bg-color', tg.themeParams.secondary_bg_color);
        if (tg.themeParams.text_color) root.style.setProperty('--tg-theme-text-color', tg.themeParams.text_color);
        if (tg.themeParams.hint_color) root.style.setProperty('--tg-theme-hint-color', tg.themeParams.hint_color);
        if (tg.themeParams.link_color) root.style.setProperty('--tg-theme-link-color', tg.themeParams.link_color);
        if (tg.themeParams.button_color) root.style.setProperty('--tg-theme-button-color', tg.themeParams.button_color);
        if (tg.themeParams.button_text_color) root.style.setProperty('--tg-theme-button-text-color', tg.themeParams.button_text_color);
      }
    } catch (e) {
      console.warn('Telegram WebApp init warning:', e);
    }
  }
};

export const triggerHaptic = (style = 'light') => {
  if (tg?.HapticFeedback) {
    try {
      if (style === 'success' || style === 'error' || style === 'warning') {
        tg.HapticFeedback.notificationOccurred(style);
      } else {
        tg.HapticFeedback.impactOccurred(style);
      }
    } catch (e) {
      // ignore
    }
  }
};
