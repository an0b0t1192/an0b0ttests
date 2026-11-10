// elizzi-lobby.js
// Модуль подключения к разным лобби для Elizzi Client

(function() {
    'use strict';

    // Доступные лобби (индекс: { name, url })
    const LOBBIES = {
        1: { name: "Lobby 1", url: "wss://1.territorial.io/s52/" },
        2: { name: "Lobby 2", url: "wss://4.territorial.io/s52/" },
        3: { name: "Lobby 3", url: "wss://5.territorial.io/s52/" },
        4: { name: "Lobby 4", url: "wss://territorial.io/s52/" }
    };

    let isConnecting = false;

    function connectToLobby(lobbyIndex) {
        if (isConnecting) return;
        isConnecting = true;

        try {
            // Проверяем, существует ли функция подключения
            if (typeof window.u === 'undefined' || !window.u.z || typeof window.u.z.a8L !== 'function') {
                throw new Error("Lobby connection function not found (u.z.a8L).");
            }

            // Вызываем функцию подключения
            window.u.z.a8L(lobbyIndex);
            
            return true;
        } catch (e) {
            console.error("[Elizzi Lobby] Connection error:", e);
            return false;
        } finally {
            // Сбрасываем флаг через секунду, чтобы можно было попробовать снова
            setTimeout(() => { isConnecting = false; }, 1000);
        }
    }

    // Экспорт в глобальную область
    window.ElizziLobby = {
        connect: function(index) {
            return connectToLobby(index);
        },
        getLobbies: function() {
            return LOBBIES;
        },
        getLobbyName: function(index) {
            return LOBBIES[index] ? LOBBIES[index].name : "Unknown";
        },
        get isConnecting() {
            return isConnecting;
        }
    };
})();
