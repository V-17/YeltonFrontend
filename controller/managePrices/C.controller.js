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

jQuery.sap.require("controller.managePrices.editDialog");
jQuery.sap.require("controller.managePrices.deleteDialog");
jQuery.sap.require("controller.managePrices.filterDialog");

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function(Controller, JSONModel, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("controller.managePrices.C", {

            onInit: function()
            {
                // т.к. это первая страница, сразу надо сюда данные грузить
                // а потом об этом позаботится splitApp
                var that = this;
                $.ajax({
                        url: "backend/web/services/managePrices.php",
                        type: "GET"
                    })
                    .done(function(data, textStatus, jqXHR)
                    {
                        if (jqXHR.status === 204) { // no content
                            that.getView().setModel(new JSONModel());
                        } else {
                            that.getView().setModel(new JSONModel(JSON.parse(data)));
                        }
                    })
                    .fail(function(answer)
                    {
                        if (answer.status === 401) {
                            window.location.reload();
                        }
                    });
            },

            // Поиск
            onFilterLiveSearch: function(oEvent)
            {
                var sQuery = oEvent.getParameter("newValue");
                var table = this.getView().byId("tablePrices");
                table.getBinding("items").filter(
                    new Filter([
                        new Filter("productName", FilterOperator.Contains, sQuery),
                        new Filter("storeName", FilterOperator.Contains, sQuery),
                        new Filter("date", FilterOperator.Contains, sQuery)
                    ])
                );
            },

            // нажатие кнопки Создать
            onCreateButtonPress: function()
            {
                pricesEditDialog.showCreateDialog.apply(this);
            },

            // нажатие кнопки Редактировать
            onEditButtonPress: function()
            {
                pricesEditDialog.showEditDialog.apply(this);
            },

            // при изменении цены
            _onInputPriceLiveChange: function(oEvent)
            {
                pricesEditDialog.onInputPriceLiveChange.apply(this, [oEvent]);
            },

            // при изменении количества
            _onInputAmountLiveChange: function(oEvent)
            {
                pricesEditDialog.onInputAmountLiveChange.apply(this, [oEvent]);
            },

            // подтверждение создания / редактирования
            _onEditDialogOK: function()
            {
                pricesEditDialog.apply.apply(this);
            },

            // отмена создания / редактирования
            _onEditDialogCancel: function()
            {
                pricesEditDialog.cancel.apply(this);
            },


            // нажатие нопки Удалить
            onDeleteButtonPress: function()
            {
                pricesDeleteDialog.show.apply(this);
            },

            // подтверждение удаления
            _onDeleteDialogOK: function()
            {
                pricesDeleteDialog.apply.apply(this);
            },

            // отмена удаления
            _onDeleteDialogCancel: function()
            {
                pricesDeleteDialog.cancel.apply(this);
            },


            // нажатие на кнопку Фильтр
            onFilterButtonPress: function()
            {
                pricesFilterDialog.show.apply(this);
            },

            // нажатие на кнопку Сброс фильтра
            onFilterResetButtonPress: function()
            {
                pricesFilterDialog.reset.apply(this);
            },

            // выпадающий список для товаров
            _onFilterDialogSearchFieldProductSuggest: function(event)
            {
                pricesFilterDialog.onProductSuggest.apply(this, [event]);
            },

            // при выборе товара
            _onFilterDialogSearchFieldProductSearch: function(event)
            {
                pricesFilterDialog.onProductSearch.apply(this, [event]);
            },

            // выпадающий список для категорий
            _onFilterDialogSearchFieldCategorySuggest: function(event)
            {
                pricesFilterDialog.onCategorySuggest.apply(this, [event]);
            },

            // при выборе категории
            _onFilterDialogSearchFieldCategorySearch: function(event)
            {
                pricesFilterDialog.onCategorySearch.apply(this, [event]);
            },

            // выпадающий список для магазинов
            _onFilterDialogSearchFieldStoreSuggest: function(event)
            {
                pricesFilterDialog.onStoreSuggest.apply(this, [event]);
            },

            // при выборе магазина
            _onFilterDialogSearchFieldStoreSearch: function(e)
            {
                pricesFilterDialog.onStoreSearch.apply(this, [e]);
            },

            // примерение фильтра
            _onFilterDialogOK: function()
            {
                pricesFilterDialog.apply.apply(this);
            },

            // закрытие окна фильтра
            _onFilterDialogCancel: function()
            {
                pricesFilterDialog.close.apply(this);
            }
        });
    });
