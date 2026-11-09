// elizzi-sniper.js
// Модуль снайпера v3.2 для Elizzi Client (с UI и крестиком)

(function() {
    'use strict';

    let sniperLoop = null;
    let isSniperActive = false;

    // --- ЛОГИКА СНАЙПЕРА ---
    function stopSniper() {
        if (sniperLoop) clearInterval(sniperLoop);
        sniperLoop = null;
        isSniperActive = false;
        const btn = document.getElementById('sniper-toggle');
        if (btn) btn.checked = false;
    }

    function startSniper(targetName, matchMode, offX, offY) {
        stopSniper();
        isSniperActive = true;

        const targetG7 = (matchMode === 'contest') ? 49 : 39;
        let hasFiredSpawn = false;
        let tickCounter = 0;

        sniperLoop = setInterval(() => {
            try {
                const gameWin = window;
                if (typeof gameWin.aE === 'undefined' || typeof gameWin.ah === 'undefined') return;

                let targetId = -1;
                for (let i = 0; i < 512; i++) {
                    if (i === gameWin.aE.fK) continue;
                    let name = gameWin.ah.a1p[i];
                    if (name && name.indexOf(targetName) !== -1) {
                        targetId = i;
                        break;
                    }
                }

                if (targetId === -1) return;

                // --- SPAWN PHASE ---
                if (gameWin.aE.hy) {
                    if (!hasFiredSpawn && gameWin.bi && gameWin.bi.a3S) {
                        let currentG7 = gameWin.bi.a3S.aKK;
                        if (typeof currentG7 !== 'undefined' && currentG7 >= targetG7) {
                            const centerX = Math.floor((gameWin.ah.jT[targetId] + gameWin.ah.jU[targetId]) / 2);
                            const centerY = Math.floor((gameWin.ah.jV[targetId] + gameWin.ah.jW[targetId]) / 2);
                            const spawnCellIndex = (centerX + offX) + ((centerY + offY) * gameWin.bV.fl);

                            if (gameWin.aE.lF) {
                                gameWin.bB.ql.i1(gameWin.aE.fK, spawnCellIndex);
                            } else {
                                gameWin.bB.i0.i1(spawnCellIndex);
                            }
                            hasFiredSpawn = true;
                        }
                    }
                    return;
                }

                if (!gameWin.aE.hy) hasFiredSpawn = false;

                // --- ATTACK PHASE ---
                tickCounter++;
                if (tickCounter < 10) return;
                tickCounter = 0;

                const atkVal = Math.floor((50 / 100) * 1024);

                if (gameWin.bB && gameWin.bB.i0 && gameWin.ah) {
                    let myId = gameWin.aE.fK;
                    let myMinX = gameWin.ah.jT[myId], myMaxX = gameWin.ah.jU[myId];
                    let myMinY = gameWin.ah.jV[myId], myMaxY = gameWin.ah.jW[myId];
                    let tMinX = gameWin.ah.jT[targetId], tMaxX = gameWin.ah.jU[targetId];
                    let tMinY = gameWin.ah.jV[targetId], tMaxY = gameWin.ah.jW[targetId];

                    let isTouching = (myMinX <= tMaxX && myMaxX >= tMinX && myMinY <= tMaxY && myMaxY >= tMinY);

                    if (isTouching) {
                        gameWin.bB.i0.i7(atkVal, targetId);
                    } else {
                        gameWin.bB.i0.i7(atkVal, targetId);
                        gameWin.bB.i0.i7(atkVal, gameWin.aE.fX);
                    }
                }

            } catch(e) {}
        }, 50);
    }

    // --- UI СНАЙПЕРА ---
    window.openSniperMenu = function() {
        if (document.getElementById('elizzi-sniper-ui')) {
            document.getElementById('elizzi-sniper-ui').remove();
            return;
        }

        const ui = document.createElement('div');
        ui.id = 'elizzi-sniper-ui';
        ui.style.cssText = `
            position: fixed; top: 60%; left: 50%; transform: translate(-50%, -50%);
            width: 320px; max-width: 95vw; z-index: 2147483648;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #fff; user-select: none; touch-action: none;
        `;

        ui.innerHTML = `
            <div style="background: rgba(15, 15, 20, 0.95); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; padding: 20px; backdrop-filter: blur(12px); box-shadow: 0 10px 30px rgba(0,0,0,0.8); position: relative; overflow: hidden;">
                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px; cursor: grab;" id="sniper-drag-handle">
                    <div style="font-size: 18px; font-weight: 700; background: linear-gradient(90deg, #a78bfa, #fff); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">🟨 Sniper v3.2</div>
                    <div class="sniper-close" style="cursor: pointer; color: #888; font-size: 20px; padding: 5px;">✖</div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 10px 12px; border-radius: 10px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);">
                    <span style="font-size: 13px; color: #ccc;">Target Name:</span>
                    <input type="text" id="sniper-target" placeholder="Nickname" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 4px 8px; border-radius: 6px; width: 150px; font-size: 14px; outline: none;">
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 10px 12px; border-radius: 10px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);">
                    <span style="font-size: 13px; color: #ccc;">Match Type:</span>
                    <select id="sniper-mode" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 4px 8px; border-radius: 6px; width: 180px; font-size: 13px; outline: none; cursor: pointer;">
                        <option value="normal">Normal (~40 ticks)</option>
                        <option value="contest">Contest (~50 ticks)</option>
                    </select>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 10px 12px; border-radius: 10px; margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);">
                    <span style="font-size: 13px; color: #ccc;">Offsets (X / Y):</span>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" id="sniper-offx" value="6" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 4px; border-radius: 6px; width: 50px; text-align: center; outline: none;">
                        <input type="number" id="sniper-offy" value="4" style="background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2); color: #fff; padding: 4px; border-radius: 6px; width: 50px; text-align: center; outline: none;">
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.4); padding: 12px; border-radius: 10px; margin-bottom: 0; border: 1px solid rgba(255,255,255,0.05);">
                    <span style="font-size: 14px; font-weight: 600; color: #ccc;">Auto Snipe</span>
                    <label style="position: relative; display: inline-block; width: 46px; height: 24px;">
                        <input type="checkbox" id="sniper-toggle" style="opacity: 0; width: 0; height: 0;">
                        <span style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #333; transition: .4s; border-radius: 24px; border: 1px solid rgba(255,255,255,0.1);"></span>
                    </label>
                </div>
            </div>
            <style>
                #sniper-toggle:checked + span { background-color: #4ade80 !important; border-color: #4ade80 !important; }
                #sniper-toggle:checked + span:before { transform: translateX(22px) !important; background-color: #000 !important; }
                #sniper-toggle + span:before { position: absolute; content: ""; height: 16px; width: 16px; left: 3px; bottom: 3px; background-color: #888; transition: .4s; border-radius: 50%; }
            </style>
        `;
        document.body.appendChild(ui);

        // Крестик
        ui.querySelector('.sniper-close').onclick = () => {
            ui.remove();
            stopSniper();
        };

        // Перетаскивание
        const dragHandle = document.getElementById('sniper-drag-handle');
        let isDragging = false, startX, startY, initialLeft, initialTop;
        function getCoords(e) {
            if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }
        dragHandle.addEventListener('mousedown', (e) => {
            if (e.target.classList.contains('sniper-close')) return;
            isDragging = true; const c = getCoords(e); startX = c.x; startY = c.y;
            const r = ui.getBoundingClientRect(); initialLeft = r.left; initialTop = r.top;
            ui.style.transform = 'none'; ui.style.left = initialLeft + 'px'; ui.style.top = initialTop + 'px';
            e.preventDefault();
        });
        dragHandle.addEventListener('touchstart', (e) => {
            if (e.target.classList.contains('sniper-close')) return;
            isDragging = true; const c = getCoords(e); startX = c.x; startY = c.y;
            const r = ui.getBoundingClientRect(); initialLeft = r.left; initialTop = r.top;
            ui.style.transform = 'none'; ui.style.left = initialLeft + 'px'; ui.style.top = initialTop + 'px';
            e.preventDefault();
        }, { passive: false });
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            const c = getCoords(e);
            ui.style.left = (initialLeft + c.x - startX) + 'px'; ui.style.top = (initialTop + c.y - startY) + 'px';
        });
        document.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            const c = getCoords(e);
            ui.style.left = (initialLeft + c.x - startX) + 'px'; ui.style.top = (initialTop + c.y - startY) + 'px';
        }, { passive: false });
        document.addEventListener('mouseup', () => { isDragging = false; });
        document.addEventListener('touchend', () => { isDragging = false; });

        // Тумблер включения
        const sniperToggle = document.getElementById('sniper-toggle');
        if (isSniperActive) sniperToggle.checked = true;

        sniperToggle.onchange = (e) => {
            if (e.target.checked) {
                const target = document.getElementById('sniper-target').value.trim();
                if (!target) { e.target.checked = false; return; }
                startSniper(target, document.getElementById('sniper-mode').value, parseInt(document.getElementById('sniper-offx').value)||0, parseInt(document.getElementById('sniper-offy').value)||0);
            } else {
                stopSniper();
            }
        };
    };

    // Экспорт для UI
    window.ElizziSniper = {
        start: startSniper,
        stop: stopSniper,
        get isActive() { return isSniperActive; }
    };
})();