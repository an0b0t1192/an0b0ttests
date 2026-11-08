// elizzi-branding.js
// Кастомный текст над логотипом для Elizzi Client

(function() {
    'use strict';

    const CUSTOM_TEXT = "Elizzi Client. By Dr.Web. Version: 2.16.71e";
    const TEXT_COLOR = "rgb(255, 255, 255)";
    const FONT_SCALE = 0.55;
    const LEFT_OFFSET = 0.0;
    const TOP_OFFSET = 1.3;

    // Ждем, пока игра загрузит все переменные
    function initBranding() {
        // Проверяем наличие нужных переменных (они глобальные в indext.html)
        if (typeof window.xm === 'undefined' || !window.xm) {
            setTimeout(initBranding, 500); // Ждем еще полсекунды
            return;
        }

        // Защита от повторного наложения хука (если скрипт запустится дважды)
        if (window.xm._elizziHooked) return;
        window.xm._elizziHooked = true;

        let logoImg = null;
        try { 
            // ac.w8 - это функция загрузки картинки в игре
            logoImg = window.ac.w8 ? window.ac.w8(window.S[24]) : null; 
        } catch(e) {}
        
        if (!logoImg) {
            try { logoImg = window.ac.w8 ? window.ac.w8("territorial.io") : null; } catch(e) {}
        }
        if (!logoImg && typeof window.dQ !== 'undefined' && window.dQ && window.dQ.uR) {
            try { logoImg = window.dQ.uR("territorial.io"); } catch(e) {}
        }

        const origDrawImage = window.xm.drawImage.bind(window.xm);
        
        window.xm.drawImage = function(img) {
            const n = arguments.length;
            let r;
            if (n === 3) {
                r = origDrawImage(img, arguments[1], arguments[2]);
            } else if (n === 5) {
                r = origDrawImage(img, arguments[1], arguments[2], arguments[3], arguments[4]);
            } else if (n === 9) {
                r = origDrawImage(img, arguments[1], arguments[2], arguments[3], arguments[4],
                                  arguments[5], arguments[6], arguments[7], arguments[8]);
            } else {
                r = origDrawImage.apply(window.xm, arguments);
            }
            if (img === logoImg) {
                drawTextAbove();
            }
            return r;
        };

        function drawTextAbove() {
            try {
                const m = window.xm.getTransform();
                const scaleX = Math.sqrt(m.a * m.a + m.b * m.b);
                const scaleY = Math.sqrt(m.c * m.c + m.d * m.d);
                const logo = logoImg;
                if (!logo) return;

                const leftX = m.e;
                const topY = m.f;

                const fontSize = Math.max(8, Math.floor(logo.height * scaleY * FONT_SCALE));

                const textX = leftX - fontSize * LEFT_OFFSET;
                const textY = topY - fontSize * TOP_OFFSET;

                window.xm.save();
                window.xm.setTransform(1, 0, 0, 1, 0, 0);
                window.xm.font = "bold " + fontSize + "px 'Arial Black', system-ui, sans-serif";
                window.xm.textAlign = "left";
                window.xm.textBaseline = "middle";
                window.xm.fillStyle = TEXT_COLOR;
                window.xm.strokeStyle = "rgba(0,0,0,0.9)";
                window.xm.lineWidth = Math.max(2, fontSize / 8);
                window.xm.strokeText(CUSTOM_TEXT, textX, textY);
                window.xm.fillText(CUSTOM_TEXT, textX, textY);
                window.xm.restore();
            } catch(e) {
                console.error("drawTextAbove error:", e);
            }
        }
    }

    // Запускаем инициализацию
    initBranding();
})();