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

sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
], function(Controller, JSONModel) {
    "use strict";
    return Controller.extend("yelton.controller.planning.planning", {

        onInit: function()
        {
            let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.getRoute("planning").attachPatternMatched(this.onRouterInit, this);
            oRouter.getRoute("planningShoppingList").attachPatternMatched(this.onRouterShoppingList, this);
        },

        onRouterInit: function(oEvent)
        {
            sap.ui.getCore().byId("__xmlview0--listMenuBottom").setSelectedItemById("__item6");
        },

        onRouterShoppingList: function(oEvent)
        {
            sap.ui.getCore().byId("__xmlview0--listMenuBottom").setSelectedItemById("__item6");

            let app = sap.ui.getCore().byId("__xmlview0--splitApp");
            if (!this._viewShoppingList) {
                this._viewShoppingList = sap.ui.view({
                    id: "pagePlanningShoppingList",
                    viewName: "yelton.view.planning.shoppingList",
                    type: sap.ui.core.mvc.ViewType.XML
                });
                app.addDetailPage(this._viewShoppingList);
                this._viewShoppingList._oRouter = sap.ui.core.UIComponent.getRouterFor(this); // ugly hack
            }

            let that = this;
            $.ajax({
                    url: "backend/web/services/planning.php",
                    type: "GET",
                    data: {
                        "productsWithPrices": null
                    }
                })
                .done(function(answer)
                {
                    that._viewShoppingList.setModel(new JSONModel(JSON.parse(answer)), "unselected");
                    that._viewShoppingList.setModel(new JSONModel([]), "selected");
                    app.toDetail("pagePlanningShoppingList", "show");
                })
                .fail(function(answer)
                {
                    if (answer.status === 401) {
                        window.location.reload();
                    }
                });
        },

        onTileShoppingListClick: function()
        {
            sap.ui.core.UIComponent.getRouterFor(this).navTo("planningShoppingList");
        },
    });
});
