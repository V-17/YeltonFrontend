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
    ],
    function(Controller, JSONModel) {
        "use strict";
        return Controller.extend("yelton.controller.reports.reports", {

            onInit: function()
            {
                let oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("reports").attachPatternMatched(this.onRouter, this);
            },

            onRouter: function(oEvent)
            {
                sap.ui.getCore().byId("__xmlview0--listMenuBottom").setSelectedItemById("__item5");
            },

            onTileBestPriceClick: function()
            {
                let app = sap.ui.getCore().byId("__xmlview0--splitApp");
                if (!this._viewBestPrice) {
                    this._viewBestPrice = sap.ui.view({
                        id: "pageReportsBestPrice",
                        viewName: "yelton.view.reports.bestPrice",
                        type: sap.ui.core.mvc.ViewType.XML
                    });
                    app.addDetailPage(this._viewBestPrice);
                }

                let that = this;
                $.ajax({
                        url: "backend/web/services/reports.php",
                        type: "GET",
                        data: {
                            "productsWithPrices": null
                        }
                    })
                    .done(function(answer)
                    {
                        that._viewBestPrice.setModel(new JSONModel(JSON.parse(answer)), "products");
                        app.toDetail("pageReportsBestPrice", "show");
                    })
                    .fail(function(answer)
                    {
                        if (answer.status === 401) {
                            window.location.reload();
                        }
                    });
            },

            onTileProductLineChartClick: function()
            {
                let app = sap.ui.getCore().byId("__xmlview0--splitApp");
                if (!this._viewProductLineChart) {
                    this._viewProductLineChart = sap.ui.view({
                        id: "pageReportsProductLineChart",
                        viewName: "yelton.view.reports.productLineChart",
                        type: sap.ui.core.mvc.ViewType.XML
                    });
                    app.addDetailPage(this._viewProductLineChart);
                }

                let that = this;
                $.ajax({
                        url: "backend/web/services/reports.php",
                        type: "GET",
                        data: {
                            "productsWithPrices": null
                        }
                    })
                    .done(function(answer)
                    {
                        that._viewProductLineChart.setModel(new JSONModel(JSON.parse(answer)), "products");
                        app.toDetail("pageReportsProductLineChart", "show");
                    })
                    .fail(function(answer)
                    {
                        if (answer.status === 401) {
                            window.location.reload();
                        }
                    });
            }
        });
    });
