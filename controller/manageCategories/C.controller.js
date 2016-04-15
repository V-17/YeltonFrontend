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

jQuery.sap.require("controller.settings.settings");
jQuery.sap.require("controller.manageCategories.editDialog");
jQuery.sap.require("controller.manageCategories.deleteDialog");

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function(Controller, JSONModel, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("controller.manageCategories.C", {

            onInit: function()
            {
                this.getView().setModel(new JSONModel());
            },

            // Поиск
            onFilterLiveSearch: function(oEvent) {
                var sQuery = oEvent.getParameter("newValue");
                var table = this.getView().byId("tableCategories");
                table.getBinding("items").filter(
                    new Filter("name", FilterOperator.Contains, sQuery)
                );
            },

            // нажатие кнопки Настройки
            onSettingsButtonPress: function()
            {
                settings.showPopover.apply(this);
            },

            // нажатие кнопки Создать
            onCreateButtonPress: function()
            {
                categoriesEditDialog.showCreateDialog.apply(this);
            },

            // нажатие кнопки Редактировать
            onEditButtonPress: function()
            {
                categoriesEditDialog.showEditDialog.apply(this);
            },

            // подтверждение создания / редактирования
            _onEditDialogOK: function()
            {
                categoriesEditDialog.apply.apply(this);
            },

            // отмена создания / редактирования
            _onEditDialogCancel: function()
            {
                categoriesEditDialog.cancel.apply(this);
            },

            // нажатие кнопки Удалить
            onDeleteButtonPress: function()
            {
                categoriesDeleteDialog.show.apply(this);
            },

            // подтверждение удаления
            _onDeleteDialogOK: function()
            {
                categoriesDeleteDialog.apply.apply(this);
            },

            // отмена удаления
            _onDeleteDialogCancel: function()
            {
                categoriesDeleteDialog.cancel.apply(this);
            }
        });
    });
