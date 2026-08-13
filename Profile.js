const sporeContainer = document.getElementById('sporeContainer');

if (sporeContainer) {
    for (let i = 0; i < 35; i++) {
        const spore = document.createElement('div');
        spore.className = 'spore';

        const size = Math.random() * 6 + 3;
        spore.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            left: ${Math.random() * 100}%;
            animation-duration: ${Math.random() * 8 + 6}s;
            animation-delay: ${Math.random() * 5}s;
        `;

        sporeContainer.appendChild(spore);
    }
}

const canvas = document.getElementById('liquid-canvas');

if (canvas) {
    const ctx = canvas.getContext('2d');

    let width, height;
    let mouse = { x: null, y: null };

    const waves = [
        { yOffset: 0.5, length: 0.005, amplitude: 30, speed: 0.015, color: 'rgba(59, 162, 57, 0.2)' },
        { yOffset: 0.6, length: 0.007, amplitude: 45, speed: 0.01,  color: 'rgba(185, 229, 138, 0.25)' },
        { yOffset: 0.7, length: 0.004, amplitude: 60, speed: 0.008, color: 'rgba(208, 223, 171, 0.2)' }
    ];

    let time = 0;

    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    resize();

    function animate() {
        ctx.clearRect(0, 0, width, height);

        waves.forEach((wave, index) => {
            ctx.beginPath();
            ctx.moveTo(0, height);

            for (let i = 0; i <= width; i++) {
                let y = Math.sin(i * wave.length + time * wave.speed) * wave.amplitude;
                let baseY = height * wave.yOffset;

                if (mouse.x !== null) {
                    let distance = Math.abs(mouse.x - i);
                    if (distance < 300) {
                        y += Math.cos((distance / 300) * (Math.PI / 2)) * 20 * (index + 1);
                    }
                }

                ctx.lineTo(i, baseY + y);
            }

            ctx.lineTo(width, height);
            ctx.fillStyle = wave.color;
            ctx.fill();
        });

        time++;
        requestAnimationFrame(animate);
    }

    animate();
}

/* Profile */
let selectedPhoto = '';
let db;

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'U';
}

function showAvatar(photoData, name) {
    const preview = document.getElementById('avatarPreview');
    const initials = document.getElementById('avatarText');

    if (!preview || !initials) return;

    if (photoData) {
        preview.style.backgroundImage = `url(${photoData})`;
        initials.style.display = 'none';
    } else {
        preview.style.backgroundImage = '';
        initials.textContent = getInitials(name || document.getElementById('nameInput').value);
        initials.style.display = 'block';
    }
}

function setStatus(message) {
    const status = document.getElementById('statusText');
    if (status) {
        status.textContent = message;
    }
}

function updatePreview() {
    const nameInput = document.getElementById('nameInput');
    const bioInput = document.getElementById('bioInput');
    const nameText = document.getElementById('nameText');
    const bioText = document.getElementById('bioText');

    if (nameInput && bioInput && nameText && bioText) {
        nameText.textContent = nameInput.value;
        bioText.textContent = bioInput.value;
        showAvatar(selectedPhoto, nameInput.value);
    }
}

function initDatabase() {
    const nameInput = document.getElementById('nameInput');
    const bioInput = document.getElementById('bioInput');

    if (!nameInput || !bioInput) {
        return;
    }

    if (!window.openDatabase) {
        setStatus('This browser does not support local SQL storage.');
        return;
    }

    db = openDatabase('ProfileDB', '1.0', 'Profile Storage', 2 * 1024 * 1024);
    db.transaction(function(tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS profile (id INTEGER PRIMARY KEY, name TEXT, bio TEXT, photo TEXT)');
        tx.executeSql('SELECT * FROM profile WHERE id = 1', [], function(tx, results) {
            if (results.rows.length > 0) {
                const row = results.rows.item(0);
                nameInput.value = row.name || 'Alicia Chen';
                bioInput.value = row.bio || 'I create calm digital spaces with bright ideas and a simple touch.';
                selectedPhoto = row.photo || '';
                updatePreview();
            } else {
                updatePreview();
            }
        });
    });
}

function saveProfile() {
    const nameInput = document.getElementById('nameInput');
    const bioInput = document.getElementById('bioInput');

    if (!nameInput || !bioInput) {
        return;
    }

    const name = nameInput.value.trim();
    const bio = bioInput.value.trim();

    if (!name) {
        setStatus('Please enter a name.');
        return;
    }

    if (!db) {
        setStatus('Local SQL storage is not available in this browser.');
        return;
    }

    db.transaction(function(tx) {
        tx.executeSql('INSERT OR REPLACE INTO profile (id, name, bio, photo) VALUES (1, ?, ?, ?)', [name, bio, selectedPhoto], function() {
            document.getElementById('nameText').textContent = name;
            document.getElementById('bioText').textContent = bio;
            showAvatar(selectedPhoto, name);
            setStatus('Profile saved successfully.');
        }, function(transaction, error) {
            setStatus('Save failed: ' + error.message);
        });
    });
}

window.saveProfile = saveProfile;

const photoInput = document.getElementById('photoInput');
if (photoInput) {
    photoInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            selectedPhoto = e.target.result;
            updatePreview();
            setStatus('Photo ready to save.');
        };
        reader.readAsDataURL(file);
    });
}

const nameInput = document.getElementById('nameInput');
if (nameInput) {
    nameInput.addEventListener('input', updatePreview);
}

const bioInput = document.getElementById('bioInput');
if (bioInput) {
    bioInput.addEventListener('input', updatePreview);
}

initDatabase();

