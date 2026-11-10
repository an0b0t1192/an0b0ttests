// n
    'use strict';

    const gameWin = window;

    

    function createUI() {
        if (document.getElementById('sniper-ui')) return;

        const ui = document.createElement('div');
        ui.id = 'sniper-ui';
        ui.style.cssText = `
            position: fixed; bottom: 10px; left: 10px; width: 210px;
            background: rgba(15, 15, 15, 0.95); border: 2px solid #00ff00;
            border-radius: 6px; color: #eee; font-family: monospace, sans-serif;
            z-index: 999999; padding: 8px; font-size: 12px;
            box-shadow: 0 4px 10px rgba(0,0,0,0.8);
        `;

        ui.innerHTML = `
            <div style="font-weight: bold; color: #00ff00; margin-bottom: 5px; text-align: center;">Dr.Web Sniper v3.6</div>
            <input id="sui-target" type="text" placeholder="Target Name..." style="width: 100%; box-sizing: border-box; background: #222; border: 1px solid #555; color: #0f0; padding: 4px; margin-bottom: 5px; font-size: 12px; outline: none;">

            <div style="margin-bottom: 5px;">
                <label style="font-size: 10px; color: #aaa;">Match Type</label>
                <select id="sui-mode" style="width: 100%; background: #222; border: 1px solid #555; color: #0f0; padding: 3px; font-size: 12px;">
                    <option value="normal">Normal (~40 ticks)</option>
                    <option value="contest">Contest (~50 ticks)</option>
                </select>
            </div>

            <div style="display: flex; gap: 5px; margin-bottom: 5px;">
                <div style="flex: 1;">
                    <label style="font-size: 10px; color: #aaa;">Off X</label>
                    <input id="sui-offx" type="number" value="4" style="width: 100%; background: #222; border: 1px solid #555; color: #0f0; padding: 2px;">
                </div>
                <div style="flex: 1;">
                    <label style="font-size: 10px; color: #aaa;">Off Y</label>
                    <input id="sui-offy" type="number" value="3" style="width: 100%; background: #222; border: 1px solid #555; color: #0f0; padding: 2px;">
                </div>
            </div>

            <div style="display: flex; gap: 5px;">
                <button id="sui-spawn" style="flex: 1; background: #00ff00; color: #000; border: none; padding: 6px; font-weight: bold; cursor: pointer; border-radius: 3px;">AUTO SNIPE</button>
                <button id="sui-stop" style="flex: 1; background: #ff3333; color: #fff; border: none; padding: 6px; font-weight: bold; cursor: pointer; border-radius: 3px;">STOP</button>
            </div>
        `;
        document.body.appendChild(ui);

        const targetInp = document.getElementById('sui-target');
        const modeSel = document.getElementById('sui-mode');
        const offXInp = document.getElementById('sui-offx');
        const offYInp = document.getElementById('sui-offy');

        let sniperLoop = null;
        let lastTargetId = -1;

        function stop() {
            if (sniperLoop) clearInterval(sniperLoop);
            sniperLoop = null;
            console.log("Dr.Web Sniper: Stopped.");
        }

        document.getElementById('sui-stop').onclick = stop;

        document.getElementById('sui-spawn').onclick = () => {
            stop();

            const targetName = targetInp.value.trim();
            const matchMode = modeSel.value;
            const offX = parseInt(offXInp.value) || 0;
            const offY = parseInt(offYInp.value) || 0;

            if (!targetName) return;

            const targetG7 = (matchMode === 'contest') ? 49 : 39;
            let hasFiredSpawn = false;
            let tickCounter = 0;

            console.log(`Dr.Web Sniper v3.6 armed (${matchMode} mode). Waiting for spawn...`);

            sniperLoop = setInterval(() => {
                try {
                    let targetId = -1;
                    for (let i = 0; i < 512; i++) {
                        if (i === gameWin.aE.fK) continue;
                        let name = gameWin.ah.a1t[i];
                        if (name && name.indexOf(targetName) !== -1) {
                            targetId = i;
                            break;
                        }
                    }

                    if (targetId === -1) return;

                    if (targetId !== lastTargetId) {
                        lastTargetId = targetId;
                    }

                    // --- PHASE 1: SPAWN LOBBY (aE.hz is true) ---
                    if (gameWin.aE.hz) {
                        if (!hasFiredSpawn && gameWin.bi && gameWin.bi.a3Y) {
                            let currentG7 = gameWin.bi.a3Y.aLA;
                            if (typeof currentG7 !== 'undefined' && currentG7 >= targetG7) {
                                hasFiredSpawn = true;

                                const centerX = Math.floor((gameWin.ah.jU[targetId] + gameWin.ah.jV[targetId]) / 2);
                                const centerY = Math.floor((gameWin.ah.jW[targetId] + gameWin.ah.jX[targetId]) / 2);
                                const spawnCellIndex = (centerX + offX) + ((centerY + offY) * gameWin.bV.fl);

                                try {
                                    if (gameWin.bB && gameWin.bB.i1 && typeof gameWin.bB.i1.i2 === 'function') {
                                        gameWin.bB.i1.i2(spawnCellIndex);
                                    }
                                } catch(e) {}

                                try {
                                    if (gameWin.bB && gameWin.bB.qq && typeof gameWin.bB.qq.i2 === 'function') {
                                        gameWin.bB.qq.i2(gameWin.aE.fK, spawnCellIndex);
                                    }
                                } catch(e) {}

                                console.log(`Dr.Web Sniper (${matchMode}): Spawn executed at aLA = ${currentG7}`);
                            }
                        }
                        return;
                    }

                    if (!gameWin.aE.hz) {
                        hasFiredSpawn = false;
                    }

                    // --- PHASE 2: LIVE MATCH ATTACK LOOP (aE.hz is false) ---
                    tickCounter++;
                    if (tickCounter < 10) return; // ~500ms rate limit
                    tickCounter = 0;

                    const atkVal = Math.floor((50 / 100) * 1024);

                    if (gameWin.bB && gameWin.bB.i1 && gameWin.ah) {
                        let myId = gameWin.aE.fK;

                        let myMinX = gameWin.ah.jU[myId], myMaxX = gameWin.ah.jV[myId];
                        let myMinY = gameWin.ah.jW[myId], myMaxY = gameWin.ah.jX[myId];

                        let tMinX = gameWin.ah.jU[targetId], tMaxX = gameWin.ah.jV[targetId];
                        let tMinY = gameWin.ah.jW[targetId], tMaxY = gameWin.ah.jX[targetId];

                        let isTouching = (myMinX <= tMaxX && myMaxX >= tMinX && myMinY <= tMaxY && myMaxY >= tMinY);

                        // Find neutral land identifier dynamically or fall back to standard neutral code
                        let neutralCode = (gameWin.aE && gameWin.aE.fX) ? gameWin.aE.fX : 0;

                        if (isTouching) {
                            // Borders touch: Attack ONLY the target player
                            gameWin.bB.i1.i8(atkVal, targetId);
                        } else {
                            // Expanding: Attack target player AND neutral land simultaneously
                            gameWin.bB.i1.i8(atkVal, targetId);
                            if (neutralCode) {
                                gameWin.bB.i1.i8(atkVal, neutralCode);
                            }
                        }
                    }

                } catch(e) {
                    // Suppress transient loop errors
                }
            }, 50);
        };
    }