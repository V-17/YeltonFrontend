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

jQuery.sap.require("yelton.controller.manageStores.editDialog");
jQuery.sap.require("yelton.controller.manageStores.deleteDialog");

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function(Controller, JSONModel, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("yelton.controller.manageStores.C", {

            onInit: function()
            {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("stores").attachPatternMatched(this.onRouter, this);
            },

            onRouter: function(oEvent)
            {
                // FIXME: id
                sap.ui.getCore().byId("__xmlview0--listMainMenu").setSelectedItemById("__item3");
            },

            // Поиск
            onFilterLiveSearch: function(oEvent)
            {
                let sQuery = oEvent.getParameter("newValue");
                let table = this.getView().byId("listStores");
                table.getBinding("items").filter(
                    new Filter("name", FilterOperator.Contains, sQuery)
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
