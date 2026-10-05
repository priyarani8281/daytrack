class NotificationService {
  constructor() {
    this.audioCtx = null;
  }

  isSupported() {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  getPermission() {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  async requestPermission() {
    if (!this.isSupported()) return 'unsupported';
    try {
      const res = await Notification.requestPermission();
      return res;
    } catch (e) {
      console.warn('Notification permission request error:', e);
      return 'denied';
    }
  }

  sendBrowserNotification(title, options = {}) {
    if (!this.isSupported() || Notification.permission !== 'granted') return null;

    try {
      return new Notification(title, {
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        ...options
      });
    } catch (e) {
      console.warn('Failed to send notification:', e);
      return null;
    }
  }

  // Pleasant Web Audio synthesizer for achievement / completion chime
  playCelebrationSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContext();
      }

      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const now = this.audioCtx.currentTime;

      // Note 1: C5 (523.25 Hz)
      const osc1 = this.audioCtx.createOscillator();
      const gain1 = this.audioCtx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      gain1.gain.setValueAtTime(0.15, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      osc1.connect(gain1);
      gain1.connect(this.audioCtx.destination);
      osc1.start(now);
      osc1.stop(now + 0.3);

      // Note 2: E5 (659.25 Hz)
      const osc2 = this.audioCtx.createOscillator();
      const gain2 = this.audioCtx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(659.25, now + 0.1);
      gain2.gain.setValueAtTime(0.2, now + 0.1);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
      osc2.connect(gain2);
      gain2.connect(this.audioCtx.destination);
      osc2.start(now + 0.1);
      osc2.stop(now + 0.4);

      // Note 3: G5 (783.99 Hz)
      const osc3 = this.audioCtx.createOscillator();
      const gain3 = this.audioCtx.createGain();
      osc3.type = 'sine';
      osc3.frequency.setValueAtTime(783.99, now + 0.2);
      gain3.gain.setValueAtTime(0.25, now + 0.2);
      gain3.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
      osc3.connect(gain3);
      gain3.connect(this.audioCtx.destination);
      osc3.start(now + 0.2);
      osc3.stop(now + 0.6);
    } catch (e) {
      // Audio might be blocked by browser autoplay policy until user gesture
    }
  }
}

export const notificationService = new NotificationService();
