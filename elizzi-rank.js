// elizzi-rank.js
// Модуль смены визуального ранга для Elizzi Client

(function() {
    'use strict';

    const POLL_MS = 100; // Проверяем каждые 100мс, чтобы ранг не успевал слетать
    const TIMEOUT_MS = 5 * 60 * 1000; // Таймаут 5 минут (защита от вечного цикла)

    let interval = null;
    let startTime = 0;
    let targetRank = 3; // По умолчанию Admin

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

        if (bq.aGT && typeof bq.aGT === 'object' && 'wy' in bq.aGT) {
            return bq.aGT;
        }

        if (bq.wo && bq.wo.w9 && bq.wo.w9.length > 0) {
            const myUe = bq.aGS;
            if (myUe) {
                for (let i = 0; i < bq.wo.w9.length; i++) {
                    if (bq.wo.w9[i].ue === myUe && 'wy' in bq.wo.w9[i]) {
                        return bq.wo.w9[i];
                    }
                }
            }
            for (let i = 0; i < bq.wo.w9.length; i++) {
                if ('wy' in bq.wo.w9[i]) {
                    return bq.wo.w9[i];
                }
            }
        }

        return null;
    }

    function applyRank(rankValue) {
        try {
            const player = getPlayer();
            if (!player) return false;

            // Если ранг уже стоит такой, как надо, не дергаем UI лишний раз
            if (player.wy === rankValue) return true;

            player.wy = rankValue;

            const bq = window.bq;

            try {
                if (bq.td && typeof bq.td.aGv === 'function') {
                    bq.td.aGv(player.ue);
                }
            } catch (e) {}

            try {
                if (bq.wm && typeof bq.wm.aIQ === 'function') {
                    bq.wm.aIQ();
                }
            } catch (e) {}

            try {
                if (typeof aE !== 'undefined' && aE.a3O === 1 && typeof bi !== 'undefined') {
                    bi.ds = true;
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
        }
    };
})();