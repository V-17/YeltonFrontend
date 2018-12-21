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
    'yelton/controller/splitApp/settingsPopover',
    'yelton/lib/dict',
    'yelton/lib/lib'
], function(Controller, JSONModel, settings, dict, lib) {
    "use strict";
    return Controller.extend("yelton.controller.splitApp.C", {
        settings: settings,

        onInit: function()
        {
            dict
                .refreshPrices()
                .refreshCategories()
                .refreshProducts()
                .refreshStores()
                .refreshUnits();
        },

        onNavToDetail: function(oEvent)
        {
            let id = this.getView().byId("listMainMenu").getSelectedItem().sId;
            lib.getMainMenu().bottom.removeSelections();
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);

            //FIXME: можно же как то с нормальными ID сделать это
            switch (id) {
                case "__item0":
                    oRouter.navTo("prices");
                    break;
                case "__item1":
                    oRouter.navTo("categories");
                    break;
                case "__item2":
                    oRouter.navTo("products");
                    break;
                case "__item3":
                    oRouter.navTo("stores");
                    break;
                case "__item4":
                    oRouter.navTo("units");
                    break;
            }
        },

        onNavToReports: function()
        {
            //FIXME: можно же как то с нормальными ID сделать это
            let id = this.getView().byId("listMenuBottom").getSelectedItem().sId;
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            this.getView().byId("listMainMenu").removeSelections();

            switch (id) {
                case "__item5":
                    oRouter.navTo("reports");
                    break;
                case "__item6":
                    oRouter.navTo("planning");
                    break;
            }
        },

        onSettingsButtonPress: function()
        {
            settings.showPopover.apply(this);
        },
    });
});
