// elizzi-rank.js
// Модуль смены визуального ранга для Elizzi Client
// Поддерживает обе версии игры: index.html (старая) и newgamecode.html (новая)

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

    function getPlayer() {
        const lobby = window.bq;
        if (!lobby) return null;
        // В ОБЕИХ версиях наш игрок в bq.aGF
        if (lobby.aGF && typeof lobby.aGF === 'object') {
            return lobby.aGF;
        }
        return null;
    }

    function applyRank(rankValue) {
        try {
            const player = getPlayer();
            if (!player) return false;

            // Определяем поле ранга
            let rankField = null;
            if ('wh' in player) {
                rankField = 'wh';      // новая версия (newgamecode.html)
            } else if ('wu' in player) {
                rankField = 'wu';      // старая версия (index.html)
            } else if ('aNn' in player) {
                rankField = 'aNn';     // на всякий случай (старое имя)
            } else {
                return false;
            }

            player[rankField] = rankValue;

            // Обновляем UI
            const lobby = window.bq;
            try {
                if (lobby.wX && typeof lobby.wX.aHW === 'function') lobby.wX.aHW();
            } catch (e) {}
            try {
                if (lobby.wf && typeof lobby.wf.aHn === 'function') lobby.wf.aHn();
            } catch (e) {}
            try {
                if (lobby.wx && typeof lobby.wx.nH === 'function') lobby.wx.nH();
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
        // Для отладки
        debug: function() {
            const p = getPlayer();
            return {
                player: p,
                hasWh: p && 'wh' in p,
                hasWu: p && 'wu' in p,
                hasANn: p && 'aNn' in p,
                currentRank: p ? (p.wh ?? p.wu ?? p.aNn) : null
            };
        }
    };
})();