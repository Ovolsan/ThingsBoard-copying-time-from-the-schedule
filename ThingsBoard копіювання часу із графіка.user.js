// ==UserScript==
// @name         ThingsBoard копіювання часу із графіка
// @namespace    http://tampermonkey.net/
// @version      20260722
// @author       Ovolya
// @description  Копіює дату й час на графіку під курсором лівою клавішею миші.
// @match        *://10.21.31.5:8080/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let mouseDownTime = 0; // Переменная для хранения времени нажатия

    // 1. Фиксируем время нажатия ЛКМ
    window.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        mouseDownTime = Date.now();
    }, true);

    // 2. Проверяем время при отпускании ЛКМ и копируем, если это был быстрый клик
    window.addEventListener('mouseup', function(e) {
        if (e.button !== 0) return;

        // Вычисляем разницу между отпусканием и нажатием кнопки
        const clickDuration = Date.now() - mouseDownTime;

        // Если удерживали меньше 200 мс
        if (clickDuration < 200) {
            const tooltip = document.getElementById('flot-series-tooltip');

            if (tooltip && tooltip.style.opacity !== '0' && tooltip.style.display !== 'none') {
                const timeElement = tooltip.querySelector('div:first-child');

                if (timeElement) {
                    const textToCopy = timeElement.innerText.trim();

                    const showSuccess = () => {
                        const originalBg = timeElement.style.backgroundColor || '';
                        timeElement.style.backgroundColor = 'rgba(76, 175, 80, 0.7)';
                        setTimeout(() => { timeElement.style.backgroundColor = originalBg; }, 300);
                        console.log(`Успешно скопировано (клик ${clickDuration}мс):`, textToCopy);
                    };

                    if (navigator.clipboard && window.isSecureContext) {
                        navigator.clipboard.writeText(textToCopy)
                            .then(showSuccess)
                            .catch(() => fallbackCopy(textToCopy, showSuccess));
                    } else {
                        fallbackCopy(textToCopy, showSuccess);
                    }
                }
            }
        }

        // Сбрасываем таймер для следующего клика
        mouseDownTime = 0;
    }, true);

    // Запасной метод копирования
    function fallbackCopy(text, successCallback) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";

        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                successCallback();
            } else {
                console.error('Запасной метод копирования тоже не сработал');
            }
        } catch (err) {
            console.error('Ошибка при копировании запасным методом', err);
        }

        document.body.removeChild(textArea);
    }
})();
