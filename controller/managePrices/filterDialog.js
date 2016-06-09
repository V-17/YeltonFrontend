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

var pricesFilterDialog = {

    show: function()
    {
        this._oFilterDialog = sap.ui.xmlfragment("filterDialog", "yelton.view.managePrices.filterDialog", this);

        var currentFilters = this.byId("tablePrices").getBinding("items").aFilters;
        var that = this;

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
            })
            .done(function(answer)
            {
                that._oFilterDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "products");
            })
            .fail(function(answer)
            {
                if (answer.status === 401) {
                    window.location.reload();
                }
            });

        // загружаем список категорий
        $.ajax({
                url: "backend/web/services/manageCategories.php",
                type: "GET"
            })
            .done(function(answer)
            {
                that._oFilterDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "categories");
            })
            .fail(function(answer)
            {
                if (answer.status === 401) {
                    window.location.reload();
                }
            });

        // загружаем список магазинов
        $.ajax({
                url: "backend/web/services/manageStores.php",
                type: "GET"
            })
            .done(function(answer)
            {
                that._oFilterDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "stores");
            })
            .fail(function(answer)
            {
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
            var item = event.getParameter("suggestionItem");
            var key = item.getKey().split(":");
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
        var value = event.getParameter("suggestValue");
        var filter;
        if (value) {
            filter = new sap.ui.model.Filter("name", function(sText) {
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
            var item = event.getParameter("suggestionItem");
            var key = item.getKey().split(":");
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
        var value = event.getParameter("suggestValue");
        var filter;
        if (value) {
            filter = new sap.ui.model.Filter("name", function(sText) {
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
            var item = e.getParameter("suggestionItem");
            var key = item.getKey().split(":");
            this._filterStoreID = key[0];
            this._filterStoreClientID = key[1];
            this._filterStoreName = item.getText();
        } else {
            this._filterStoreID = null;
            this._filterStoreClientID = null;
            this._filterStoreName = null;
        }
    },

    // примерение фильтра
    apply: function()
    {
        if ((this._filterProductID && this._filterProductClientID) ||
            (this._filterCategoryID && this._filterCategoryClientID) ||
            (this._filterStoreID && this._filterStoreClientID)
        ) {
            var aFilters = [];

            if (this._filterProductID && this._filterProductClientID) {
                aFilters.push(new sap.ui.model.Filter("productID", sap.ui.model.FilterOperator.EQ, this._filterProductID));
                aFilters.push(new sap.ui.model.Filter("productClientID", sap.ui.model.FilterOperator.EQ, this._filterProductClientID));
            }
            if (this._filterCategoryID && this._filterCategoryClientID) {
                aFilters.push(new sap.ui.model.Filter("categoryID", sap.ui.model.FilterOperator.EQ, this._filterCategoryID));
                aFilters.push(new sap.ui.model.Filter("categoryClientID", sap.ui.model.FilterOperator.EQ, this._filterCategoryClientID));
            }
            if (this._filterStoreID && this._filterStoreClientID) {
                aFilters.push(new sap.ui.model.Filter("storeID", sap.ui.model.FilterOperator.EQ, this._filterStoreID));
                aFilters.push(new sap.ui.model.Filter("storeClientID", sap.ui.model.FilterOperator.EQ, this._filterStoreClientID));
            }

            this.byId("tablePrices").getBinding("items").filter(aFilters);
            this.byId("buttonResetFilter").setVisible(true);
        } else {
            this.onFilterResetButtonPress();
        }
        this._oFilterDialog.destroy();
    },

    close: function()
    {
        this._oFilterDialog.destroy();
    }
};
