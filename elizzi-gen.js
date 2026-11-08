// elizzi-gen.js
// Полная логика генерации аккаунтов через WebSocket для Elizzi Client

(function() {
    'use strict';

    // Константы из твоего gen.js
    const WS_URL = 'wss://territorial.io/s52/';
    const BUILD_NUMBER_FILE = 'buildnumber.txt'; // В браузере мы не можем читать файл, поэтому хардкодим или берем из игры
    
    // Если buildNumber не задан, попробуем достать его из глобальной переменной игры (если она есть)
    let buildNumber = 1766; 
    try {
        if (window.c8 && window.c8.a70) {
            // Пытаемся вытащить номер билда из объекта игры, если он там есть
            // (Это может отличаться в зависимости от обфускации)
        }
    } catch(e) {}

    // ==========================================
    // 1. КЛАССЫ ДЛЯ РАБОТЫ С БИТАМИ (из gen.js)
    // ==========================================
    class DataWrapper {
        constructor() { this.size = 0; this.bitPosition = 0; this.buffer = null; }
        init(buffer) { this.bitPosition = 0; this.buffer = buffer; this.size = buffer.length; }
        allocateAndInitialize(totalBits) { this.init(new Uint8Array((totalBits + 7) >> 3)); return this.buffer; }
        writeBits(bitCount, value) {
            const end = this.bitPosition + bitCount - 1;
            for (let i = this.bitPosition; i <= end; i++) {
                this.buffer[i >> 3] |= ((value >> (end - i)) & 1) << (7 - (i & 7));
            }
            this.bitPosition += bitCount;
        }
    }

    class BitStreamReader {
        init(buffer) { this.buffer = buffer; this.size = buffer.length; this.bitPosition = 0; }
        readBits(size) {
            let value = 0;
            const end = this.bitPosition + size - 1;
            for (let i = this.bitPosition; i <= end; i++) {
                value |= ((this.buffer[i >> 3] >> (7 - (i & 7))) & 1) << (end - i);
            }
            this.bitPosition += size;
            return value;
        }
    }

    // ==========================================
    // 2. ГЕНЕРАТОР ХЭШЕЙ ДЛЯ ЧЕЛЛЕНДЖЕЙ (из gen.js)
    // ==========================================
    class HashGenerator {
        constructor() { this.BUFFER_SIZE = 256; }

        generateHash(seedA, seedB) {
            const buffer = new Uint8Array(this.BUFFER_SIZE);
            let prngX = 3 + (4 + seedA) % 32768, prngY = 12 + seedB % 32768;
            let prngZ = 17 + ((seedA & seedB) + (seedA | seedB) + seedA) % 32768;
            for (let i = 0; i < this.BUFFER_SIZE; i++) { prngX = 1 + (prngX * prngY) % prngZ; buffer[i] = prngX % 256; }
            for (let i = 0; i < this.BUFFER_SIZE; i++) {
                buffer[i] = (buffer[i] + ((seedA >> ((i + 2) % 30)) & 1)) % 256;
                buffer[i] = (buffer[i] + ((seedB >> ((i + 7) % 30)) & 1)) % 256;
            }
            let pos = 0;
            for (let i = 0; i < 30000; i++) {
                let temp = buffer[pos];
                buffer[pos] = (temp + i + buffer[(pos + i) % 256]) % 256;
                pos = (temp + i + pos + (temp & pos)) % 256;
            }
            let h1 = 1, h2 = 1;
            for (let i = 0; i < this.BUFFER_SIZE; i += 2) {
                h1 = ((1 + h1) * (buffer[i] + 1)) % 1073741824;
                h2 = ((1 + h2) * (buffer[i + 1] + 1)) % 1073741824;
            }
            return [h1, h2];
        }

        bruteForceFindPreimage(bitLength, seedA, seedB, targetHash) {
            const max = 1 << bitLength;
            for (let i = 0; i < max; i++) {
                if (this.computeMixedHash(i, seedA, seedB) === targetHash) return i;
            }
            return 0;
        }

        computeMixedHash(inputValue, seedA, seedB) {
            let tempL = seedA + inputValue, tempU = seedB + inputValue;
            let hash = (tempL + tempU) & 2147483647;
            for (let i = 1; i <= 16; i++) {
                hash ^= hash >> i; hash >>>= 1 + (tempL & 3);
                hash = (hash * (7 + ((tempL | tempU) & 1023))) & 1073741823;
                hash += (tempU & 65535); tempL >>= 1 + (hash & 1); tempU >>= 1 + (tempL & 1);
            }
            return hash & 1073741823;
        }
    }

    // Таблицы Base64 для парсинга ников
    const reverseTable = new Array(64).fill('-');
    reverseTable[0] = '-';
    for (let i = 0; i < 10; i++) reverseTable[i + 1] = String.fromCharCode(48 + i);
    for (let i = 0; i < 26; i++) reverseTable[i + 11] = String.fromCharCode(65 + i);
    for (let i = 0; i < 26; i++) reverseTable[i + 38] = String.fromCharCode(97 + i);
    reverseTable[37] = '_';

    function decodeFixedString(reader, length) {
        let result = '';
        for (let i = 0; i < length; i++) result += reverseTable[reader.readBits(6)] || '?';
        return result;
    }

    // ==========================================
    // 3. СБОРКА ПАКЕТОВ
    // ==========================================
    function buildInitPacket() {
        const dw = new DataWrapper();
        dw.allocateAndInitialize(1 + 6 + (14 + 4 + 7 + 1 + 1 + 5 + 2 * 8) + (15 * 6 + 14 + 7 + 12));
        dw.writeBits(1, 0);
        dw.writeBits(6, 13); // Opcode 13: Init
        dw.writeBits(14, buildNumber);
        dw.writeBits(4, 0); // platform.id
        dw.writeBits(7, 0); // platform.version
        dw.writeBits(1, 0); // isNotTerritorialDomain (false)
        dw.writeBits(1, 0); // isInIframe (false)
        dw.writeBits(5, new Date().getHours() % 24);
        dw.writeBits(8, 0);
        dw.writeBits(8, 0);
        
        // Токен (пустой) и хэши
        for(let i=0; i<15; i++) dw.writeBits(6, 0); // Пустой токен
        dw.writeBits(14, 9819); // fontCheck
        dw.writeBits(7, 52);    // timezoneCheck
        dw.writeBits(12, 650);  // screenCheck
        return dw.buffer;
    }

    function buildChallengeResponse(challengeResponse, eventType) {
        const dw = new DataWrapper();
        dw.allocateAndInitialize(1 + 6 + 3 + 30 + 30);
        dw.writeBits(1, 0);
        dw.writeBits(6, 30);
        dw.writeBits(3, eventType);
        dw.writeBits(30, challengeResponse);
        dw.writeBits(30, 0);
        return dw.buffer;
    }

    // ==========================================
    // 4. ОСНОВНАЯ ФУНКЦИЯ ГЕНЕРАЦИИ (WebSocket)
    // ==========================================
    window.elizziGenerateAccount = function() {
        return new Promise((resolve, reject) => {
            let ws;
            let timeout;
            let isResolved = false;

            const cleanup = () => {
                if (timeout) clearTimeout(timeout);
                if (ws && ws.readyState === WebSocket.OPEN) ws.close();
            };

            try {
                ws = new WebSocket(WS_URL);
                ws.binaryType = "arraybuffer";

                // Таймаут, чтобы не висеть вечно
                timeout = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        cleanup();
                        reject(new Error("Timeout (no response)"));
                    }
                }, 15000);

                ws.onopen = () => {
                    ws.send(buildInitPacket());
                };

                ws.onmessage = (event) => {
                    try {
                        const bytes = new Uint8Array(event.data);
                        const reader = new BitStreamReader();
                        reader.init(bytes);
                        reader.readBits(1);
                        const opcode = reader.readBits(6);

                        // Челлендж
                        if (opcode === 9 || opcode === 20) {
                            const eventType = reader.readBits(3);
                            const difficultyBits = reader.readBits(5);
                            const seedA = reader.readBits(30);
                            const seedB = reader.readBits(30);
                            const targetHash = reader.readBits(30);

                            const hashGen = new HashGenerator();
                            const solution = hashGen.bruteForceFindPreimage(difficultyBits, seedA, seedB, targetHash);

                            ws.send(buildChallengeResponse(solution, eventType));
                            
                            // Если это челлендж 20, то после ответа нужно отправить 0x1e 0x00 (как в твоем gen.js)
                            if (opcode === 20) {
                                // ws.send(new Uint8Array([0x1e, 0x00]));
                            } else {
                                ws.send(new Uint8Array([0x1e, 0x00]));
                            }
                        }

                        // Успешная генерация (Opcode 10)
                        if (opcode === 10) {
                            if (isResolved) return;
                            isResolved = true;
                            cleanup();

                            const r = new BitStreamReader();
                            r.init(bytes);
                            r.readBits(1); r.readBits(6);
                            
                            const username = decodeFixedString(r, 5);
                            const password = decodeFixedString(r, 15);

                            resolve({ username, password });
                        }
                    } catch (e) {
                        if (!isResolved) {
                            isResolved = true;
                            cleanup();
                            reject(e);
                        }
                    }
                };

                ws.onerror = (err) => {
                    if (!isResolved) {
                        isResolved = true;
                        cleanup();
                        reject(new Error("WebSocket Error"));
                    }
                };

                ws.onclose = (event) => {
                    if (!isResolved) {
                        isResolved = true;
                        cleanup();
                        // Игнорируем ошибку "socket hang up", если мы уже получили данные
                        if (event.code !== 1000 && event.code !== 1005) {
                            reject(new Error(`Closed: ${event.code}`));
                        }
                    }
                };

            } catch (e) {
                if (!isResolved) {
                    isResolved = true;
                    cleanup();
                    reject(e);
                }
            }
        });
    };
})();