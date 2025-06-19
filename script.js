import * as Tone from 'tone';

const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "sine" // A softer, more electric piano-like sound
    },
    envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
    }
}).toDestination();

const keys = document.querySelectorAll('.key');
const keyMap = {};
keys.forEach(key => {
    if (key.dataset.key) {
        keyMap[key.dataset.key] = key;
    }
});

const activeNotes = new Map();

// Function to play a note
function playNote(note, keyElement) {
    if (!keyElement || keyElement.classList.contains('active')) return;

    // Start audio context if not already running
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    
    synth.triggerAttack(note, Tone.now());
    keyElement.classList.add('active');
    activeNotes.set(note, keyElement);
}

// Function to release a note
function releaseNote(note, keyElement) {
    if (!keyElement || !keyElement.classList.contains('active')) return;

    synth.triggerRelease(note);
    keyElement.classList.remove('active');
    activeNotes.delete(note);
}

// Computer Keyboard interaction
document.addEventListener('keydown', e => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const keyElement = keyMap[key];
    
    if (keyElement) {
        const note = keyElement.dataset.note;
        playNote(note, keyElement);
    }
});

document.addEventListener('keyup', e => {
    const key = e.key.toLowerCase();
    const keyElement = keyMap[key];
    
    if (keyElement) {
        const note = keyElement.dataset.note;
        releaseNote(note, keyElement);
    }
});

// Mouse/Touch interaction
keys.forEach(key => {
    const note = key.dataset.note;
    
    const startPlay = (event) => {
        event.preventDefault();
        playNote(note, key);
    };

    const stopPlay = (event) => {
        event.preventDefault();
        releaseNote(note, key);
    };

    key.addEventListener('mousedown', startPlay);
    key.addEventListener('mouseup', stopPlay);
    key.addEventListener('mouseleave', stopPlay);
    
    key.addEventListener('touchstart', startPlay, { passive: false });
    key.addEventListener('touchend', stopPlay);
    key.addEventListener('touchcancel', stopPlay);
});

// A simple way to prompt user to start audio
document.body.addEventListener('click', () => {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
}, { once: true });