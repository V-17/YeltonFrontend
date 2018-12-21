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
    'yelton/lib/lib'
], function(Controller, JSONModel, Filter, lib) {
    "use strict";
    return Controller.extend("yelton.controller.reports.productLineChart", {

        onNavBackPress: function()
        {
            let app = lib.getSplitApp();
            app.backDetail();
        },

        onSuggest: function(event)
        {
            let value = event.getParameter("suggestValue");
            let filters = [];
            if (value) {
                filters = [new Filter([
                    new Filter("name", function(sText) {
                        return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                    }),
                    new Filter("categoryName", function(sDes) {
                        return (sDes || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                    })
                ], false)];
            }

            this.byId("searchField").getBinding("suggestionItems").filter(filters);
            this.byId("searchField").suggest();
        },

        onSearch: function(event)
        {
            let chart = this.getView().byId("chart");
            let item = event.getParameter("suggestionItem");

            if (item) {
                let key = item.getKey().split(":");
                let id = key[0];
                let clientID = key[1];
                let out = {
                    "id": id,
                    "clientID": clientID
                };

                let that = this;
                $.ajax({
                    url: "backend/web/services/reports.php",
                    type: "GET",
                    data: {
                        "productDynamics": JSON.stringify(out)
                    }
                }).done(function(answer) {
                    answer = JSON.parse(answer);

                    let aLabels = [];
                    let aData = [];
                    for (item of answer) {
                        let oDate = new Date(item.date * 1000);
                        let sYear = (oDate.getFullYear() + "").substring(2, 4);
                        let sDay = ("0" + oDate.getDate()).slice(-2);
                        let sMonth = ("0" + (oDate.getMonth() + 1)).slice(-2);
                        aLabels.push(sDay + "." + sMonth + "." + sYear);
                        aData.push(item.price);
                    }

                    chart.setVisible(true);
                    chart.setLabels(aLabels);
                    chart.setLine({
                        //label: "Магнит", В будущем когда буду строить для разных магазинов, будет полезно
                        data: aData
                    });
                }).fail(function(answer) {
                    if (answer.status === 401) {
                        window.location.reload();
                    }
                });
            } else {
                chart.setVisible(false);
            }
        }
    });
});
