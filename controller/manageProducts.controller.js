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

 sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        "sap/ui/model/Filter",
        "sap/ui/model/FilterOperator",
        'sap/m/Dialog',
        'sap/m/Button',
        'sap/m/MessageToast',
        'sap/m/Text',
        'sap/m/Input'
    ],
    function(Controller, JSONModel, Filter, FilterOperator, Dialog, Button, MessageToast, Text, Input) {
        "use strict";
        return Controller.extend("controller.manageProducts", {

            onInit: function()
            {
                this.getView().setModel(new JSONModel());
            },

            // Поиск
            onFilterLiveSearch: function(oEvent) {
                var sQuery = oEvent.getParameter("newValue");
                // FIXME: перепиши
                // var table = this.getView().byId("tablePrices");
                // table.getBinding("items").filter(
                //     new Filter([
                //         new Filter("productName", FilterOperator.Contains, sQuery),
                //         new Filter("storeName", FilterOperator.Contains, sQuery),
                //         new Filter("date", FilterOperator.Contains, sQuery)
                //     ])
                // );
            },

            onLogoutButtonPress: function()
            {
                $.post("backend/web/services/signOut.php");
                window.location.reload();
            },

            // нажатие нопки "Удалить"
            onDeleteButtonPress: function()
            {
                var path = this.getView().byId("listProducts").getSelectedContexts();

                if (path.length !== 0) {
                    var model = this.getView().getModel().getProperty(path[0].sPath);
                    var jsonModel = new JSONModel(model);
                    this._oDeleteDialog = sap.ui.xmlfragment("view.manageProducts.deleteDialog", this);
                    this._oDeleteDialog.setModel(jsonModel);
                    this._oDeleteDialog.open();
                } else {
                    MessageToast.show("Выберите товар");
                }
            },

            // нажатие кнопки Редактировать
            onEditButtonPress: function()
            {
                var path = this.getView().byId("listProducts").getSelectedContexts();

                if (path.length !== 0) {
                    var model = this.getView().getModel().getProperty(path[0].sPath);
                    var jsonModel = new JSONModel(model);
                    this._oEditDialog = sap.ui.xmlfragment("view.manageProducts.editDialog", this);
                    this._oEditDialog.setModel(jsonModel);

                    // грузим список категорий
                    var categoriesModel = new JSONModel("backend/web/services/manageCategories.php");
                    this._oEditDialog.setModel(categoriesModel, "categories");
                    //выбираем в списке текущую
                    var categoryID = jsonModel.getProperty("/categoryID");
                    var categoryClientID = jsonModel.getProperty("/categoryClientID");
                    sap.ui.getCore().byId("selectCategory").setSelectedKey(categoryID + ":" + categoryClientID);

                    // грузим список единиц измерения
                    var unitsModel = new JSONModel("backend/web/services/manageUnits.php");
                    this._oEditDialog.setModel(unitsModel, "units");
                    //выбираем в списке текущую
                    var unitID = jsonModel.getProperty("/unitID");
                    var unitClientID = jsonModel.getProperty("/unitClientID");
                    sap.ui.getCore().byId("selectUnit").setSelectedKey(unitID + ":" + unitClientID);

                    this._oEditDialog.open();
                } else {
                    MessageToast.show("Выберите товар");
                }
            },

            // нажатие кнопки create
            onCreateButtonPress: function()
            {
                var oData = [{
                    id: null,
                    clientID: null,
                    name: null,
                    categoryID: null,
                    categoryClientID: null,
                    unitID: null,
                    unitClientID: null
                }];
                var jsonModel = new JSONModel(oData);

                this._oEditDialog = sap.ui.xmlfragment("view.manageProducts.editDialog", this);
                this._oEditDialog.setModel(jsonModel);

                // грузим список категорий
                var categoriesModel = new JSONModel("backend/web/services/manageCategories.php");
                this._oEditDialog.setModel(categoriesModel, "categories");

                // грузим список единиц измерения
                var unitsModel = new JSONModel("backend/web/services/manageUnits.php");
                this._oEditDialog.setModel(unitsModel, "units");

                this._oEditDialog.open();
            },


            _onEditDialogOK: function()
            {
                var id = this._oEditDialog.getModel().getProperty("/id");
                var clientID = this._oEditDialog.getModel().getProperty("/clientID");
                var name = this._oEditDialog.getModel().getProperty("/name");

                var selectedKey = sap.ui.getCore().byId("selectCategory").getSelectedKey().split(":");
                var categoryID = selectedKey[0];
                var categoryClientID = selectedKey[1];
                selectedKey = sap.ui.getCore().byId("selectUnit").getSelectedKey().split(":");
                var unitID = selectedKey[0];
                var unitClientID = selectedKey[1];

                var data;

                // создаем или изменяем
                // в зависимости от того, что мы передадим POST (будут там айдишники или нет)
                // сервис поймет, создавать ему или обновлять
                if (id === undefined && clientID === undefined) {
                    // создаем
                    data = {
                        name: name,
                        categoryID: categoryID,
                        categoryClientID: categoryClientID,
                        unitID: unitID,
                        unitClientID: unitClientID
                    };
                } else {
                    // изменяем
                    data = {
                        id: id,
                        clientID: clientID,
                        name: name,
                        categoryID: categoryID,
                        categoryClientID: categoryClientID,
                        unitID: unitID,
                        unitClientID: unitClientID
                    };
                }

                $.ajax({
                    type: "POST",
                    url: "/backend/web/services/manageProducts.php",
                    data: data,
                    success: function(data)
                    {
                        data = data.trim();
                        if (data === "ok") {
                            sap.ui.getCore().byId("pageManageProducts").getModel().loadData(
                                "backend/web/services/manageProducts.php");
                        } else if (data === "unknown_error") {
                            sap.m.MessageToast.show("Произошла непредвиденная ошибка");
                        } else {
                            sap.m.MessageToast.show(data);
                        }
                    }
                });

                this._oEditDialog.destroy();
            },

            _onEditDialogCancel: function()
            {
                this._oEditDialog.destroy();
            },


            _onDeleteDialogOK: function()
            {
                var id = this._oDeleteDialog.getModel().getProperty("/id");
                var clientID = this._oDeleteDialog.getModel().getProperty("/clientID");

                $.ajax({
                    type: "DEL",
                    url: "/backend/web/services/manageProducts.php",
                    data: {
                        id: id,
                        clientID: clientID
                    },
                    success: function(data)
                    {
                        data = data.trim();
                        if (data === "ok") {
                            sap.ui.getCore().byId("pageManageProducts").getModel().loadData(
                                "backend/web/services/manageProducts.php");
                        } else if (data === "unknown_error") {
                            sap.m.MessageToast.show("Произошла непредвиденная ошибка");
                        } else {
                            sap.m.MessageToast.show(data);
                        }
                    }
                });

                this._oDeleteDialog.destroy();
            },

            _onDeleteDialogCancel: function()
            {
                this._oDeleteDialog.destroy();
            }


        });
    });
