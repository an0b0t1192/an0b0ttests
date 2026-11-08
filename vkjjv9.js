// vkjjv9.js
(function() {
    'use strict';

    const MS_PER_TICK = 56;
    let isEnabled = false; 

    const vkjjSteps = [
        { cycle: 1, exactTick: 7.0, percent: 20.8008 },
        { cycle: 1, exactTick: 9.1, percent: 17.8711 },
        { cycle: 2, exactTick: 6.1, percent: 16.69921875 },
        { cycle: 2, exactTick: 7.5, percent: 18.75 },
        { cycle: 2, exactTick: 8.2, percent: 39.74609375 },
        { cycle: 2, exactTick: 9.6, percent: 24.21875 },
        { cycle: 3, exactTick: 6.6, percent: 0.0977 },
        { cycle: 3, exactTick: 7.3, percent: 22.36328125 },
        { cycle: 3, exactTick: 8.0, percent: 52.5390625 },
        { cycle: 3, exactTick: 9.4, percent: 30.17578125 },
        { cycle: 4, exactTick: 6.4, percent: 0.0977 },
        { cycle: 4, exactTick: 7.1, percent: 47.36328125 },
        { cycle: 4, exactTick: 8.5, percent: 36.1328125 },
        { cycle: 4, exactTick: 9.2, percent: 88.37890625 },
        { cycle: 5, exactTick: 6.2, percent: 28.7109375 },
        { cycle: 5, exactTick: 7.6, percent: 23.92578125 },
        { cycle: 5, exactTick: 8.3, percent: 31.8359375 },
        { cycle: 5, exactTick: 9.1, percent: 71.7773 },
    ];

    const openingSteps = vkjjSteps.map(a => {
        const abs = (a.cycle - 1) * 100 + Math.round(a.exactTick * 10);
        return { delayMs: abs * MS_PER_TICK, percent: a.percent };
    }).sort((a, b) => a.delayMs - b.delayMs);

    let timers = [];
    let isRunning = false;
    let wasMatchRunning = false;

    function getGame() {
        const aE = window.aE, ah = window.ah, bB = window.bB, bD = window.bD, bR = window.bR;
        if (!aE || !ah || !bB || !bD || !bR) return null;
        return { aE, ah, bB, bD, bR };
    }

    function sendAttack(percent) {
        const game = getGame();
        if (!game) return;
        const { aE, ah, bB, bD, bR } = game;

        if (!bD.gv.hk(0) && !bD.gv.hk(1)) return;
        if (!bD.gv.hl(aE.fJ)) return;
        if (ah.hb[aE.fJ] < 12) return;

        let val = Math.floor((percent / 100) * 1024);
        if (val < 1) val = 1;
        if (val > 1024) val = 1024;

        try {
            bR.fV[0] = aE.fW;
            bB.hz.i6(val, aE.fW);
        } catch (e) {}
    }

    function startSequence() {
        if (isRunning) return;
        isRunning = true;
        timers = [];
        
        openingSteps.forEach((step, i) => {
            const extra = (i > 0 && step.delayMs === openingSteps[i-1].delayMs) ? 5 : 0;
            timers.push(setTimeout(() => {
                if (!isRunning || !isEnabled) return; // Двойная проверка
                sendAttack(step.percent);
            }, step.delayMs + extra));
        });
    }

    function stopSequence() {
        isRunning = false;
        timers.forEach(clearTimeout);
        timers = [];
    }

    function monitorGameState() {
        try {
            const game = getGame();
            if (game) {
                const { aE, ah } = game;
                const realStart = (
                    aE.a38 === 1 &&
                    !aE.hx &&
                    ah.nU[aE.fJ] > 0 &&
                    ah.hb[aE.fJ] >= 12
                );
                
                if (realStart && !wasMatchRunning) {
                    // Если матч начался, но опенинг выключен — ничего не делаем
                    if (isEnabled) {
                        startSequence();
                    }
                }
                else if (!realStart && wasMatchRunning) {
                    stopSequence();
                }
                
                wasMatchRunning = realStart;
            }
        } catch (e) {}
        requestAnimationFrame(monitorGameState);
    }

    function waitForGame() {
        if (getGame()) {
            monitorGameState();
        } else {
            setTimeout(waitForGame, 100);
        }
    }

    window.VKJJOpening = {
        enable: function() { 
            isEnabled = true; 
            // Если мы уже в игре, запускаем
            const game = getGame();
            if (game && game.aE.a38 === 1 && !game.aE.hx) {
                startSequence();
            }
        },
        disable: function() { 
            isEnabled = false; 
            stopSequence(); 
        },
        get state() { return { isRunning, wasMatchRunning, isEnabled }; }
    };

    waitForGame();

    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "p") stopSequence();
    });
})();