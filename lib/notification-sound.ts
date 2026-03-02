export const playNotificationSound = () => {
    try {
        // Using standard browser audio context for a simple "ping" if no file exists
        const context = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = context.createOscillator();
        const gain = context.createGain();

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(880, context.currentTime); // A5 note
        oscillator.connect(gain);
        gain.connect(context.destination);

        gain.gain.setValueAtTime(0, context.currentTime);
        gain.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, context.currentTime + 0.5);

        oscillator.start(context.currentTime);
        oscillator.stop(context.currentTime + 0.5);
    } catch (e) {
        console.error("Audio notification failed:", e);
    }
};
