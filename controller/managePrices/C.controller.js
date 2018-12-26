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
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    'yelton/lib/lib',
    './editDialog',
    './deleteDialog',
    './filterDialog'
], function(Controller, JSONModel, Filter, FilterOperator, lib, editDialog, deleteDialog, filterDialog) {
    "use strict";
    return Controller.extend("yelton.controller.managePrices.C", {
        editDialog: editDialog,
        deleteDialog: deleteDialog,
        filterDialog: filterDialog,

        onInit: function()
        {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("filterProductAndStore").attachPatternMatched(this.onRouterFilterProductAndStore, this);
        },

        onRouterFilterProductAndStore: function(oEvent)
        {
            this.onRouter(oEvent);
            filterDialog.onRouterFilterProductAndStore.apply(this, [oEvent]);
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
