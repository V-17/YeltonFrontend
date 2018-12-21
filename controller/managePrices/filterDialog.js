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
    'sap/ui/model/json/JSONModel',
    'sap/ui/model/Filter',
    'sap/ui/model/FilterOperator',
    'yelton/lib/dict'
], function(JSONModel, Filter, FilterOperator, dict) {
    "use strict";
    return {
        show: function() {
            this._oFilterDialog = sap.ui.xmlfragment("filterDialog", "yelton.view.managePrices.filterDialog", this);
            this.getView().addDependent(this._oFilterDialog);

            let currentFilters = this.byId("tablePrices").getBinding("items").aFilters;
            let that = this;

            currentFilters.forEach(function(item, i, arr) {
                switch (item.sPath) {
                    case "productID":
                        sap.ui.core.Fragment.byId("filterDialog", "searchFieldProduct").setValue(that._filterProductName);
                        break;
                    case "categoryID":
                        sap.ui.core.Fragment.byId("filterDialog", "searchFieldCategory").setValue(that._filterCategoryName);
                        break;
                    case "storeID":
                        sap.ui.core.Fragment.byId("filterDialog", "searchFieldStore").setValue(that._filterStoreName);
                        break;
                }
            });

            // загружаем список товаров (у которых есть хотя бы 1 покупка)
            $.ajax({
                url: "backend/web/services/reports.php",
                type: "GET",
                data: {
                    "productsWithPrices": null
                }
            }).done(function(answer) {
                that._oFilterDialog.setModel(new JSONModel(JSON.parse(answer)), "products");
            }).fail(function(answer) {
                if (answer.status === 401) {
                    window.location.reload();
                }
            });

            that._oFilterDialog.open();
        },

        // сброс фильтра
        reset: function()
        {
            this.byId("buttonResetFilter").setVisible(false);
            this.byId("tablePrices").getBinding("items").filter(null);
            this._filterProductID = null;
            this._filterProductClientID = null;
            this._filterProductName = null;
            this._filterCategoryID = null;
            this._filterCategoryClientID = null;
            this._filterCategoryName = null;
            this._filterStoreID = null;
            this._filterStoreClientID = null;
            this._filterStoreName = null;
        },

        onProductSuggest: function(event)
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

            sap.ui.core.Fragment.byId("filterDialog", "searchFieldProduct")
                .getBinding("suggestionItems")
                .filter(filters);
            sap.ui.core.Fragment.byId("filterDialog", "searchFieldProduct").suggest();
        },

        // при выборе товара
        onProductSearch: function(event)
        {
            if (event.getParameter("suggestionItem")) {
                sap.ui.core.Fragment.byId("filterDialog", "searchFieldCategory").setValue();
                let item = event.getParameter("suggestionItem");
                let key = item.getKey().split(":");
                this._filterProductID = key[0];
                this._filterProductClientID = key[1];
                this._filterProductName = item.getText();
            } else {
                this._filterProductID = null;
                this._filterProductClientID = null;
                this._filterProductName = null;
            }
        },

        onCategorySuggest: function(event)
        {
            let value = event.getParameter("suggestValue");
            let filter;
            if (value) {
                filter = new Filter("name", function(sText) {
                    return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                });
            }

            sap.ui.core.Fragment.byId("filterDialog", "searchFieldCategory")
                .getBinding("suggestionItems")
                .filter(filter);
            sap.ui.core.Fragment.byId("filterDialog", "searchFieldCategory").suggest();
        },

        // при выборе категории
        onCategorySearch: function(event)
        {
            if (event.getParameter("suggestionItem")) {
                sap.ui.core.Fragment.byId("filterDialog", "searchFieldProduct").setValue();
                let item = event.getParameter("suggestionItem");
                let key = item.getKey().split(":");
                this._filterCategoryID = key[0];
                this._filterCategoryClientID = key[1];
                this._filterCategoryName = item.getText();
            } else {
                this._filterCategoryID = null;
                this._filterCategoryClientID = null;
                this._filterCategoryName = null;
            }
        },

        onStoreSuggest: function(event)
        {
            let value = event.getParameter("suggestValue");
            let filter;
            if (value) {
                filter = new Filter("name", function(sText) {
                    return (sText || "").toUpperCase().indexOf(value.toUpperCase()) > -1;
                });
            }

            sap.ui.core.Fragment.byId("filterDialog", "searchFieldStore")
                .getBinding("suggestionItems")
                .filter(filter);
            sap.ui.core.Fragment.byId("filterDialog", "searchFieldStore").suggest();
        },

        // при выборе магазина
        onStoreSearch: function(e)
        {
            if (e.getParameter("suggestionItem")) {
                let item = e.getParameter("suggestionItem");
                let key = item.getKey().split(":");
                this._filterStoreID = key[0];
                this._filterStoreClientID = key[1];
                this._filterStoreName = item.getText();
            } else {
                this._filterStoreID = null;
                this._filterStoreClientID = null;
                this._filterStoreName = null;
            }
        },

        // применение фильтра
        apply: function()
        {
            if ((this._filterProductID && this._filterProductClientID) ||
                (this._filterCategoryID && this._filterCategoryClientID) ||
                (this._filterStoreID && this._filterStoreClientID)
            ) {
                let aFilters = [];

                if (this._filterProductID && this._filterProductClientID) {
                    aFilters.push(new Filter("productID", FilterOperator.EQ, this._filterProductID));
                    aFilters.push(new Filter("productClientID", FilterOperator.EQ, this._filterProductClientID));
                }
                if (this._filterCategoryID && this._filterCategoryClientID) {
                    aFilters.push(new Filter("categoryID", FilterOperator.EQ, this._filterCategoryID));
                    aFilters.push(new Filter("categoryClientID", FilterOperator.EQ, this._filterCategoryClientID));
                }
                if (this._filterStoreID && this._filterStoreClientID) {
                    aFilters.push(new Filter("storeID", FilterOperator.EQ, this._filterStoreID));
                    aFilters.push(new Filter("storeClientID", FilterOperator.EQ, this._filterStoreClientID));
                }

                // 21.12.18 FIXME: при первом заходе по прямой ссылке фильтр не работает - на этом этапе он еще не видит getBinding("items")
                if (this.byId("tablePrices").getBinding("items")) {
                    this.byId("tablePrices").getBinding("items").filter(aFilters);
                }
                this.byId("buttonResetFilter").setVisible(true);
            } else {
                this.filterDialog.reset();
            }
            if (this._oFilterDialog) {
                this._oFilterDialog.destroy();
            }
        },

        close: function()
        {
            this._oFilterDialog.destroy();
        },

        /**
         * Роутинг на фильтрацию по товару и магазину
         */
        onRouterFilterProductAndStore: function(oEvent)
        {
            this._filterProductID = oEvent.getParameter("arguments").productID;
            this._filterProductClientID = oEvent.getParameter("arguments").productClientID;
            this._filterStoreID = oEvent.getParameter("arguments").storeID;
            this._filterStoreClientID = oEvent.getParameter("arguments").storeClientID;
            this._filterProductName = sessionStorage.getItem("pricesFilterProductName");
            this._filterStoreName = sessionStorage.getItem("pricesFilterStoreName");
            this.filterDialog.apply.apply(this);
        }
    };
});
