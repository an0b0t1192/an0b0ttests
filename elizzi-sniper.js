// elizzi-sniper.js
// Модуль снайпера v3.2 (Финальная версия с кнопкой)

(function() {
    'use strict';

    let sniperLoop = null;
    let isSniperActive = false;

    function stopSniper() {
        if (sniperLoop) clearInterval(sniperLoop);
        sniperLoop = null;
        isSniperActive = false;
        console.log("[Sniper] Stopped.");
        
        // Обновляем кнопку, если она есть на экране
        const btn = document.getElementById('sniper-action-btn');
        if (btn) {
            btn.textContent = "START SNIPER";
            btn.style.background = "#4ade80";
            btn.style.color = "#000";
        }
    }

    function startSniper(targetName, matchMode, offX, offY) {
        stopSniper();
        isSniperActive = true;
        console.log(`[Sniper] Started. Target: ${targetName}, Mode: ${matchMode}, OffX: ${offX}, OffY: ${offY}`);

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
                            console.log("[Sniper] Spawned!");
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

            } catch(e) { console.error("[Sniper] Error:", e); }
        }, 50);
    }

    window.openSniperMenu = function() {
        if (document.getElementById('elizzi-sniper-ui')) {
            document.getElementById('elizzi-sniper-ui').remove();
            return;
        }

        // 1. Стили
        if (!document.getElementById('elizzi-sniper-styles')) {
            const style = document.createElement('style');
            style.id = 'elizzi-sniper-styles';
            style.textContent = `
                #elizzi-sniper-ui {
                    position: fixed; top: 60%; left: 50%; transform: translate(-50%, -50%);
                    width: 320px; max-width: 95vw; z-index: 2147483648;
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    color: #fff; user-select: none;
                }
                .sniper-glass {
                    background: rgba(15, 15, 20, 0.95); border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 16px; padding: 20px; backdrop-filter: blur(12px);
                    box-shadow: 0 10px 30px rgba(0,0,0,0.8); position: relative; overflow: hidden;
                }
                .sniper-header {
                    display: flex; justify-content: space-between; align-items: center;
                    border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 10px; margin-bottom: 15px;
                    cursor: grab;
                }
                .sniper-header:active { cursor: grabbing; }
                .sniper-title {
                    font-size: 18px; font-weight: 700;
                    background: linear-gradient(90deg, #a78bfa, #fff);
                    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
                }
                .sniper-close { cursor: pointer; color: #888; font-size: 20px; padding: 5px; }
                .sniper-close:hover { color: #f87171; }
                
                .sniper-row {
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(0,0,0,0.4); padding: 10px 12px; border-radius: 10px;
                    margin-bottom: 15px; border: 1px solid rgba(255,255,255,0.05);
                }
                .sniper-label { font-size: 13px; color: #ccc; }
                .sniper-input, .sniper-select {
                    background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);
                    color: #fff; padding: 4px 8px; border-radius: 6px; font-size: 14px; outline: none;
                }
                .sniper-input { width: 130px; }
                .sniper-input.num { width: 50px; text-align: center; }
                .sniper-select { width: 150px; cursor: pointer; }
                .sniper-select option { background: #1a1a1a; }
            `;
            document.head.appendChild(style);
        }

        // 2. HTML
        const ui = document.createElement('div');
        ui.id = 'elizzi-sniper-ui';
        ui.innerHTML = `
            <div class="sniper-glass">
                <div class="sniper-header" id="sniper-drag-handle">
                    <div class="sniper-title">🟨 Sniper v3.2</div>
                    <div class="sniper-close">✖</div>
                </div>
                
                <div class="sniper-row">
                    <span class="sniper-label">Target Name:</span>
                    <input type="text" id="sniper-target" class="sniper-input" placeholder="Nickname">
                </div>

                <div class="sniper-row">
                    <span class="sniper-label">Match Type:</span>
                    <select id="sniper-mode" class="sniper-select">
                        <option value="normal">Normal (~40 ticks)</option>
                        <option value="contest">Contest (~50 ticks)</option>
                    </select>
                </div>

                <div class="sniper-row">
                    <span class="sniper-label">Offsets:</span>
                    <div style="display: flex; gap: 5px;">
                        <input type="number" id="sniper-offx" class="sniper-input num" value="6">
                        <input type="number" id="sniper-offy" class="sniper-input num" value="4">
                    </div>
                </div>

                <!-- КНОПКА ВМЕСТО ПОЛЗУНКА -->
                <button id="sniper-action-btn" style="width:100%; padding: 12px; background: #4ade80; color: #000; border: none; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 14px; transition: 0.2s;">
                    START SNIPER
                </button>
            </div>
        `;
        document.body.appendChild(ui);

        // 3. Закрытие
        ui.querySelector('.sniper-close').onclick = () => {
            ui.remove();
            stopSniper();
        };

        // 4. Перетаскивание
        const dragHandle = document.getElementById('sniper-drag-handle');
        let isDragging = false, startX, startY, initialLeft, initialTop;
        
        function getCoords(e) {
            if (e.touches && e.touches.length > 0) return { x: e.touches[0].clientX, y: e.touches[0].clientY };
            return { x: e.clientX, y: e.clientY };
        }
        
        function startDrag(e) {
            // Игнорируем клики по крестику, инпутам и КНОПКЕ
            if (e.target.closest('.sniper-close') || 
                e.target.closest('input') || 
                e.target.closest('select') || 
                e.target.closest('#sniper-action-btn')) {
                return;
            }
                
            isDragging = true; const c = getCoords(e); startX = c.x; startY = c.y;
            const r = ui.getBoundingClientRect(); initialLeft = r.left; initialTop = r.top;
            ui.style.transform = 'none'; ui.style.left = initialLeft + 'px'; ui.style.top = initialTop + 'px';
            e.preventDefault();
        }

        dragHandle.addEventListener('mousedown', startDrag);
        dragHandle.addEventListener('touchstart', startDrag, { passive: false });
        
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

        // 5. Логика КНОПКИ (самое главное)
        const actionBtn = document.getElementById('sniper-action-btn');

        // Если снайпер уже активен при открытии меню, меняем кнопку на "STOP"
        if (isSniperActive) {
            actionBtn.textContent = "STOP SNIPER";
            actionBtn.style.background = "#f87171";
            actionBtn.style.color = "#fff";
        }

        actionBtn.onclick = () => {
            if (isSniperActive) {
                // Останавливаем
                stopSniper();
            } else {
                // Запускаем
                const target = document.getElementById('sniper-target').value.trim();
                if (!target) {
                    alert("Please enter a target name!");
                    return;
                }
                
                startSniper(
                    target, 
                    document.getElementById('sniper-mode').value, 
                    parseInt(document.getElementById('sniper-offx').value) || 0, 
                    parseInt(document.getElementById('sniper-offy').value) || 0
                );
                
                actionBtn.textContent = "STOP SNIPER";
                actionBtn.style.background = "#f87171";
                actionBtn.style.color = "#fff";
            }
        };
    };

    window.ElizziSniper = {
        start: startSniper,
        stop: stopSniper,
        get isActive() { return isSniperActive; }
    };
})();
