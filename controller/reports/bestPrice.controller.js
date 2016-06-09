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
        return Controller.extend("yelton.controller.reports.bestPrice", {

            onNavBackPress: function()
            {
                var app = sap.ui.getCore().byId("__xmlview0--splitApp");
                app.backDetail();
            },

            onSuggest: function(event)
            {
                var value = event.getParameter("suggestValue");
                var filters = [];
                if (value) {
                    filters = [new sap.ui.model.Filter([
                        new sap.ui.model.Filter("name", function(sText) {
                            return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        }),
                        new sap.ui.model.Filter("categoryName", function(sDes) {
                            return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                        })
                    ], false)];
                }

                this.byId("searchField").getBinding("suggestionItems").filter(filters);
                this.byId("searchField").suggest();
            },

            onSearch: function(event)
            {
                var form = this.byId("formBestPrice");
                var item = event.getParameter("suggestionItem");
                if (item) {
                    var key = item.getKey().split(":");
                    var id = key[0];
                    var clientID = key[1];
                    var out = {
                        "id": id,
                        "clientID": clientID
                    };

                    var that = this;
                    $.ajax({
                            url: "backend/web/services/reports.php",
                            type: "GET",
                            data: {
                                "bestPrice": JSON.stringify(out)
                            }
                        })
                        .done(function(answer)
                        {
                            that.getView().setModel(new JSONModel(JSON.parse(answer)), "bestPrice");
                        })
                        .fail(function(answer)
                        {
                            if (answer.status === 401) {
                                window.location.reload();
                            }
                        })
                        .always(function()
                        {
                            form.setVisible(true);
                        });
                } else {
                    form.setVisible(false);
                }
            }
        });
    });
