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
        "sap/ui/model/json/JSONModel"
    ],
    function(Controller, JSONModel) {
        "use strict";
        return Controller.extend("controller.splitApp", {

            onInit: function()
            {
                var pricesView = sap.ui.view({
                    id: "pageManagePrices",
                    viewName: "view.managePrices.V",
                    type: sap.ui.core.mvc.ViewType.XML
                });
                var categoriesView = sap.ui.view({
                    id: "pageManageCategories",
                    viewName: "view.manageCategories.V",
                    type: sap.ui.core.mvc.ViewType.XML
                });
                var productsView = sap.ui.view({
                    id: "pageManageProducts",
                    viewName: "view.manageProducts.V",
                    type: sap.ui.core.mvc.ViewType.XML
                });
                var storesView = sap.ui.view({
                    id: "pageManageStores",
                    viewName: "view.manageStores.V",
                    type: sap.ui.core.mvc.ViewType.XML
                });
                var unitsView = sap.ui.view({
                    id: "pageManageUnits",
                    viewName: "view.manageUnits.V",
                    type: sap.ui.core.mvc.ViewType.XML
                });

                var app = this.byId("splitApp");
                app.addDetailPage(pricesView);
                app.addDetailPage(categoriesView);
                app.addDetailPage(productsView);
                app.addDetailPage(storesView);
                app.addDetailPage(unitsView);
                
                this.getView().setModel(new JSONModel("backend/web/services/user.php"), "user");
            },

            onNavToDetail: function()
            {
                //FIXME: можно же как то с реальными ID сделать это
                var id = this.getView().byId("listMainMenu").getSelectedItem().sId;
                var app = this.byId("splitApp");

                switch (id) {
                    case "__item0":
                        app.getDetailPage("pageManagePrices").getModel().loadData("backend/web/services/managePrices.php");
                        app.toDetail("pageManagePrices", "show");
                        break;
                    case "__item1":
                        app.getDetailPage("pageManageCategories").getModel().loadData(
                            "backend/web/services/manageCategories.php");
                        app.toDetail("pageManageCategories", "show");
                        break;
                    case "__item2":
                        app.getDetailPage("pageManageProducts").getModel().loadData(
                            "backend/web/services/manageProducts.php");
                        app.toDetail("pageManageProducts", "show");
                        break;
                    case "__item3":
                        app.getDetailPage("pageManageStores").getModel().loadData("backend/web/services/manageStores.php");
                        app.toDetail("pageManageStores", "show");
                        break;
                    case "__item4":
                        app.getDetailPage("pageManageUnits").getModel().loadData("backend/web/services/manageUnits.php");
                        app.toDetail("pageManageUnits", "show");
                        break;
                }
            }
        });
    });
