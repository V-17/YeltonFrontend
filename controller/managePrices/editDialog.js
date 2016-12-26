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

/*jshint evil:true*/


var pricesEditDialog = {

    showEditDialog: function()
    {
        let path = this.byId("tablePrices").getSelectedContexts();

        if (path.length !== 0) {
            let model = this.getView().getModel("prices").getProperty(path[0].sPath);
            let jsonModel = new sap.ui.model.json.JSONModel(model);
            this._oEditDialog = sap.ui.xmlfragment("editDialog", "yelton.view.managePrices.editDialog", this);
            this.getView().addDependent(this._oEditDialog);
            sap.ui.core.Fragment.byId("editDialog", "comboBoxProduct").setEnabled(false);
            sap.ui.core.Fragment.byId("editDialog", "selectStore").setEnabled(false);
            sap.ui.core.Fragment.byId("editDialog", "datePicker").setEditable(false);
            sap.ui.core.Fragment.byId("editDialog", "inputPrice").setEditable(false);
            sap.ui.core.Fragment.byId("editDialog", "inputAmount").setEditable(false);
            sap.ui.core.Fragment.byId("editDialog", "buttonSave").setVisible(false);
            this._oEditDialog.setModel(jsonModel);

            // из товаров выбираем в списке нужный
            let productID = jsonModel.getProperty("/productID");
            let productClientID = jsonModel.getProperty("/productClientID");
            sap.ui.core.Fragment.byId("editDialog", "comboBoxProduct").setSelectedKey(productID + ":" + productClientID);

            // из магазинов, выбираем в списке нужный
            let storeID = jsonModel.getProperty("/storeID");
            let storeClientID = jsonModel.getProperty("/storeClientID");
            sap.ui.core.Fragment.byId("editDialog", "selectStore").setSelectedKey(storeID + ":" + storeClientID);

            //ставим дату
            // FIXME: по идее тоже через модель надо
            // просто лень сейчас разбираться с форматом
            // а может и не придётся разбираться ))
            // но все равно пока лень
            let date = jsonModel.getProperty("/date");
            sap.ui.core.Fragment.byId("editDialog", "datePicker").setValue(date);

            this._oEditDialog.open();
        } else {
            sap.m.MessageToast.show("Выберите покупку");
        }
    },

    // нажатие кнопки create
    showCreateDialog: function()
    {
        let jsonModel = new sap.ui.model.json.JSONModel();

        this._oEditDialog = sap.ui.xmlfragment("editDialog", "yelton.view.managePrices.editDialog", this);
        this.getView().addDependent(this._oEditDialog);
        sap.ui.core.Fragment.byId("editDialog", "buttonEdit").setVisible(false);
        this._oEditDialog.setModel(jsonModel);

        // Оставим только активные (не архивные) магазины
        sap.ui.core.Fragment.byId("editDialog", "selectStore")
            .getBinding("items").filter(
                new sap.ui.model.Filter("enabled", sap.ui.model.FilterOperator.EQ, true)
            );

        // ставим текущую дату
        let dd = new Date().getDate();
        let mm = new Date().getMonth() + 1;
        let yyyy = new Date().getFullYear();
        sap.ui.core.Fragment.byId("editDialog", "datePicker").setValue(dd + "." + mm + "." + yyyy);

        this._oEditDialog.open();
    },

    onProductChange: function(event)
    {
        // сбрасываем статус
        sap.ui.core.Fragment.byId("editDialog", "comboBoxProduct").setValueState("None");
    },

    onInputPriceLiveChange: function(oEvent)
    {
        let inputPrice = sap.ui.core.Fragment.byId("editDialog", "inputPrice");
        let price = oEvent.getParameters().value;
        let lastSymbol = price[price.length - 1];

        // всегда скидываем статус
        inputPrice.setValueState("None");

        if (!/[\+\-\/\*\,\.\(\)0-9]/.test(lastSymbol)) {
            inputPrice.setValue(price.substr(0, price.length - 1));
            return;
        }

        let priceCalc;
        try {
            price = price.replace(",", ".");
            priceCalc = parseFloat(eval(price));
        } catch (err) {
            priceCalc = NaN;
        }

        if (!isNaN(priceCalc)) {
            if (priceCalc != price) {
                let text = sap.ui.core.Fragment.byId("editDialog", "textPriceCalculation");
                text.setText("=" + priceCalc);
            }
        } else {
            sap.ui.core.Fragment.byId("editDialog", "textPriceCalculation").setText("");
        }
    },

    onInputAmountLiveChange: function(oEvent)
    {
        let inputAmount = sap.ui.core.Fragment.byId("editDialog", "inputAmount");
        let amount = oEvent.getParameters().value;
        let lastSymbol = amount[amount.length - 1];

        // всегда скидываем статус
        inputAmount.setValueState("None");

        if (!/[\+\-\/\*\,\.\(\)0-9]/.test(lastSymbol)) {
            inputAmount.setValue(amount.substr(0, amount.length - 1));
            return;
        }

        let amountCalc;
        try {
            amount = amount.replace(",", ".");
            amountCalc = parseFloat(eval(amount));
        } catch (err) {
            amountCalc = NaN;
        }

        if (!isNaN(amountCalc)) {
            if (amountCalc != amount) {
                let text = sap.ui.core.Fragment.byId("editDialog", "textAmountCalculation");
                text.setText("=" + amountCalc);
            }
        } else {
            sap.ui.core.Fragment.byId("editDialog", "textAmountCalculation").setText("");
        }
    },

    edit: function()
    {
        sap.ui.core.Fragment.byId("editDialog", "comboBoxProduct").setEnabled(true);
        sap.ui.core.Fragment.byId("editDialog", "selectStore").setEnabled(true);
        sap.ui.core.Fragment.byId("editDialog", "datePicker").setEditable(true);
        sap.ui.core.Fragment.byId("editDialog", "inputPrice").setEditable(true);
        sap.ui.core.Fragment.byId("editDialog", "inputAmount").setEditable(true);
        sap.ui.core.Fragment.byId("editDialog", "buttonSave").setVisible(true);
        sap.ui.core.Fragment.byId("editDialog", "buttonDelete").setVisible(true);
        sap.ui.core.Fragment.byId("editDialog", "buttonEdit").setVisible(false);
    },

    /**
     * Сохранение покупки.
     *
     * Проверка правильности заполнения и отправка POST запроса
     */
    save: function()
    {
        let id = this._oEditDialog.getModel().getProperty("/id");
        let clientID = this._oEditDialog.getModel().getProperty("/clientID");
        let textAmountCalc = sap.ui.core.Fragment.byId("editDialog", "textAmountCalculation");
        let inputAmount = sap.ui.core.Fragment.byId("editDialog", "inputAmount");
        let comboBoxProduct = sap.ui.core.Fragment.byId("editDialog", "comboBoxProduct");
        let amount;
        if (textAmountCalc.getText().length > 0) {
            amount = textAmountCalc.getText().substr(1);
        } else {
            amount = this._oEditDialog.getModel().getProperty("/amount");
        }
        let textPriceCount = sap.ui.core.Fragment.byId("editDialog", "textPriceCalculation");
        let inputPrice = sap.ui.core.Fragment.byId("editDialog", "inputPrice");
        let price;
        if (textPriceCount.getText().length > 0) {
            price = textPriceCount.getText().substr(1);
        } else {
            price = this._oEditDialog.getModel().getProperty("/price");
        }

        let selectedStore = sap.ui.core.Fragment.byId("editDialog", "selectStore").getSelectedKey().split(":");
        let storeID = selectedStore[0];
        let storeClientID = selectedStore[1];

        // тут только дата, а нам бы еще время взять
        // чтобы сортировалось в порядке добавления
        let date = sap.ui.core.Fragment.byId("editDialog", "datePicker").getValue();
        let hh = new Date().getHours();
        let mm = new Date().getMinutes();
        let ss = new Date().getSeconds();
        date = date + " " + hh + ":" + mm + ":" + ss;

        // проверки
        let canContinue = true;
        let selectedProduct = comboBoxProduct.getSelectedKey().split(":");
        let productID = selectedProduct[0];
        let productClientID = selectedProduct[1];
        if (!productID || !productClientID) {
            comboBoxProduct.setValueState("Error");
            canContinue = false;
        } else {
            comboBoxProduct.setValueState("None");
        }
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

        let out;
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

        let that = this;
        $.ajax({
                url: "/backend/web/services/managePrices.php",
                type: "POST",
                data: out,
            })
            .done(function(data)
            {
                if (!data) data = null; // for "204 - no content" answer
                new Dict().setPrices(JSON.parse(data));
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
                    sap.ui.core.Fragment.byId("editDialog", "comboBoxProduct").setEnabled(false);
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
