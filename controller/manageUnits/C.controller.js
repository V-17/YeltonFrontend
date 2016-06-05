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

jQuery.sap.require("controller.manageUnits.editDialog");
jQuery.sap.require("controller.manageUnits.deleteDialog");

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function(Controller, JSONModel, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("controller.manageUnits.C", {

            onInit: function()
            {
                this.getView().setModel(new JSONModel());
            },

            // Поиск
            onFilterLiveSearch: function(oEvent)
            {
                var sQuery = oEvent.getParameter("newValue");
                var table = this.getView().byId("listUnits");
                table.getBinding("items").filter(
                    new Filter([
                        new Filter("fullName", FilterOperator.Contains, sQuery),
                        new Filter("shortName", FilterOperator.Contains, sQuery)
                    ])
                );
            },

            // нажатие кнопки "Создать"
            onCreateButtonPress: function()
            {
                unitsEditDialog.showCreateDialog.apply(this);
            },

            // при выборе из списка
            onSelect: function()
            {
                unitsEditDialog.showEditDialog.apply(this);
            },

            _onEditDialogEdit: function()
            {
                unitsEditDialog.edit.apply(this);
            },

            // подтверждение создания / редактирования
            _onEditDialogSave: function()
            {
                unitsEditDialog.save.apply(this);
            },

            // отмена создания / редактирования
            _onEditDialogClose: function()
            {
                unitsEditDialog.close.apply(this);
            },

            // нажатие нопки "Удалить"
            _onEditDialogDelete: function()
            {
                unitsDeleteDialog.show.apply(this);
            },

            // подтверждение удаления
            _onDeleteDialogOK: function()
            {
                unitsDeleteDialog.apply.apply(this);
            },

            // отмена удаления
            _onDeleteDialogCancel: function()
            {
                unitsDeleteDialog.cancel.apply(this);
            }
        });
    });
