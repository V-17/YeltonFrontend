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
    './deleteDialog'
], function(Controller, JSONModel, Filter, FilterOperator, lib, editDialog, deleteDialog) {
    "use strict";
    return Controller.extend("yelton.controller.manageUnits.C", {
        editDialog: editDialog,
        deleteDialog: deleteDialog,

        onInit: function()
        {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("units").attachPatternMatched(this.onRouter, this);
        },

        onRouter: function(oEvent)
        {
            // FIXME: id
            lib.getMainMenu().top.setSelectedItemById("__item4");
        },

        // Поиск
        onFilterLiveSearch: function(oEvent)
        {
            let sQuery = oEvent.getParameter("newValue");
            let table = this.getView().byId("listUnits");
            table.getBinding("items").filter(
                new Filter([
                    new Filter("fullName", FilterOperator.Contains, sQuery),
                    new Filter("shortName", FilterOperator.Contains, sQuery)
                ])
            );
        },

        /**
         * При любом изменении значения поля, сбрасываем ему valueState
         */
        _onInputFullNameLiveChange: function()
        {
            sap.ui.getCore().byId("inputFullName").setValueState("None");
        },

        /**
         * При любом изменении значения поля, сбрасываем ему valueState
         */
        _onInputShortNameLiveChange: function()
        {
            sap.ui.getCore().byId("inputShortName").setValueState("None");
        }
    });
});
