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
    return Controller.extend("yelton.controller.manageProducts.C", {
        editDialog: editDialog,
        deleteDialog: deleteDialog,

        onInit: function()
        {
        },


        // Поиск
        onFilterLiveSearch: function(oEvent)
        {
            let sQuery = oEvent.getParameter("newValue");
            let table = this.getView().byId("listProducts");
            table.getBinding("items").filter(
                new Filter([
                    new Filter("name", FilterOperator.Contains, sQuery),
                    new Filter("categoryName", FilterOperator.Contains, sQuery)
                ])
            );
        },

        /**
         * При любом изменении значения поля, сбрасываем ему valueState
         */
        _onInputNameLiveChange: function()
        {
            sap.ui.getCore().byId("inputName").setValueState("None");
        }
    });
});
