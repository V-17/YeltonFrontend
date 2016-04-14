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
                var reportsView = sap.ui.view({
                    id: "pageReports",
                    viewName: "view.reports.V",
                    type: sap.ui.core.mvc.ViewType.XML
                });

                var app = this.byId("splitApp");
                app.addDetailPage(pricesView);
                app.addDetailPage(categoriesView);
                app.addDetailPage(productsView);
                app.addDetailPage(storesView);
                app.addDetailPage(unitsView);
                app.addDetailPage(reportsView);

                var that = this;
                $.ajax({
                        url: "backend/web/services/user.php"
                    })
                    .done(function(answer) {
                        that.getView().setModel(new JSONModel(JSON.parse(answer)), "user");
                    })
                    .fail(function(answer) {
                        if (answer.status === 401) {
                            window.location.reload();
                        }
                    });
            },

            onNavToDetail: function()
            {
                //FIXME: можно же как то с реальными ID сделать это
                var id = this.getView().byId("listMainMenu").getSelectedItem().sId;
                var app = this.byId("splitApp");
                this.getView().byId("listMenuBottom").removeSelections();

                switch (id) {
                    case "__item0":
                        $.ajax({
                                url: "backend/web/services/managePrices.php"
                            })
                            .done(function(answer) {
                                app.getDetailPage("pageManagePrices").getModel().setData(JSON.parse(answer));
                                app.toDetail("pageManagePrices", "show");
                            })
                            .fail(function(answer) {
                                if (answer.status === 401) {
                                    window.location.reload();
                                }
                            });
                        break;
                    case "__item1":
                        $.ajax({
                                url: "backend/web/services/manageCategories.php"
                            })
                            .done(function(answer) {
                                app.getDetailPage("pageManageCategories").getModel().setData(JSON.parse(answer));
                                app.toDetail("pageManageCategories", "show");
                            })
                            .fail(function(answer) {
                                if (answer.status === 401) {
                                    window.location.reload();
                                }
                            });
                        break;
                    case "__item2":
                        $.ajax({
                                url: "backend/web/services/manageProducts.php"
                            })
                            .done(function(answer) {
                                app.getDetailPage("pageManageProducts").getModel().setData(JSON.parse(answer));
                                app.toDetail("pageManageProducts", "show");
                            })
                            .fail(function(answer) {
                                if (answer.status === 401) {
                                    window.location.reload();
                                }
                            });
                        break;
                    case "__item3":
                        $.ajax({
                                url: "backend/web/services/manageStores.php"
                            })
                            .done(function(answer) {
                                app.getDetailPage("pageManageStores").getModel().setData(JSON.parse(answer));
                                app.toDetail("pageManageStores", "show");
                            })
                            .fail(function(answer) {
                                if (answer.status === 401) {
                                    window.location.reload();
                                }
                            });
                        break;
                    case "__item4":
                        $.ajax({
                                url: "backend/web/services/manageUnits.php"
                            })
                            .done(function(answer) {
                                app.getDetailPage("pageManageUnits").getModel().setData(JSON.parse(answer));
                                app.toDetail("pageManageUnits", "show");
                            })
                            .fail(function(answer) {
                                if (answer.status === 401) {
                                    window.location.reload();
                                }
                            });
                        break;
                }
            },

            onNavToReports: function()
            {
                //FIXME: можно же как то с реальными ID сделать это
                var id = this.getView().byId("listMenuBottom").getSelectedItem().sId;
                var app = this.byId("splitApp");
                this.getView().byId("listMainMenu").removeSelections();

                switch (id) {
                    case "__item5":
                        app.toDetail("pageReports", "show");
                        break;
                }
            }
        });
    });
