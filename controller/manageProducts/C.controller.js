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

jQuery.sap.require("controller.manageProducts.editDialog");
jQuery.sap.require("controller.manageProducts.deleteDialog");

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function(Controller, JSONModel, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("controller.manageProducts.C", {

            onInit: function()
            {
                this.getView().setModel(new JSONModel());
            },

            // Поиск
            onFilterLiveSearch: function(oEvent)
            {
                var sQuery = oEvent.getParameter("newValue");
                var table = this.getView().byId("listProducts");
                table.getBinding("items").filter(
                    new Filter([
                        new Filter("name", FilterOperator.Contains, sQuery),
                        new Filter("categoryName", FilterOperator.Contains, sQuery)
                    ])
                );
            },

            // нажатие кнопки "Создать новый товар"
            onCreateButtonPress: function()
            {
                productsEditDialog.showCreateDialog.apply(this);
            },

            // при выборе товара из списка
            onSelect: function()
            {
                productsEditDialog.showEditDialog.apply(this);
            },

            // при изменении штрих-кода
            _onInputBarcodeLiveChange: function(oEvent)
            {
                productsEditDialog.onBarcodeLiveChange.apply(this, [oEvent]);
            },

            // поиск штрих-кода
            _onSearchBarcodeClick: function()
            {
                productsEditDialog.searchBarcode.apply(this);
            },

            // нажатие на кнопку "Сохранить"
            _onEditDialogSave: function()
            {
                productsEditDialog.save.apply(this);
            },

            // нажатие на кнопку "Изменить"
            _onEditDialogEdit: function()
            {
                productsEditDialog.edit.apply(this);
            },

            // отмена создания / изменения
            _onEditDialogClose: function()
            {
                productsEditDialog.close.apply(this);
            },

            // нажатие нопки "Удалить"
            _onEditDialogDelete: function()
            {
                productsDeleteDialog.show.apply(this);
            },

            // подтверждение удаления
            _onDeleteDialogOK: function()
            {
                productsDeleteDialog.apply.apply(this);
            },

            // отмена удаления
            _onDeleteDialogCancel: function()
            {
                productsDeleteDialog.cancel.apply(this);
            },

            /**
             * При любом изменении значения поля, сбрасываем ему valueState
             */
            _onInputNameLiveChange: function()
            {
                sap.ui.getCore().byId("inputName").setValueState("None");
            }
        });
    });
