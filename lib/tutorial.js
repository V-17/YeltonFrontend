/*
 * Copyright 2018 Yelton authors:
 * - Marat "Morion" Talipov
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


/*
 * Модуль обучалки.
 * Насколько это возможно - обособлен от всего остального, чтобы его нужно было только запускать без доп.действий.
 * Публичная функция всего одна - start. Вся остальная магия - внутри.
 * Основная суть: к каждому пункту меню появляется Popover с небольшим описанием, но внутрь каждого модуля уже не проваливаемся.
 * Думаю это можно будет добить позже, пока хотя бы основу сделать.
 */

sap.ui.define([
    "sap/ui/model/json/JSONModel",
    'yelton/lib/lib',
    'sap/m/Popover',
    'sap/m/Button',
    'sap/m/Text',
    'sap/m/Toolbar',
    'sap/m/ToolbarSpacer',
    'sap/m/Dialog'
], function(JSONModel, lib, Popover, Button, Text, Toolbar, ToolbarSpacer, Dialog) {
    "use strict";

    // к маршруту каждого модуля цепляем доп.обработчик, чтобы при необходимости показать tutorial
    let _oRouter = lib.getComponent().getRouter();
    _oRouter.getRoute("units").attachPatternMatched(_onRouter);
    _oRouter.getRoute("stores").attachPatternMatched(_onRouter);
    _oRouter.getRoute("categories").attachPatternMatched(_onRouter);
    _oRouter.getRoute("products").attachPatternMatched(_onRouter);
    _oRouter.getRoute("prices").attachPatternMatched(_onRouter);
    _oRouter.getRoute("reports").attachPatternMatched(_onRouter);
    _oRouter.getRoute("planning").attachPatternMatched(_onRouter);

    // Но чтобы определять, обычный это роутинг или для обучалки, используется sessionStorage
    const SESSION_STORAGE_KEY = 'lib.tutorial:inProgress';
    sessionStorage.removeItem(SESSION_STORAGE_KEY);

    /**
     * Вызывается каждый раз при роутинге
     * Отображает popover для текущего модуля
     */
    function _onRouter() {
        if (sessionStorage.getItem(SESSION_STORAGE_KEY)) {
            _oPopover.openBy(lib.getMainMenu().getSelectedItem());
            _oDataPopover.text = _oDataPopover.steps[_oDataPopover.currentStep].text;
            _oDataPopover.title = _oDataPopover.steps[_oDataPopover.currentStep].title;
            _oPopover.getModel().refresh();
        }
    }

    /**
     * След.шаг
     */
    function _next() {
        _oPopover.close();
        let oNextStep = _oDataPopover.steps[++_oDataPopover.currentStep];
        if (oNextStep) {
            _oRouter.navTo(oNextStep.name);
        } else {
            _stop();
        }
    }

    /**
     * Пред.шаг
     */
    function _prev() {
        _oRouter.navTo(
            _oDataPopover.steps[--_oDataPopover.currentStep].name
        );
    }

    /**
     * Завершить обучение
     */
    function _stop() {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        _oPopover.close();

        $.post({
            url: "backend/web/services/user.php",
            data: {
                "tutorialDone": null
            }
        });
    }

    let _oDataPopover = {
        text: null,
        steps: [{
            name: 'units',
            title: 'Меры',
            text: 'Для начала обратим внимание на разделение меню.\n\n' +
                'Верхняя часть, ее можно условно назвать "Основные данные":\n' +
                '- Покупки\n' +
                '- Категории\n' +
                '- Товары\n' +
                '- Магазины\n' +
                '- Меры\n' +
                'Мы будем постоянно наполнять основные данные покупками, товарами и проч.\n\n' +
                'Затем расположен блок, который условно можно назвать "Аналитика":\n' +
                '- Отчеты\n' +
                '- Планирование\n' +
                'Тут используется информация из Основных данных для построения аналитики\n\n' +

                'Знакомство начнем, пожалуй, с мер. Или можно сказать "Единицы измерения".\n' +
                'Литры, штуки, килограммы и т.п. - это все то, чем можно мерить. \n' +
                'Этот раздел мы будем посещать реже всего, т.к. эти вещи меняются не так часто'
        }, {
            name: 'stores',
            title: 'Магазины',
            text: 'Следующий раздел более посещаемый - Магазины.\n' +
                'Сюда мы будем заносить все интересующие нас магазины, аптеки, торговые точки и т.п.'
        }, {
            name: 'categories',
            title: 'Категории товаров',
            text: 'Все товары можно разделить на категории - молоко, фрукты, корм для кота, бытовая химия ...\n' +
                'Эта группировка позволяет проще ориентироваться во всем многообразии товаров, которое мы увидим на следующем шаге'
        }, {
            name: 'products',
            title: 'Товары',
            text: 'Теперь можно наполнять группы конкретными товарами.\n' +
                'Каждый товар можно отнести только к одной категории.\n' +
                'В качестве дополнительной информации можно указать производителя, штрих-код (будет полезен на Android-устройстве)'
        }, {
            name: 'prices',
            title: 'Покупки',
            text: 'Пожалуй, самый часто посещаемый раздел.\n\n' +
                'При добавлении покупки мы указываем Товар, Магазин, Дату, Количество и Стоимость.\n' +
                'История наших покупок будет служить основой для Аналитики'
        }, {
            name: 'reports',
            title: 'Отчеты',
            text: 'Просматривать историю покупок может быть интересно, но намного полезнее будет получить эту информацию в агрегированном и удобном виде.\n' +
                'Тут мы сможем найти лучшую цену, построить различные графики для товаров, магазинов и т.п.'
        }, {
            name: 'planning',
            title: 'Планирование',
            text: 'Планируем свои покупки.\n' +
                'Данный раздел поможет нам составить план предстоящих походов по магазинам'
        }], // позже нужно будет про премиум написать
        currentStep: null
    };

    let _oPopover = new Popover({
        title: '{/title}',
        placement: 'Right',
        modal: true,
        content: [new Text({
            text: '{/text}'
        }).addStyleClass('sapUiTinyMargin')],
        footer: new Toolbar({
            content: [
                // new Button({
                //     icon: 'sap-icon://decline',
                //     tooltip: 'Завершить обучение',
                //     press: _stop
                // }),
                new Button({
                    text: 'Назад',
                    press: _prev,
                    visible: '{= ${/currentStep} > 0 }'
                }),
                new ToolbarSpacer(),
                new Button({
                    text: "{= (${/currentStep} < ${/steps}.length-1) ? 'Далее' : 'Завершить' }",
                    press: _next,
                    type: 'Accept'
                })
            ]
        }),
    }).addStyleClass('sapUiSizeCompact');
    _oPopover.setModel(new JSONModel(_oDataPopover));

    /**
     * Диалог, который можно предварительно показать пользователю
     */
    let _oStartDialog = new Dialog({
        title: 'Обучение',
        type: 'Message',
        content: new Text({
            text: 'Добро пожаловать! Предлагаем просмотреть небольшой тур, который позволит ' +
                'Вам быстрее соорентироваться в сервисе Yelton и его возможностях'
        }),
        beginButton: new Button({
            text: 'Давайте!',
            type: 'Accept',
            press: function() {
                _oStartDialog.close();
                _oRouter.navTo('init'); // нужно перейти в начало, на случай если мы уже находимся в units. Иначе popover не появится
                _next();
            }
        }),
        endButton: new Button({
            text: 'Нет, спасибо',
            press: function() {
                _oStartDialog.close();
                _stop();
            }
        })
    });


    // public
    return {

        /**
         * Старт
         * @param  {[type]} options [description]
         * @return {[type]}         [description]
         */
        start: function(options) {
            sessionStorage.setItem(SESSION_STORAGE_KEY, true);

            _oDataPopover.currentStep = -1;
            if (options.showStartDialog) {
                _oStartDialog.open();
            } else {
                _oRouter.navTo('init'); // нужно перейти в начало, на случай если мы уже находимся в units. Иначе popover не появится
                _next();
            }
        }
    };
});
