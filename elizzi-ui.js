// elizzi-ui.js
// Интерфейс Elizzi Client (Полная версия с плавающим меню)

function openElizziMenu() {
    if (document.getElementById('elizzi-client-ui')) {
        document.getElementById('elizzi-client-ui').remove();
        return;
    }

    // 1. Подключение стилей
    if (!document.getElementById('elizzi-styles')) {
        const style = document.createElement('style');
        style.id = 'elizzi-styles';
        style.textContent = `
            #elizzi-client-ui {
                position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
                width: 450px; max-width: 95vw; z-index: 2147483647;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                color: #fff; user-select: none;
                touch-action: none;
            }
            .elizzi-glass {
                background: rgba(15, 15, 20, 0.9);
                border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 16px; padding: 20px;
                backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
                box-shadow: 0 10px 30px rgba(0,0,0,0.8);
                position: relative; overflow: hidden;
            }
            .elizzi-glass::before {
                content: ''; position: absolute; inset: 0;
                background: radial-gradient(circle at top, rgba(100, 100, 255, 0.15), transparent 70%);
                pointer-events: none;
            }
            .elizzi-header {
                display: flex; justify-content: space-between; align-items: center;
                border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;
                position: relative; z-index: 1;
                cursor: grab;
            }
            .elizzi-header:active { cursor: grabbing; }
            
            .elizzi-title {
                font-size: 18px; font-weight: 700;
                background: linear-gradient(90deg, #a78bfa, #fff);
                -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                pointer-events: none;
            }
            .elizzi-close {
                cursor: pointer; color: #888; font-size: 20px; line-height: 1;
                transition: 0.2s; padding: 5px;
            }
            .elizzi-close:hover { color: #f87171; }
            
            .elizzi-input-row {
                display: flex; justify-content: space-between; align-items: center;
                background: rgba(0,0,0,0.4); padding: 10px 12px; border-radius: 10px;
                margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);
                position: relative; z-index: 1;
            }
            .elizzi-input-label { font-size: 13px; color: #ccc; }
            .elizzi-input {
                background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                color: #fff; padding: 4px 8px; border-radius: 6px; width: 60px;
                text-align: center; font-size: 14px; outline: none;
            }
            .elizzi-input:focus { border-color: #a78bfa; }

            .elizzi-select {
                background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                color: #fff; padding: 4px 8px; border-radius: 6px; width: 180px;
                font-size: 13px; outline: none; cursor: pointer;
            }
            .elizzi-select option { background: #1a1a1a; color: #fff; }

            .elizzi-toggle-row {
                display: flex; justify-content: space-between; align-items: center;
                background: rgba(0,0,0,0.4); padding: 12px; border-radius: 10px;
                margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);
                position: relative; z-index: 1;
            }
            .elizzi-toggle-label { font-size: 14px; font-weight: 600; color: #ccc; }
            .elizzi-switch {
                position: relative; display: inline-block; width: 46px; height: 24px;
            }
            .elizzi-switch input { opacity: 0; width: 0; height: 0; }
            .elizzi-slider {
                position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0;
                background-color: #333; transition: .4s; border-radius: 24px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .elizzi-slider:before {
                position: absolute; content: ""; height: 16px; width: 16px;
                left: 3px; bottom: 3px; background-color: #888;
                transition: .4s; border-radius: 50%;
            }
            .elizzi-switch input:checked + .elizzi-slider {
                background-color: #4ade80; border-color: #4ade80;
            }
            .elizzi-switch input:checked + .elizzi-slider:before {
                transform: translateX(22px); background-color: #000;
            }

            .elizzi-log {
                background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.05);
                border-radius: 8px; height: 150px; overflow-y: auto; padding: 10px;
                font-family: monospace; font-size: 12px; color: #ccc;
                position: relative; z-index: 1;
            }
            .elizzi-log-line { margin-bottom: 4px; }
            .elizzi-log-line.success { color: #4ade80; }
            .elizzi-log-line.error { color: #f87171; }
            .elizzi-log-line.info { color: #7dd3fc; }
        `;
        document.head.appendChild(style);
    }

    // 2. HTML структура
    const ui = document.createElement('div');
    ui.id = 'elizzi-client-ui';
    ui.innerHTML = `
        <div class="elizzi-glass">
            <div class="elizzi-header" id="elizzi-drag-handle">
                <div class="elizzi-title">🌠 Elizzi Client</div>
                <div class="elizzi-close">✖</div>
            </div>
            
            <!-- Генератор -->
            <div class="elizzi-input-row">
                <span class="elizzi-input-label">Accounts to generate:</span>
                <input type="number" id="elizzi-count" class="elizzi-input" value="10" min="1" max="1000">
            </div>
            <div class="elizzi-toggle-row">
                <span class="elizzi-toggle-label">Account Generator</span>
                <label class="elizzi-switch">
                    <input type="checkbox" id="elizzi-gen-toggle">
                    <span class="elizzi-slider"></span>
                </label>
            </div>

            <!-- VKJJ Opening -->
            <div class="elizzi-toggle-row">
                <span class="elizzi-toggle-label">VKJJv9 Opening</span>
                <label class="elizzi-switch">
                    <input type="checkbox" id="elizzi-vkjj-toggle">
                    <span class="elizzi-slider"></span>
                </label>
            </div>

            <!-- Custom Rank -->
            <div class="elizzi-input-row">
                <span class="elizzi-input-label">Custom Rank:</span>
                <select id="elizzi-rank-select" class="elizzi-select">
                    <option value="3">Red (Admin)</option>
                    <option value="4">Purple (Clan Leader)</option>
                    <option value="5">Green (1v1)</option>
                    <option value="6">Blue (Clan Member)</option>
                    <option value="8">Orange (Battle Royale)</option>
                    <option value="9">Yellow (Wealthy Player)</option>
                    <option value="10">Light Yellow (Patreon)</option>
                    <option value="11">Black (Zombie Rank)</option>
                </select>
            </div>
            <div class="elizzi-toggle-row">
                <span class="elizzi-toggle-label">Set custom rank (Visual Only)</span>
                <label class="elizzi-switch">
                    <input type="checkbox" id="elizzi-rank-toggle">
                    <span class="elizzi-slider"></span>
                </label>
            </div>

            <!-- Join Another Lobby -->
            <div class="elizzi-input-row">
                <span class="elizzi-input-label">Select Lobby:</span>
                <select id="elizzi-lobby-select" class="elizzi-select">
                    <option value="1">Lobby 1</option>
                    <option value="2">Lobby 2</option>
                    <option value="3">Lobby 3</option>
                    <option value="4">Lobby 4</option>
                </select>
            </div>
            <div class="elizzi-toggle-row">
                <span class="elizzi-toggle-label">Join Another Lobby</span>
                <label class="elizzi-switch">
                    <input type="checkbox" id="elizzi-lobby-toggle">
                    <span class="elizzi-slider"></span>
                </label>
            </div>
            
            <div id="elizzi-log" class="elizzi-log">
                <div class="elizzi-log-line">System ready. Choose an option above.</div>
            </div>
        </div>
    `;
    document.body.appendChild(ui);

    // --- 3. ЛОГИКА ПЕРЕТАСКИВАНИЯ (DRAG) ---
    const dragHandle = document.getElementById('elizzi-drag-handle');
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    function getCoords(e) {
        if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        return { x: e.clientX, y: e.clientY };
    }

    function startDrag(e) {
        if (e.target.classList.contains('elizzi-close')) return;
        isDragging = true;
        const coords = getCoords(e);
        startX = coords.x;
        startY = coords.y;
        const rect = ui.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;
        ui.style.transform = 'none'; 
        ui.style.left = initialLeft + 'px';
        ui.style.top = initialTop + 'px';
        e.preventDefault();
    }

    function onDrag(e) {
        if (!isDragging) return;
        const coords = getCoords(e);
        const dx = coords.x - startX;
        const dy = coords.y - startY;
        ui.style.left = (initialLeft + dx) + 'px';
        ui.style.top = (initialTop + dy) + 'px';
    }

    function endDrag() { isDragging = false; }

    dragHandle.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', onDrag);
    document.addEventListener('mouseup', endDrag);
    dragHandle.addEventListener('touchstart', startDrag, { passive: false });
    document.addEventListener('touchmove', onDrag, { passive: false });
    document.addEventListener('touchend', endDrag);

    ui.querySelector('.elizzi-close').onclick = () => {
        ui.remove();
        document.removeEventListener('mousemove', onDrag);
        document.removeEventListener('mouseup', endDrag);
        document.removeEventListener('touchmove', onDrag);
        document.removeEventListener('touchend', endDrag);
    };

    // --- 4. ЛОГИКА МОДУЛЕЙ ---
    const toggle = document.getElementById('elizzi-gen-toggle');
    const countInput = document.getElementById('elizzi-count');
    const log = document.getElementById('elizzi-log');
    const vkjjToggle = document.getElementById('elizzi-vkjj-toggle');
    const rankSelect = document.getElementById('elizzi-rank-select');
    const rankToggle = document.getElementById('elizzi-rank-toggle');
    const lobbySelect = document.getElementById('elizzi-lobby-select');
    const lobbyToggle = document.getElementById('elizzi-lobby-toggle');

    const logMsg = (text, type = '') => {
        const div = document.createElement('div');
        div.className = `elizzi-log-line ${type}`;
        div.textContent = `> ${text}`;
        log.appendChild(div);
        log.scrollTop = log.scrollHeight;
    };

    const saveToFile = (content, filename) => {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Генератор
    toggle.onchange = async (e) => {
        if (e.target.checked) {
            let targetCount = parseInt(countInput.value) || 1;
            window.elizziGenActive = true;
            log.innerHTML = ''; 
            logMsg(`Starting generation of ${targetCount} accounts...`, 'info');
            
            let generatedAccounts = [];
            let currentCount = 0;

            while (window.elizziGenActive && currentCount < targetCount) {
                try {
                    if (typeof window.elizziGenerateAccount !== 'function') throw new Error("elizzi-gen.js not loaded!");
                    const result = await window.elizziGenerateAccount();
                    if (result && result.username) {
                        generatedAccounts.push(`${result.username}:${result.password}`);
                        currentCount++;
                        logMsg(`[${currentCount}/${targetCount}] Generated: ${result.username}`, 'success');
                        if (generatedAccounts.length % 10 === 0) {
                            saveToFile(generatedAccounts.join('\n'), `elizzi_accounts_${Date.now()}.txt`);
                            logMsg(`Saved ${generatedAccounts.length} accounts to file.`, 'info');
                        }
                    }
                } catch (err) {
                    logMsg(`Error: ${err.message}`, 'error');
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
            if (generatedAccounts.length > 0 && generatedAccounts.length % 10 !== 0) {
                saveToFile(generatedAccounts.join('\n'), `elizzi_accounts_final_${Date.now()}.txt`);
            }
            logMsg(`Finished! Total generated: ${currentCount}`, 'info');
            toggle.checked = false;
            window.elizziGenActive = false;
        } else {
            window.elizziGenActive = false;
            logMsg("Generator stopped manually.", 'info');
        }
    };

    // VKJJ
    if (window.VKJJOpening && window.VKJJOpening.state.isRunning) vkjjToggle.checked = true;
    vkjjToggle.onchange = (e) => {
        if (!window.VKJJOpening) { logMsg("VKJJ module not loaded!", 'error'); e.target.checked = false; return; }
        if (e.target.checked) {
            window.VKJJOpening.start();
            logMsg("VKJJ Opening started.", 'info');
        } else {
            window.VKJJOpening.stop();
            logMsg("VKJJ Opening stopped.", 'info');
        }
    };

    // Rank
    rankToggle.onchange = (e) => {
        if (!window.ElizziRank) { logMsg("Rank module not loaded!", 'error'); e.target.checked = false; return; }
        if (e.target.checked) {
            const selectedRank = parseInt(rankSelect.value);
            window.ElizziRank.setRank(selectedRank);
            logMsg(`Setting rank: ${window.ElizziRank.getRankName(selectedRank)}...`, 'info');
        } else {
            window.ElizziRank.stop();
            logMsg("Rank setter stopped.", 'info');
        }
    };

    // Lobby
    lobbyToggle.onchange = (e) => {
        if (!window.ElizziLobby) { logMsg("Lobby module not loaded!", 'error'); e.target.checked = false; return; }
        if (e.target.checked) {
            const selectedLobby = parseInt(lobbySelect.value);
            const success = window.ElizziLobby.connect(selectedLobby);
            if (success) {
                logMsg(`Connecting to Lobby ${selectedLobby}...`, 'info');
            } else {
                logMsg(`Failed to connect to Lobby ${selectedLobby}`, 'error');
                e.target.checked = false;
            }
            setTimeout(() => { e.target.checked = false; }, 1500);
        }
    };
        }
