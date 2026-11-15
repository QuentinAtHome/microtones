// See e.g. https://github.com/jxnblk/bumpkit/blob/master/src/Bumpkit.js
// for audio org example

class Oscillator {
  constructor(options = {}) {
    this.audioContext = options.audioContext;
    this.gainNode = this.audioContext.createGain();
    this.gainNode.gain.value = options.gain;
    this.gainNode.connect(this.audioContext.destination);

    this.oscillators = {};
  }

  start(freq) {
    if (this.oscillators[freq]) {
      return;
    }

    const now = this.audioContext.currentTime;
    let oscillator = this.audioContext.createOscillator();
    let noteGain = this.audioContext.createGain();

    // Smooth 15ms fade-in so starting a note doesn't click either
    noteGain.gain.setValueAtTime(0.0001, now);
    noteGain.gain.exponentialRampToValueAtTime(1, now + 0.015);

    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    oscillator.connect(noteGain);
    noteGain.connect(this.gainNode);
    oscillator.start(now);

    console.log('playing frequency at value', oscillator.frequency.value);

    this.oscillators[freq] = { oscillator, noteGain };
  }

  stop(freq) {
    if (!this.oscillators[freq]) {
      return;
    }

    const { oscillator, noteGain } = this.oscillators[freq];
    delete this.oscillators[freq];

    const now = this.audioContext.currentTime;
    const releaseTime = 0.035; // 35ms smooth fade-out

    noteGain.gain.cancelScheduledValues(now);
    noteGain.gain.setValueAtTime(Math.max(noteGain.gain.value, 0.0001), now);
    noteGain.gain.exponentialRampToValueAtTime(0.0001, now + releaseTime);

    oscillator.stop(now + releaseTime + 0.005);
    setTimeout(() => {
      oscillator.disconnect();
      noteGain.disconnect();
    }, (releaseTime + 0.02) * 1000);
  }
}

export default Oscillator;
