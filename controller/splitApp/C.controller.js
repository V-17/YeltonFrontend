/*
 * Copyright 2016 - 2018 Yelton authors:
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

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    'sap/m/StandardListItem',
    'sap/m/GroupHeaderListItem',
    'yelton/controller/splitApp/settingsPopover',
    'yelton/lib/dict',
    'yelton/lib/lib'
], function(Controller, JSONModel, StandardListItem, GroupHeaderListItem, settings, dict, lib) {
    "use strict";

    const _mainMenuModel = new JSONModel();
    _mainMenuModel.loadData('controller/splitApp/mainMenu.json', null, false);

    function _selectItem(oEvent) {
        let sName = oEvent.getParameters().name;
        if (sName === 'init') sName = 'prices'; // замена
        _mainMenuModel.getData().forEach(function(item) {
            item.selected = (item.key === sName);
        });
        _mainMenuModel.refresh();
    }

    return Controller.extend("yelton.controller.splitApp.C", {
        settings: settings,

        onInit: function() {
            this.getView().setModel(_mainMenuModel, 'mainMenu');

            dict
                .refreshPrices()
                .refreshCategories()
                .refreshProducts()
                .refreshStores()
                .refreshUnits();

            // при роутинге выбираем нужный пункт меню
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("init").attachPatternMatched(_selectItem, this);
            oRouter.getRoute("prices").attachPatternMatched(_selectItem, this);
            oRouter.getRoute("categories").attachPatternMatched(_selectItem, this);
            oRouter.getRoute("products").attachPatternMatched(_selectItem, this);
            oRouter.getRoute("stores").attachPatternMatched(_selectItem, this);
            oRouter.getRoute("units").attachPatternMatched(_selectItem, this);
            oRouter.getRoute("reports").attachPatternMatched(_selectItem, this);
            oRouter.getRoute("planning").attachPatternMatched(_selectItem, this);
        },

        onNavTo: function(oEvent) {
            sap.ui.core.UIComponent.getRouterFor(this).navTo(
                oEvent.getParameters().listItem.getBindingContext('mainMenu').getObject().key
            );
        },

        onSettingsButtonPress: function() {
            settings.showPopover.apply(this);
        },

        /**
         * Фабрика для таблиц: tableRow, tableCol
         */
        mainMenuFactory: function(sId, oContext) {
            let out;
            switch (oContext.getObject().type) {
                case 'top':
                case 'bottom':
                    out = new StandardListItem({
                        title: '{mainMenu>name}',
                        type: 'Active',
                        icon: '{mainMenu>icon}',
                        selected: '{mainMenu>selected}'
                    });
                    break;
                case 'separator':
                    out = new GroupHeaderListItem().addStyleClass('sapUiSizeCompact');
                    break;
            }
            return out;
        },
    });
});
