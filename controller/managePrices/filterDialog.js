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
        this._oFilterDialog = sap.ui.xmlfragment("filterDialog", "view.managePrices.filterDialog", this);

        var currentFilters = this.byId("tablePrices").getBinding("items").aFilters;
        currentFilters.forEach(function(item, i, arr) {
            switch (item.sPath) {
                case "productName":
                    sap.ui.core.Fragment.byId("filterDialog", "searchFieldProduct").setValue(item.oValue1);
                    break;
                case "categoryName":
                    sap.ui.core.Fragment.byId("filterDialog", "searchFieldCategory").setValue(item.oValue1);
                    break;
                case "storeName":
                    sap.ui.core.Fragment.byId("filterDialog", "searchFieldStore").setValue(item.oValue1);
                    break;
            }
        });

        var that = this;

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

    // при выборе товара сбрасывается категория
    onProductSearch: function(event)
    {
        if (event.getParameter("suggestionItem")) {
            sap.ui.core.Fragment.byId("filterDialog", "searchFieldCategory").setValue();
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

    // при выборе категории  брасывается товар
    onCategorySearch: function(event)
    {
        if (event.getParameter("suggestionItem")) {
            sap.ui.core.Fragment.byId("filterDialog", "searchFieldProduct").setValue();
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

    // примерение фильтра
    apply: function()
    {
        var productName = sap.ui.core.Fragment.byId("filterDialog", "searchFieldProduct").getValue();
        var categoryName = sap.ui.core.Fragment.byId("filterDialog", "searchFieldCategory").getValue();
        var storeName = sap.ui.core.Fragment.byId("filterDialog", "searchFieldStore").getValue();

        if (productName || categoryName || storeName) {
            var aFilters = [];

            if (productName) {
                aFilters.push(new sap.ui.model.Filter("productName", sap.ui.model.FilterOperator.EQ, productName));
            }
            if (categoryName) {
                aFilters.push(new sap.ui.model.Filter("categoryName", sap.ui.model.FilterOperator.EQ, categoryName));
            }
            if (storeName) {
                aFilters.push(new sap.ui.model.Filter("storeName", sap.ui.model.FilterOperator.EQ, storeName));
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
