define(["require", "exports", "OK/cookie", "OK/logger"], function (require, exports, cookie_1, logger) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.detect = void 0;
    var TIMEOUT = 4000;
    var COOKIE_NAME = 'abw';
    var LOGGER_KEY = 'abp-wl';
    function load(ch) {
        return new Promise(function (resolve, reject) {
            // @see https://jira.odkl.ru/browse/ADMONEY-54
            var script = document.createElement('script');
            script.src = 'https://limg.imgsmail.ru/informers/abp/px.js?ch=' + ch;
            script.onload = function () {
                resolve();
                logger.success(LOGGER_KEY, ("ch-" + ch + ".load"));
            };
            script.onerror = function () {
                reject();
                logger.success(LOGGER_KEY, ("ch-" + ch + ".error"));
            };
            document.head.appendChild(script);
        });
    }
    window['abp'] = window['abp'] || false;
    var result = new Promise(function (resolve, reject) {
        // Даём 4 секунды на то, чтобы всё это добро отработало. Не успело - считаем, что мы не в белом списке
        setTimeout(reject, TIMEOUT);
        var error = false;
        // делаем тестовый запрос
        load(1)
            .catch(function (e) {
            // ошибка, значит что-то пошло не так - считаем, что ABP не распознан
            error = true;
            throw e;
        })
            .then(function () {
            // предыдущий запрос прошёл корректно - тестируем с новым параметром
            return load(2);
        })
            .then(reject, // если запрос был успешен - точно не белый список
        function () {
            // ошибка... возможно, мы в белом списке
            if (error || !window['abp']) {
                // если попали сюда - считаем, что белый список адблока не распознан
                reject();
            }
            else {
                // ура! мы в белом списке
                resolve();
            }
        });
    });
    result.then(function () {
        cookie_1.setCookie(COOKIE_NAME, '1', 30, '/');
        logger.success(LOGGER_KEY, 'yes');
    }, function () {
        cookie_1.clearCookie(COOKIE_NAME, '/');
        logger.success(LOGGER_KEY, 'no');
    });
    function testAdGuard() {
        // ok.ru##.anonym_login_w+div.prl_txt
        var bait1 = createBait();
        bait1.className = 'anonym_login_w';
        var bait2 = createBait();
        bait2.className = 'prl_txt';
        document.body.appendChild(bait1);
        document.body.appendChild(bait2);
        var style = window.getComputedStyle(bait2);
        var result = false;
        if (style.display !== 'block') {
            result = true;
        }
        document.body.removeChild(bait1);
        document.body.removeChild(bait2);
        return result;
    }
    function createBait() {
        var bait = document.createElement('div');
        bait.style.display = 'block';
        bait.style.position = 'absolute';
        bait.style.left = '0';
        bait.style.top = '0';
        bait.style.zIndex = '10000';
        return bait;
    }
    function test(cls, isId) {
        if ( isId === void 0 ) isId = false;

        var bait = createBait();
        if (isId) {
            bait.id = cls;
        }
        else {
            bait.className = cls;
        }
        document.body.appendChild(bait);
        var style = window.getComputedStyle(bait);
        var result = false;
        if (style.display !== 'block') {
            result = true;
        }
        document.body.removeChild(bait);
        return result;
    }
    function detectV2() {
        if (test('wx475odopki742ifq')) {
            logger.success(LOGGER_KEY, 'v2-wl-yes');
        }
        else {
            logger.success(LOGGER_KEY, 'v2-wl-no');
        }
        if (test('hook_Block_TargetBanner', true)) {
            logger.success(LOGGER_KEY, 'v2-abp-yes');
        }
        else {
            logger.success(LOGGER_KEY, 'v2-abp-no');
        }
        if (testAdGuard()) {
            logger.success(LOGGER_KEY, 'v2-adguard-yes');
        }
        else {
            logger.success(LOGGER_KEY, 'v2-adguard-no');
        }
    }
    setTimeout(function () {
        try {
            detectV2();
        }
        catch (e) {
            logger.success(LOGGER_KEY, 'v2-error');
        }
    }, 0);
    function detect() {
        return result;
    }
    exports.detect = detect;
});