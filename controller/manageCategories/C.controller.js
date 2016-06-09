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

jQuery.sap.require("yelton.controller.manageCategories.editDialog");
jQuery.sap.require("yelton.controller.manageCategories.deleteDialog");

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator"
    ],
    function(Controller, JSONModel, Filter, FilterOperator) {
        "use strict";
        return Controller.extend("yelton.controller.manageCategories.C", {

            onInit: function()
            {
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.getRoute("categories").attachPatternMatched(this.onRouter, this);
            },

            onRouter: function(oEvent)
            {
                var that = this;
                $.ajax({
                        url: "backend/web/services/manageCategories.php",
                        type: "GET"
                    })
                    .done(function(data, textStatus, jqXHR)
                    {
                        if (jqXHR.status === 204) { // no content
                            that.getView().setModel(new JSONModel());
                        } else {
                            that.getView().setModel(new JSONModel(JSON.parse(data)));
                        }
                        // FIXME: id
                        sap.ui.getCore().byId("__xmlview0--listMainMenu").setSelectedItemById("__item1");
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
                var table = this.getView().byId("listCategories");
                table.getBinding("items").filter(
                    new Filter("name", FilterOperator.Contains, sQuery)
                );
            },

            // нажатие кнопки Создать
            onCreateButtonPress: function()
            {
                categoriesEditDialog.showCreateDialog.apply(this);
            },

            // при выборе из списка
            onSelect: function()
            {
                categoriesEditDialog.showEditDialog.apply(this);
            },

            // подтверждение создания / редактирования
            _onEditDialogSave: function()
            {
                categoriesEditDialog.save.apply(this);
            },

            _onEditDialogEdit: function()
            {
                categoriesEditDialog.edit.apply(this);
            },

            // отмена создания / редактирования
            _onEditDialogClose: function()
            {
                categoriesEditDialog.close.apply(this);
            },

            // нажатие кнопки Удалить
            _onEditDialogDelete: function()
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
