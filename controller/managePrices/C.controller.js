/*
 * Copyright 2016 Yelton authors:
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

jQuery.sap.require("yelton.controller.managePrices.editDialog");
jQuery.sap.require("yelton.controller.managePrices.deleteDialog");
jQuery.sap.require("yelton.controller.managePrices.filterDialog");

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function(Controller, JSONModel, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("yelton.controller.managePrices.C", {

            onInit: function()
            {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("init").attachPatternMatched(this.onRouter, this);
                oRouter.getRoute("prices").attachPatternMatched(this.onRouter, this);
                oRouter.getRoute("filterProductAndStore").attachPatternMatched(this.onRouterFilterProductAndStore, this);
            },

            onRouter: function(oEvent)
            {
                // FIXME: id
                sap.ui.getCore().byId("__xmlview0--listMainMenu").setSelectedItemById("__item0");
            },

            onRouterFilterProductAndStore: function(oEvent)
            {
                this.onRouter();
                pricesFilterDialog.onRouterFilterProductAndStore.apply(this, [oEvent]);
            },

            // Поиск
            onFilterLiveSearch: function(oEvent)
            {
                let sQuery = oEvent.getParameter("newValue");
                let table = this.getView().byId("tablePrices");
                table.getBinding("items").filter(
                    new Filter([
                        new Filter("productName", FilterOperator.Contains, sQuery),
                        new Filter("categoryName", FilterOperator.Contains, sQuery),
                        new Filter("storeName", FilterOperator.Contains, sQuery),
                        new Filter("date", FilterOperator.Contains, sQuery),
                        new Filter("price", FilterOperator.EQ, sQuery),
                        new Filter("amount", FilterOperator.EQ, sQuery),
                    ])
                );
            }
        });
    });
