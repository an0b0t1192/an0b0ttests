// elizzi-rank.js
// Модуль смены визуального ранга для Elizzi Client
// Адаптирован под новую версию игры (2.17.4)

(function() {
    'use strict';

    const POLL_MS = 300;
    const TIMEOUT_MS = 5 * 60 * 1000;

    let interval = null;
    let startTime = 0;
    let targetRank = 3;

    const RANKS = {
        1: "Grey (No Rank)",
        2: "Cyan (Verified)",
        3: "Red (Admin)",
        4: "Pink (Clan Leader)",
        5: "Green (1v1)",
        6: "Blue (Clan Member)",
        8: "Orange (Battle Royale)",
        9: "Yellow (Wealthy Player)",
        10: "Light Yellow (Patreon)",
        11: "Black (Zombie Rank)"
    };

    function getPlayer() {
        const bq = window.bq;
        if (!bq) return null;

        if (bq.aGi && typeof bq.aGi === 'object' && 'xB' in bq.aGi) {
            return bq.aGi;
        }

        if (bq.x1 && bq.x1.wM && bq.x1.wM.length > 0) {
            const myUe = bq.aGh;
            if (myUe) {
                for (let i = 0; i < bq.x1.wM.length; i++) {
                    if (bq.x1.wM[i].ur === myUe && 'xB' in bq.x1.wM[i]) {
                        return bq.x1.wM[i];
                    }
                }
            }
            for (let i = 0; i < bq.x1.wM.length; i++) {
                if ('xB' in bq.x1.wM[i]) {
                    return bq.x1.wM[i];
                }
            }
        }

        return null;
    }

    function applyRank(rankValue) {
        try {
            const player = getPlayer();
            if (!player) return false;
            if (!('xB' in player)) return false;

            player.xB = rankValue;

            const bq = window.bq;

            try {
                if (bq.tu && typeof bq.tu.aHA === 'function') {
                    bq.tu.aHA(player.ur);
                }
            } catch (e) {}

            try {
                if (bq.wz && typeof bq.wz.aIg === 'function') {
                    bq.wz.aIg();
                }
            } catch (e) {}

            try {
                if (typeof bi !== 'undefined') {
                    bi.du = true;
                }
            } catch (e) {}

            return true;
        } catch (e) {
            return false;
        }
    }

    function startPolling() {
        if (interval) clearInterval(interval);
        startTime = Date.now();

        interval = setInterval(() => {
            if (Date.now() - startTime > TIMEOUT_MS) {
                stopPolling();
                return;
            }
            applyRank(targetRank);
        }, POLL_MS);
    }

    function stopPolling() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    window.ElizziRank = {
        setRank: function(rank) {
            targetRank = rank;
            startPolling();
        },
        stop: stopPolling,
        getRankName: function(rank) {
            return RANKS[rank] || "Unknown";
        },
        getRanksList: function() {
            return RANKS;
        },
        get isPolling() {
            return interval !== null;
        },
        debug: function() {
            const p = getPlayer();
            return {
                bqExists: !!window.bq,
                player: p,
                hasXB: p && 'xB' in p,
                currentRank: p ? p.xB : null,
                players: window.bq && window.bq.x1 ? window.bq.x1.wM : null
            };
        }
    };
})();
