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
        'sap/m/Input',
        'sap/m/ComboBox',
        'sap/m/DatePicker'
    ],
    function(Controller, JSONModel, Filter, FilterOperator, Dialog, Button, MessageToast, Text, Input, ComboBox, DatePicker) {
        "use strict";
        return Controller.extend("controller.managePrices", {

            onInit: function()
            {
                // т.к. это первая страница, сразу надо сюда данные грузить
                // а потом об этом позаботится splitapp
                this.getView().setModel(new JSONModel("backend/web/services/managePrices.php"));
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

            onLogoutButtonPress: function()
            {
                $.post("backend/web/services/signOut.php");
                window.location.reload();
            },

            // нажатие нопки "Удалить"
            onDeleteButtonPress: function()
            {
                var path = this.getView().byId("tablePrices").getSelectedContexts();

                if (path.length !== 0) {
                    var model = this.getView().getModel().getProperty(path[0].sPath);
                    var jsonModel = new JSONModel(model);
                    this._oDeleteDialog = sap.ui.xmlfragment("view.managePrices.deleteDialog", this);
                    this._oDeleteDialog.setModel(jsonModel);
                    this._oDeleteDialog.open();
                } else {
                    MessageToast.show("Выберите покупку");
                }
            },

            // нажатие кнопки Редактировать
            onEditButtonPress: function()
            {
                var path = this.getView().byId("tablePrices").getSelectedContexts();

                if (path.length !== 0) {
                    var model = this.getView().getModel().getProperty(path[0].sPath);
                    var jsonModel = new JSONModel(model);
                    this._oEditDialog = sap.ui.xmlfragment("editDialog", "view.managePrices.editDialog", this);
                    this._oEditDialog.setModel(jsonModel);

                    // грузим список товаров
                    var productsModel = new JSONModel("backend/web/services/manageProducts.php");
                    this._oEditDialog.setModel(productsModel, "products");
                    //выбираем в списке текущую
                    var productID = jsonModel.getProperty("/productID");
                    var productClientID = jsonModel.getProperty("/productClientID");
                    sap.ui.core.Fragment.byId("editDialog", "selectProduct").setSelectedKey(productID + ":" + productClientID);

                    // грузим список магазов
                    var storesModel = new JSONModel("backend/web/services/manageStores.php");
                    this._oEditDialog.setModel(storesModel, "stores");
                    //выбираем в списке текущую
                    var storeID = jsonModel.getProperty("/storeID");
                    var storeClientID = jsonModel.getProperty("/storeClientID");
                    sap.ui.core.Fragment.byId("editDialog", "selectStore").setSelectedKey(storeID + ":" + storeClientID);

                    //ставим дату
                    // fixme: по идее тоже через модель надо
                    // просто лень сейчас разбираться с форматом
                    // а может и не придётся разбираться ))
                    // но все равно пока лень
                    var date = jsonModel.getProperty("/date");
                    sap.ui.core.Fragment.byId("editDialog", "datePicker").setValue(date);

                    this._oEditDialog.open();
                } else {
                    MessageToast.show("Выберите покупку");
                }
            },

            // нажатие кнопки create
            onCreateButtonPress: function()
            {
                var oData = [{
                    id: null,
                    clientID: null,
                    productID: null,
                    productClientID: null,
                    storeID: null,
                    storeClientID: null,
                    amount: null,
                    price: null,
                    date: null,
                    currencyID: null
                }];
                var jsonModel = new JSONModel(oData);

                this._oEditDialog = sap.ui.xmlfragment("editDialog", "view.managePrices.editDialog", this);
                this._oEditDialog.setModel(jsonModel);

                // грузим список категорий
                var productsModel = new JSONModel("backend/web/services/manageProducts.php");
                this._oEditDialog.setModel(productsModel, "products");

                // грузим список мер
                var storesModel = new JSONModel("backend/web/services/manageStores.php");
                this._oEditDialog.setModel(storesModel, "stores");

                // ставим текущую дату
                var dd = new Date().getDate();
                var mm = new Date().getMonth() + 1;
                var yyyy = new Date().getFullYear();
                sap.ui.core.Fragment.byId("editDialog", "datePicker").setValue(dd + "." + mm + "." + yyyy);

                this._oEditDialog.open();
            },

            _onInputPriceLiveChange: function(oEvent)
            {
                var inputPrice = sap.ui.core.Fragment.byId("editDialog", "inputPrice");
                var price = oEvent.getParameters().value;
                var lastSymbol = price[price.length - 1];

                // всегда скидываем статус
                inputPrice.setValueState("None");

                if (!/[\+\-\/\*\,\.\(\)0-9]/.test(lastSymbol)) {
                    inputPrice.setValue(price.substr(0, price.length - 1));
                    return;
                }

                var priceCalc;
                try {
                    price = price.replace(",", ".");
                    priceCalc = parseFloat(eval(price));
                } catch (err) {
                    priceCalc = NaN;
                }

                if (!isNaN(priceCalc)) {
                    if (priceCalc != price) {
                        var text = sap.ui.core.Fragment.byId("editDialog", "textPriceCalculation");
                        text.setText("=" + priceCalc);
                    }
                } else {
                    sap.ui.core.Fragment.byId("editDialog", "textPriceCalculation").setText("");
                }
            },

            _onInputAmountLiveChange: function(oEvent)
            {
                var inputAmount = sap.ui.core.Fragment.byId("editDialog", "inputAmount");
                var amount = oEvent.getParameters().value;
                var lastSymbol = amount[amount.length - 1];

                // всегда скидываем статус
                inputAmount.setValueState("None");

                if (!/[\+\-\/\*\,\.\(\)0-9]/.test(lastSymbol)) {
                    inputAmount.setValue(amount.substr(0, amount.length - 1));
                    return;
                }

                var amountCalc;
                try {
                    amount = amount.replace(",", ".");
                    amountCalc = parseFloat(eval(amount));
                } catch (err) {
                    amountCalc = NaN;
                }

                if (!isNaN(amountCalc)) {
                    if (amountCalc != amount) {
                        var text = sap.ui.core.Fragment.byId("editDialog", "textAmountCalculation");
                        text.setText("=" + amountCalc);
                    }
                } else {
                    sap.ui.core.Fragment.byId("editDialog", "textAmountCalculation").setText("");
                }
            },

            _onEditDialogOK: function()
            {
                var id = this._oEditDialog.getModel().getProperty("/id");
                var clientID = this._oEditDialog.getModel().getProperty("/clientID");
                var textAmountCalc = sap.ui.core.Fragment.byId("editDialog", "textAmountCalculation");
                var inputAmount = sap.ui.core.Fragment.byId("editDialog", "inputAmount");
                var amount;
                if (textAmountCalc.getText().length > 0) {
                    amount = textAmountCalc.getText().substr(1);
                } else {
                    amount = this._oEditDialog.getModel().getProperty("/amount");
                }
                var textPriceCount = sap.ui.core.Fragment.byId("editDialog", "textPriceCalculation");
                var inputPrice = sap.ui.core.Fragment.byId("editDialog", "inputPrice");
                var price;
                if (textPriceCount.getText().length > 0) {
                    price = textPriceCount.getText().substr(1);
                } else {
                    price = this._oEditDialog.getModel().getProperty("/price");
                }

                var selectedKey = sap.ui.core.Fragment.byId("editDialog", "selectProduct").getSelectedKey().split(":");
                var productID = selectedKey[0];
                var productClientID = selectedKey[1];
                selectedKey = sap.ui.core.Fragment.byId("editDialog", "selectStore").getSelectedKey().split(":");
                var storeID = selectedKey[0];
                var storeClientID = selectedKey[1];

                // тут только дата, а нам бы еще время взять
                // чтобы сортировалось в порядке добавления
                var date = sap.ui.core.Fragment.byId("editDialog", "datePicker").getValue();
                var hh = new Date().getHours();
                var mm = new Date().getMinutes();
                var ss = new Date().getSeconds();
                date = date + " " + hh + ":" + mm + ":" + ss;

                var canContinue = true;
                if (!isNumeric(price)) {
                    inputPrice.setValueStateText("Вводите числа и простые операции, например (2+2)/4");
                    inputPrice.setValueState("Error");
                    canContinue = false;
                } else if (price <= 0 || price > 9999999) {
                    inputPrice.setValueStateText("Введите число в диапазоне 0 – 9 999 999");
                    inputPrice.setValueState("Error");
                    canContinue = false;
                } else {
                    inputPrice.setValueState("None");
                }
                if (!isNumeric(amount)) {
                    inputAmount.setValueStateText("Вводите числа и простые операции, например (2+2)/4");
                    inputAmount.setValueState("Error");
                    canContinue = false;
                } else if (amount <= 0 || amount > 9999999) {
                    inputAmount.setValueStateText("Введите число в диапазоне 0 – 9 999 999");
                    inputAmount.setValueState("Error");
                    canContinue = false;
                } else {
                    inputAmount.setValueState("None");
                }
                if (!canContinue) {
                    return;
                }

                var data;
                // создаем или изменяем
                // в зависимости от того, что мы передадим POST (будут там айдишники или нет)
                // сервис поймет, создавать ему или обновлять
                if (id === undefined && clientID === undefined) {
                    // создаем
                    data = {
                        productID: productID,
                        productClientID: productClientID,
                        storeID: storeID,
                        storeClientID: storeClientID,
                        amount: amount,
                        price: price,
                        date: date,
                        currencyID: 1
                    };
                } else {
                    // изменяем
                    data = {
                        id: id,
                        clientID: clientID,
                        productID: productID,
                        productClientID: productClientID,
                        storeID: storeID,
                        storeClientID: storeClientID,
                        amount: amount,
                        price: price,
                        date: date,
                        currencyID: 1
                    };
                }

                $.ajax({
                    type: "POST",
                    url: "/backend/web/services/managePrices.php",
                    data: data,
                    success: function(data)
                    {
                        data = data.trim();
                        if (data === "ok") {
                            sap.ui.getCore().byId("pageManagePrices").getModel().loadData(
                                "backend/web/services/managePrices.php");
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
                    url: "/backend/web/services/managePrices.php",
                    data: {
                        id: id,
                        clientID: clientID
                    },
                    success: function(data)
                    {
                        data = data.trim();
                        if (data === "ok") {
                            sap.ui.getCore().byId("pageManagePrices").getModel().loadData(
                                "backend/web/services/managePrices.php");
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
