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
                // FIXME: реализовать
                // var table = this.getView().byId("tablePrices");
                // table.getBinding("items").filter(
                //     new Filter([
                //         new Filter("productName", FilterOperator.Contains, sQuery),
                //         new Filter("storeName", FilterOperator.Contains, sQuery),
                //         new Filter("date", FilterOperator.Contains, sQuery)
                //     ])
                // );
            },

            onSettingsButtonPress: function()
            {
                settings.showPopover.apply(this);
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
                    if (this._oEditDialog.getModel().getProperty("/barcode")) {
                        sap.ui.getCore().byId("buttonBarcodeSearch").setEnabled(true);
                    }
                    var that = this;

                    // грузим список категорий и выбираем нужную
                    $.ajax({
                            url: "backend/web/services/manageCategories.php",
                            type: "GET"
                        })
                        .done(function(answer) {
                            that._oEditDialog.setModel(new JSONModel(JSON.parse(answer)), "categories");
                            var id = jsonModel.getProperty("/categoryID");
                            var clientID = jsonModel.getProperty("/categoryClientID");
                            sap.ui.getCore().byId("selectCategory").setSelectedKey(id + ":" + clientID);
                        })
                        .fail(function(answer) {
                            if (answer.status === 401) {
                                window.location.reload();
                            }
                        });

                    // грузим список единиц измерения и выбираем нужную
                    $.ajax({
                            url: "backend/web/services/manageUnits.php",
                            type: "GET"
                        })
                        .done(function(answer) {
                            that._oEditDialog.setModel(new JSONModel(JSON.parse(answer)), "units");
                            var id = jsonModel.getProperty("/unitID");
                            var clientID = jsonModel.getProperty("/unitClientID");
                            sap.ui.getCore().byId("selectUnit").setSelectedKey(id + ":" + clientID);
                        })
                        .fail(function(answer) {
                            if (answer.status === 401) {
                                window.location.reload();
                            }
                        });

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
                    manufacturer: null,
                    barcode: null,
                    categoryID: null,
                    categoryClientID: null,
                    unitID: null,
                    unitClientID: null
                }];
                var jsonModel = new JSONModel(oData);

                this._oEditDialog = sap.ui.xmlfragment("view.manageProducts.editDialog", this);
                this._oEditDialog.setModel(jsonModel);
                var that = this;

                // грузим список категорий
                $.ajax({
                        url: "backend/web/services/manageCategories.php",
                        type: "GET"
                    })
                    .done(function(answer) {
                        that._oEditDialog.setModel(new JSONModel(JSON.parse(answer)), "categories");
                    })
                    .fail(function(answer) {
                        if (answer.status === 401) {
                            window.location.reload();
                        }
                    });

                // грузим список единиц измерения
                $.ajax({
                        url: "backend/web/services/manageUnits.php",
                        type: "GET"
                    })
                    .done(function(answer) {
                        that._oEditDialog.setModel(new JSONModel(JSON.parse(answer)), "units");
                    })
                    .fail(function(answer) {
                        if (answer.status === 401) {
                            window.location.reload();
                        }
                    });

                this._oEditDialog.open();
            },

            _onEditDialogOK: function()
            {
                var id = this._oEditDialog.getModel().getProperty("/id");
                var clientID = this._oEditDialog.getModel().getProperty("/clientID");
                var name = this._oEditDialog.getModel().getProperty("/name");
                var manufacturer = this._oEditDialog.getModel().getProperty("/manufacturer");
                var barcode = this._oEditDialog.getModel().getProperty("/barcode");

                var selectedKey = sap.ui.getCore().byId("selectCategory").getSelectedKey().split(":");
                var categoryID = selectedKey[0];
                var categoryClientID = selectedKey[1];
                selectedKey = sap.ui.getCore().byId("selectUnit").getSelectedKey().split(":");
                var unitID = selectedKey[0];
                var unitClientID = selectedKey[1];

                var out;
                // создаем или изменяем
                // в зависимости от того, что мы передадим POST (будут там айдишники или нет)
                // сервис поймет, создавать ему или обновлять
                if (id === undefined && clientID === undefined) {
                    // создаем
                    out = {
                        "name": name,
                        "manufacturer": manufacturer,
                        "barcode": barcode,
                        "categoryID": categoryID,
                        "categoryClientID": categoryClientID,
                        "unitID": unitID,
                        "unitClientID": unitClientID
                    };
                } else {
                    // изменяем
                    out = {
                        "id": id,
                        "clientID": clientID,
                        "name": name,
                        "manufacturer": manufacturer,
                        "barcode": barcode,
                        "categoryID": categoryID,
                        "categoryClientID": categoryClientID,
                        "unitID": unitID,
                        "unitClientID": unitClientID
                    };
                }

                var that = this;
                $.ajax({
                        url: "/backend/web/services/manageProducts.php",
                        type: "POST",
                        data: out,
                    })
                    .done(function(answer)
                    {
                        answer = answer.trim();
                        if (answer === "ok") {
                            sap.ui.getCore().byId("pageManageProducts").getModel().loadData("backend/web/services/manageProducts.php");
                        } else if (answer === "unknown_error") {
                            sap.m.MessageToast.show("Произошла непредвиденная ошибка");
                        } else {
                            sap.m.MessageToast.show(answer);
                        }
                    })
                    .fail(function(answer)
                    {
                        if (answer.status === 401) {
                            window.location.reload();
                        }
                    })
                    .always(function() {
                        that._oEditDialog.destroy();
                    });
            },

            //liveChange на barcode
            // если не пусто - активируем кнопку поиска
            _onInputBarcodeLiveChange: function(oEvent)
            {
                var value = oEvent.getParameters().value;
                if (value) {
                    sap.ui.getCore().byId("buttonBarcodeSearch").setEnabled(true);
                } else {
                    sap.ui.getCore().byId("buttonBarcodeSearch").setEnabled(false);
                }
            },

            // поиск штрих-кода в интернете
            _onSearchBarcodeClick: function()
            {
                var barcode = this._oEditDialog.getModel().getProperty("/barcode");
                sap.m.URLHelper.redirect("https://duckduckgo.com/?q=" + barcode, true);
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
                        url: "/backend/web/services/manageProducts.php",
                        type: "DEL",
                        data: {
                            id: id,
                            clientID: clientID
                        }
                    })
                    .done(function(answer)
                    {
                        answer = answer.trim();
                        if (answer === "ok") {
                            sap.ui.getCore().byId("pageManageProducts").getModel().loadData("backend/web/services/manageProducts.php");
                        } else if (answer === "unknown_error") {
                            sap.m.MessageToast.show("Произошла непредвиденная ошибка");
                        } else {
                            sap.m.MessageToast.show(answer);
                        }
                    })
                    .fail(function(answer)
                    {
                        if (answer.status === 401) {
                            window.location.reload();
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
