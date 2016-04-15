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

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        'sap/m/Dialog',
        'sap/m/Button',
        'sap/m/MessageToast',
        'sap/m/Text',
        'sap/m/Input',
        'sap/m/ComboBox'
    ],
    function(Controller, JSONModel, Filter, FilterOperator, Dialog, Button, MessageToast, Text, Input) {
        "use strict";
        return Controller.extend("controller.manageCategories", {

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

            onSettingsButtonPress: function()
            {
                settings.showPopover.apply(this);
            },

            // нажатие нопки "Удалить"
            onDeleteButtonPress: function()
            {
                var path = this.getView().byId("tableCategories").getSelectedContexts();

                if (path.length !== 0) {
                    var model = this.getView().getModel().getProperty(path[0].sPath);
                    var jsonModel = new JSONModel(model);
                    this._oDeleteDialog = sap.ui.xmlfragment("view.manageCategories.deleteDialog", this);
                    this._oDeleteDialog.setModel(jsonModel);
                    this._oDeleteDialog.open();
                } else {
                    MessageToast.show("Выберите категорию");
                }
            },

            // нажатие кнопки Редактировать
            onEditButtonPress: function()
            {
                var path = this.getView().byId("tableCategories").getSelectedContexts();

                if (path.length !== 0) {
                    var model = this.getView().getModel().getProperty(path[0].sPath);
                    var jsonModel = new JSONModel(model);
                    this._oEditDialog = sap.ui.xmlfragment("view.manageCategories.editDialog", this);
                    this._oEditDialog.setModel(jsonModel);
                    this._oEditDialog.open();
                } else {
                    MessageToast.show("Выберите категорию");
                }
            },

            // нажатие кнопки create
            onCreateButtonPress: function()
            {
                var oData = [{
                    id: null,
                    clientID: null,
                    name: null
                }];
                var jsonModel = new JSONModel(oData);

                this._oEditDialog = sap.ui.xmlfragment("view.manageCategories.editDialog", this);
                this._oEditDialog.setModel(jsonModel);
                this._oEditDialog.open();
            },


            _onEditDialogOK: function()
            {
                var id = this._oEditDialog.getModel().getProperty("/id");
                var clientID = this._oEditDialog.getModel().getProperty("/clientID");
                var name = this._oEditDialog.getModel().getProperty("/name");

                var out;
                // создаем или изменяем
                // в зависимости от того, что мы передадим POST (будут там айдишники или нет)
                // сервис поймет, создавать ему или обновлять
                if (id === undefined && clientID === undefined) {
                    out = {
                        name: name
                    };
                } else {
                    out = {
                        id: id,
                        clientID: clientID,
                        name: name
                    };
                }

                var that = this;
                $.ajax({
                        url: "/backend/web/services/manageCategories.php",
                        type: "POST",
                        data: out,
                    })
                    .done(function(data, textStatus, jqXHR)
                    {
                        switch (jqXHR.status) {
                            case 200:
                                sap.ui.getCore().byId("pageManageCategories").getModel().setData(JSON.parse(data));
                                break;
                            case 204:
                                sap.ui.getCore().byId("pageManageCategories").getModel().setData();
                                break;
                        }
                    })
                    .fail(function(answer)
                    {
                        switch (answer.status) {
                            case 401:
                                window.location.reload();
                                break;
                            case 500:
                                sap.m.MessageToast.show("Произошла непредвиденная ошибка");
                                break;
                        }
                    })
                    .always(function()
                    {
                        that._oEditDialog.destroy();
                    });
            },

            _onEditDialogCancel: function()
            {
                this._oEditDialog.destroy();
            },

            _onDeleteDialogOK: function()
            {
                var id = this._oDeleteDialog.getModel().getProperty("/id");
                var clientID = this._oDeleteDialog.getModel().getProperty("/clientID");

                var that = this;
                $.ajax({
                        url: "/backend/web/services/manageCategories.php",
                        type: "DEL",
                        data: {
                            id: id,
                            clientID: clientID
                        }
                    })
                    .done(function(data, textStatus, jqXHR)
                    {
                        switch (jqXHR.status) {
                            case 200:
                                sap.ui.getCore().byId("pageManageCategories").getModel().setData(JSON.parse(data));
                                break;
                            case 204:
                                sap.ui.getCore().byId("pageManageCategories").getModel().setData();
                                break;
                        }
                    })
                    .fail(function(answer)
                    {
                        switch (answer.status) {
                            case 401:
                                window.location.reload();
                                break;
                            case 500:
                                sap.m.MessageToast.show("Произошла непредвиденная ошибка");
                                break;
                        }
                    })
                    .always(function() {
                        that._oDeleteDialog.destroy();
                    });
            },

            _onDeleteDialogCancel: function()
            {
                this._oDeleteDialog.destroy();
            }

        });
    });
