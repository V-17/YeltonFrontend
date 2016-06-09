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

var pricesEditDialog = {

    showEditDialog: function()
    {
        var path = this.byId("tablePrices").getSelectedContexts();

        if (path.length !== 0) {
            var model = this.getView().getModel().getProperty(path[0].sPath);
            var jsonModel = new sap.ui.model.json.JSONModel(model);
            this._oEditDialog = sap.ui.xmlfragment("editDialog", "yelton.view.managePrices.editDialog", this);
            sap.ui.core.Fragment.byId("editDialog", "selectProduct").setEnabled(false);
            sap.ui.core.Fragment.byId("editDialog", "selectStore").setEnabled(false);
            sap.ui.core.Fragment.byId("editDialog", "datePicker").setEditable(false);
            sap.ui.core.Fragment.byId("editDialog", "inputPrice").setEditable(false);
            sap.ui.core.Fragment.byId("editDialog", "inputAmount").setEditable(false);
            sap.ui.core.Fragment.byId("editDialog", "buttonSave").setVisible(false);
            this._oEditDialog.setModel(jsonModel);
            var that = this;

            // грузим список товаров, выбираем в списке нужный
            $.ajax({
                    url: "backend/web/services/manageProducts.php",
                    type: "GET"
                })
                .done(function(answer)
                {
                    that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "products");
                    var id = jsonModel.getProperty("/productID");
                    var clientID = jsonModel.getProperty("/productClientID");
                    sap.ui.core.Fragment.byId("editDialog", "selectProduct").setSelectedKey(id + ":" + clientID);
                })
                .fail(function(answer)
                {
                    if (answer.status === 401) {
                        window.location.reload();
                    }
                });

            // грузим список магазинов, выбираем в списке нужный
            $.ajax({
                    url: "backend/web/services/manageStores.php",
                    type: "GET"
                })
                .done(function(answer)
                {
                    that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "stores");
                    var id = jsonModel.getProperty("/storeID");
                    var clientID = jsonModel.getProperty("/storeClientID");
                    sap.ui.core.Fragment.byId("editDialog", "selectStore").setSelectedKey(id + ":" + clientID);
                })
                .fail(function(answer)
                {
                    if (answer.status === 401) {
                        window.location.reload();
                    }
                });

            //ставим дату
            // FIXME: по идее тоже через модель надо
            // просто лень сейчас разбираться с форматом
            // а может и не придётся разбираться ))
            // но все равно пока лень
            var date = jsonModel.getProperty("/date");
            sap.ui.core.Fragment.byId("editDialog", "datePicker").setValue(date);

            this._oEditDialog.open();
        } else {
            sap.m.MessageToast.show("Выберите покупку");
        }
    },

    // нажатие кнопки create
    showCreateDialog: function()
    {
        var jsonModel = new sap.ui.model.json.JSONModel();

        this._oEditDialog = sap.ui.xmlfragment("editDialog", "yelton.view.managePrices.editDialog", this);
        sap.ui.core.Fragment.byId("editDialog", "buttonEdit").setVisible(false);
        this._oEditDialog.setModel(jsonModel);
        var that = this;

        // грузим список товаров
        $.ajax({
                url: "backend/web/services/manageProducts.php",
                type: "GET"
            })
            .done(function(answer)
            {
                that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "products");
            })
            .fail(function(answer)
            {
                if (answer.status === 401) {
                    window.location.reload();
                }
            });

        // грузим список магазинов
        $.ajax({
                url: "backend/web/services/manageStores.php",
                type: "GET",
                data: "enabledOnly" // флаг - грузить только активные магазины

            })
            .done(function(answer)
            {
                that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "stores");
            })
            .fail(function(answer)
            {
                if (answer.status === 401) {
                    window.location.reload();
                }
            });

        // ставим текущую дату
        var dd = new Date().getDate();
        var mm = new Date().getMonth() + 1;
        var yyyy = new Date().getFullYear();
        sap.ui.core.Fragment.byId("editDialog", "datePicker").setValue(dd + "." + mm + "." + yyyy);

        this._oEditDialog.open();
    },

    onInputPriceLiveChange: function(oEvent)
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

    onInputAmountLiveChange: function(oEvent)
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

    edit: function()
    {
        sap.ui.core.Fragment.byId("editDialog", "selectProduct").setEnabled(true);
        sap.ui.core.Fragment.byId("editDialog", "selectStore").setEnabled(true);
        sap.ui.core.Fragment.byId("editDialog", "datePicker").setEditable(true);
        sap.ui.core.Fragment.byId("editDialog", "inputPrice").setEditable(true);
        sap.ui.core.Fragment.byId("editDialog", "inputAmount").setEditable(true);
        sap.ui.core.Fragment.byId("editDialog", "buttonSave").setVisible(true);
        sap.ui.core.Fragment.byId("editDialog", "buttonDelete").setVisible(true);
        sap.ui.core.Fragment.byId("editDialog", "buttonEdit").setVisible(false);
    },

    save: function()
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

        var out;
        // создаем или изменяем
        // в зависимости от того, что мы передадим POST (будут там айдишники или нет)
        // сервис поймет, создавать ему или обновлять
        if (id === undefined && clientID === undefined) {
            // создаем
            out = {
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
            out = {
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

        var that = this;
        $.ajax({
                url: "/backend/web/services/managePrices.php",
                type: "POST",
                data: out,
            })
            .done(function(data, textStatus, jqXHR)
            {
                switch (jqXHR.status) {
                    case 200:
                        that.getView().getModel().setData(JSON.parse(data));
                        break;
                    case 204:
                        that.getView().getModel().setData();
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
                if (id === undefined && clientID === undefined) {
                    that._oEditDialog.destroy();
                } else {
                    sap.ui.core.Fragment.byId("editDialog", "selectProduct").setEnabled(false);
                    sap.ui.core.Fragment.byId("editDialog", "selectStore").setEnabled(false);
                    sap.ui.core.Fragment.byId("editDialog", "datePicker").setEditable(false);
                    sap.ui.core.Fragment.byId("editDialog", "inputPrice").setEditable(false);
                    sap.ui.core.Fragment.byId("editDialog", "inputAmount").setEditable(false);
                    sap.ui.core.Fragment.byId("editDialog", "buttonSave").setVisible(false);
                    sap.ui.core.Fragment.byId("editDialog", "buttonEdit").setVisible(true);
                    sap.ui.core.Fragment.byId("editDialog", "buttonDelete").setVisible(false);
                }
            });
    },

    close: function()
    {
        this._oEditDialog.destroy();
    }
};
