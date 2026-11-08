// elizzi-rank.js
// Модуль смены визуального ранга для Elizzi Client

(function() {
    'use strict';

    const POLL_MS = 300;
    const TIMEOUT_MS = 5 * 60 * 1000;

    let interval = null;
    let startTime = 0;
    let targetRank = 3; // По умолчанию Admin

    const RANKS = {
        1: "Grey",
        2: "Cyan",
        3: "Red (Admin)",
        4: "Pink (Clan Leader)",
        5: "Green (1v1)",
        6: "Blue (Clan Member)",
        8: "Orange (Battle Royale)",
        9: "Yellow (Wealthy Player)",
        10: "Light Yellow (Patreon)",
        11: "Black (Zombie Rank)"
    };

    function applyRank(rankValue) {
        try {
            // Ищем лобби-контроллер и нашего игрока
            const lobby = window.bq;
            if (!lobby || !lobby.aFv) return false;

            if (typeof lobby.aFv !== 'object') return false;

            // Основной путь
            if ('wh' in lobby.aFv) {
                lobby.aFv.wh = rankValue;
            } else if ('aNn' in lobby.aFv) {
                // Старая версия
                lobby.aFv.aNn = rankValue;
            } else {
                return false; // Поле не найдено
            }

            // Пробуем обновить UI
            try { lobby.wX && lobby.wX.aHW && lobby.wX.aHW(); } catch (e) {}
            try { lobby.wx && lobby.wx.nH && lobby.wx.nH(); } catch (e) {}

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

            if (applyRank(targetRank)) {
                stopPolling();
            }
        }, POLL_MS);
    }

    function stopPolling() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    // Экспорт в глобальную область
    window.ElizziRank = {
        setRank: function(rank) {
            targetRank = rank;
            startPolling();
        },
        stop: function() {
            stopPolling();
        },
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