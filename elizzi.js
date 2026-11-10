function elizzi() {
    if (typeof u === 'undefined' || typeof w === 'undefined' || typeof x === 'undefined') {
        return;
    }
    
    if (document.getElementById('elizzi-native-content')) {
        u.v(0);
        return;
    }

    const html = `
        <div id="elizzi-native-content" style="text-align: left; padding: 10px; font-family: sans-serif; max-height: 60vh; overflow-y: auto;">
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>Accounts to generate:</span>
                <input type="number" id="elizzi-count" value="10" min="1" max="1000" style="width: 60px; padding: 4px; border-radius: 4px; border: 1px solid #555; background: #222; color: #fff;">
            </div>
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>Account Generator</span>
                <input type="checkbox" id="elizzi-gen-toggle" style="width: 20px; height: 20px;">
            </div>

            <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>🎯 Sniper</span>
                <button id="elizzi-open-sniper" style="padding: 6px 12px; background: #00ff00; color: #000; border: none; border-radius: 4px; font-weight: bold; cursor: pointer;">OPEN</button>
            </div>

            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>Custom Rank:</span>
                <select id="elizzi-rank-select" style="padding: 4px; border-radius: 4px; border: 1px solid #555; background: #222; color: #fff;">
                    <option value="3">Red (Admin)</option>
                    <option value="4">Pink (Clan Leader)</option>
                    <option value="5">Green (1v1)</option>
                    <option value="6">Blue (Clan Member)</option>
                    <option value="8">Orange (Battle Royale)</option>
                    <option value="9">Yellow (Wealthy Player)</option>
                    <option value="10">Light Yellow (Patreon)</option>
                    <option value="11">Black (Zombie Rank)</option>
                </select>
            </div>
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>Set custom rank (Visual Only)</span>
                <input type="checkbox" id="elizzi-rank-toggle" style="width: 20px; height: 20px;">
            </div>

            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>Select Lobby:</span>
                <select id="elizzi-lobby-select" style="padding: 4px; border-radius: 4px; border: 1px solid #555; background: #222; color: #fff;">
                    <option value="1">Lobby 1</option>
                    <option value="2">Lobby 2</option>
                    <option value="3">Lobby 3</option>
                    <option value="4">Lobby 4</option>
                </select>
            </div>
            <div style="margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;">
                <span>Join Another Lobby</span>
                <input type="checkbox" id="elizzi-lobby-toggle" style="width: 20px; height: 20px;">
            </div>

            <div id="elizzi-log" style="background: rgba(0,0,0,0.5); border: 1px solid #444; border-radius: 4px; height: 100px; overflow-y: auto; padding: 5px; font-family: monospace; font-size: 12px; color: #ccc; margin-top: 10px;">
                <div>> System ready.</div>
            </div>
        </div>
    `;

    u.v(4, 1, new w("🌠 Elizzi Client", html, true, [
        new x("❌ Close", function() {
            u.v(1);
            if (typeof u.z !== 'undefined' && typeof u.z.a0 === 'function') {
                u.v(1);
            }
            return true;
        }, bE.q5)
    ]));

    setTimeout(() => {
        initElizziLogic();
    }, 100);
}

function initElizziLogic() {
    const toggle = document.getElementById('elizzi-gen-toggle');
    const countInput = document.getElementById('elizzi-count');
    const log = document.getElementById('elizzi-log');
    const rankSelect = document.getElementById('elizzi-rank-select');
    const rankToggle = document.getElementById('elizzi-rank-toggle');
    const lobbySelect = document.getElementById('elizzi-lobby-select');
    const lobbyToggle = document.getElementById('elizzi-lobby-toggle');
    const openSniperBtn = document.getElementById('elizzi-open-sniper');

    if (!toggle) {
        return;
    }

    const logMsg = (text, type = '') => {
        const div = document.createElement('div');
        div.style.color = type === 'success' ? '#4ade80' : type === 'error' ? '#f87171' : '#7dd3fc';
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
                    if (typeof window.elizziGenerateAccount !== 'function') {
                        throw new Error("elizzi-gen.js not loaded!");
                    }
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

    if (openSniperBtn) {
        openSniperBtn.onclick = () => {
            if (typeof createUI === 'function') {
                createUI();
            } else {
                console.error("Sniper script not loaded!");
            }
        };
    }

    rankToggle.onchange = (e) => {
        if (!window.ElizziRank) {
            logMsg("Rank module not loaded!", 'error');
            e.target.checked = false;
            return;
        }
        if (e.target.checked) {
            const selectedRank = parseInt(rankSelect.value);
            window.ElizziRank.setRank(selectedRank);
            logMsg(`Setting rank: ${window.ElizziRank.getRankName(selectedRank)}...`, 'info');
        } else {
            window.ElizziRank.stop();
            logMsg("Rank setter stopped.", 'info');
        }
    };

    lobbyToggle.onchange = (e) => {
        if (!window.ElizziLobby) {
            logMsg("Lobby module not loaded!", 'error');
            e.target.checked = false;
            return;
        }
        if (e.target.checked) {
            const selectedLobby = parseInt(lobbySelect.value);
            const success = window.ElizziLobby.connect(selectedLobby);
            if (success) {
                logMsg(`Connecting to Lobby ${selectedLobby}...`, 'info');
            } else {
                logMsg(`Failed to connect to Lobby ${selectedLobby}`, 'error');
                e.target.checked = false;
            }
            setTimeout(() => {
                e.target.checked = false;
            }, 1500);
        }
    };
}