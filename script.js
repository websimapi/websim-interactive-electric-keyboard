import * as Tone from 'tone';

const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: {
        type: "sine"
    },
    envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 1
    }
}).toDestination();

const keyboardContainer = document.querySelector('.keyboard');
const octaveDisplay = document.getElementById('octave-display');
const octaveUpButton = document.getElementById('octave-up');
const octaveDownButton = document.getElementById('octave-down');

let currentOctave = 4;
const minOctave = 0;
const maxOctave = 8;
const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Defines which computer keys map to which notes (0-11 for a chromatic scale)
const keyMapConfig = {
    // Bottom row
    'z': 0, 'x': 1, 'c': 2, 'v': 3, 'b': 4, 'n': 5, 'm': 6, ',': 7, '.': 8, '/': 9,
    // Top row (one octave higher)
    'a': 12, 's': 13, 'd': 14, 'f': 15, 'g': 16, 'h': 17, 'j': 18, 'k': 19, 'l': 20, ';': 21, "'": 22,
};

// This will store the final mapping of computer key to note string (e.g. 'a' -> 'C5')
const keyMap = {}; 
// This will map a note string to its corresponding visual key element
const noteToKeyElement = {};

function generateKeyboard() {
    keyboardContainer.innerHTML = '';
    noteToKeyElement.clear(); // Use noteToKeyElement.clear() in modern browsers if available

    const totalKeys = 25; // Two octaves + 1 key
    const startNoteIndex = notes.indexOf('C');

    for (let i = 0; i < totalKeys; i++) {
        const noteIndex = (startNoteIndex + i) % 12;
        const octaveOffset = Math.floor((startNoteIndex + i) / 12);
        const octave = currentOctave + octaveOffset;
        const noteName = notes[noteIndex];
        const fullNote = `${noteName}${octave}`;

        const keyElement = document.createElement('div');
        keyElement.classList.add('key');
        if (noteName.includes('#')) {
            keyElement.classList.add('black');
        } else {
            keyElement.classList.add('white');
        }
        
        keyElement.dataset.note = fullNote;

        const noteLabel = document.createElement('span');
        noteLabel.textContent = fullNote;
        keyElement.appendChild(noteLabel);
        
        keyboardContainer.appendChild(keyElement);
        noteToKeyElement[fullNote] = keyElement;
    }
    updateKeyMap();
    attachMouseEvents();
}

function updateKeyMap() {
    for (const key in keyMapConfig) {
        const noteOffset = keyMapConfig[key];
        const noteIndex = noteOffset % 12;
        const octaveOffset = Math.floor(noteOffset / 12);
        const note = `${notes[noteIndex]}${currentOctave + octaveOffset}`;
        keyMap[key] = note;
    }
}

function updateOctave(newOctave) {
    currentOctave = Math.max(minOctave, Math.min(maxOctave, newOctave));
    octaveDisplay.textContent = `Octave: ${currentOctave}`;
    generateKeyboard();
}

// Function to play a note
function playNote(note) {
    if (!note) return;
    const keyElement = noteToKeyElement[note];
    if (!keyElement || keyElement.classList.contains('active')) return;

    if (Tone.context.state !== 'running') {
        Tone.start();
    }
    
    synth.triggerAttack(note, Tone.now());
    keyElement.classList.add('active');
}

// Function to release a note
function releaseNote(note) {
    if (!note) return;
    const keyElement = noteToKeyElement[note];
    if (!keyElement || !keyElement.classList.contains('active')) return;

    synth.triggerRelease(note);
    keyElement.classList.remove('active');
}

// Computer Keyboard interaction
document.addEventListener('keydown', e => {
    if (e.repeat) return;
    const key = e.key.toLowerCase();
    const note = keyMap[key];
    if (note) {
        playNote(note);
    }
});

document.addEventListener('keyup', e => {
    const key = e.key.toLowerCase();
    const note = keyMap[key];
    if (note) {
        releaseNote(note);
    }
});

// Mouse/Touch interaction
function attachMouseEvents() {
    const keys = document.querySelectorAll('.key');
    keys.forEach(key => {
        const note = key.dataset.note;
        
        const startPlay = (event) => {
            event.preventDefault();
            playNote(note);
        };

        const stopPlay = (event) => {
            event.preventDefault();
            releaseNote(note);
        };

        key.addEventListener('mousedown', startPlay);
        key.addEventListener('mouseup', stopPlay);
        key.addEventListener('mouseleave', stopPlay);
        
        key.addEventListener('touchstart', startPlay, { passive: false });
        key.addEventListener('touchend', stopPlay);
        key.addEventListener('touchcancel', stopPlay);
    });
}

// A simple way to prompt user to start audio
document.body.addEventListener('click', () => {
    if (Tone.context.state !== 'running') {
        Tone.start();
    }
}, { once: true });

// Octave controls
octaveUpButton.addEventListener('click', () => updateOctave(currentOctave + 1));
octaveDownButton.addEventListener('click', () => updateOctave(currentOctave - 1));

// Initial setup
updateOctave(currentOctave);