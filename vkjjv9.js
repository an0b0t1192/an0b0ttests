// vkjjv9.js - Финальная версия (без логов)

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
    let monitorRaf = null;

    function getGame() {
        if (!window.aE || !window.ah || !window.bB || !window.bB.ql || !window.bi) return null;
        return { 
            aE: window.aE, 
            ah: window.ah, 
            bB: window.bB,
            bi: window.bi 
        };
    }

    function isMatchRunning() {
        const game = getGame();
        if (!game) return false;
        const { aE, ah, bi } = game;
        try {
            const ticks = bi ? (bi.kr ? bi.kr() : (bi.ks ? bi.ks() : 0)) : 0;
            
            return (
                aE.a3I === 1 &&            
                !aE.hx &&                  
                ticks > 0 && 
                ah.nX[aE.fK] !== 0 &&      
                ah.hc[aE.fK] >= 12         
            );
        } catch (e) {
            return false;
        }
    }

    function sendAttack(percent) {
        const game = getGame();
        if (!game) return;
        const { aE, ah, bB } = game;

        try {
            if (ah.hc[aE.fK] < 12) return;            

            let val = Math.floor((percent / 100) * 1024);
            if (val < 1) val = 1;
            if (val > 1024) val = 1024;

            bB.ql.i7(aE.fK, val, aE.fX);
        } catch (e) {}
    }

    function startSequence() {
        if (isRunning) return;
        isRunning = true;
        timers = [];
        
        openingSteps.forEach((step, i) => {
            const extra = (i > 0 && step.delayMs === openingSteps[i - 1].delayMs) ? 5 : 0;
            timers.push(setTimeout(() => {
                if (!isRunning || !isEnabled) return;
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
            const realStart = isMatchRunning();
            
            if (realStart && !wasMatchRunning) {
                if (isEnabled) {
                    startSequence();
                }
            } else if (!realStart && wasMatchRunning) {
                stopSequence();
            }
            wasMatchRunning = realStart;
        } catch (e) {}
        monitorRaf = requestAnimationFrame(monitorGameState);
    }

    function waitForGame() {
        if (getGame()) {
            if (!monitorRaf) monitorGameState();
        } else {
            setTimeout(waitForGame, 100);
        }
    }

    window.VKJJOpening = {
        enable: function() { 
            isEnabled = true; 
            if (isMatchRunning()) startSequence();
        },
        disable: function() { 
            isEnabled = false; 
            stopSequence(); 
        },
        toggle: function() {
            if (isEnabled) this.disable();
            else this.enable();
        },
        get state() { 
            return { isRunning, wasMatchRunning, isEnabled, inMatch: isMatchRunning() }; 
        }
    };

    waitForGame();

    window.addEventListener("keydown", (e) => {
        if (e.key.toLowerCase() === "p") {
            stopSequence();
        }
    });
})();