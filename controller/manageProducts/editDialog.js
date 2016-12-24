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

var productsEditDialog = {

    /**
     * Открытие окна для редактирования выбранного товара.
     *
     * При открытии окна заполняются данные на всех вкладках
     * Изначально окно открывается только для просмотра, и становится доступным для редактирования только после нажатия
     * на клавишу "Изменить"
     *
     * TODO: зарузку справочников можно вынести в отдельную функцию, которая будет использоваться и при открытии
     * окна для создания. А тут просто будем выбирать нужный элемент из списка
     */
    showEditDialog: function()
    {
        var path = this.getView().byId("listProducts").getSelectedContexts();

        if (path.length !== 0) {
            var oIntputData = this.getView().getModel().getProperty(path[0].sPath);
            var oFullDataModel;

            this._oEditDialog = sap.ui.xmlfragment("yelton.view.manageProducts.editDialog", this);

            sap.ui.getCore().byId("inputName").setEditable(false);
            sap.ui.getCore().byId("selectCategory").setEnabled(false);
            sap.ui.getCore().byId("selectUnit").setEnabled(false);
            sap.ui.getCore().byId("inputManufacturer").setEditable(false);
            sap.ui.getCore().byId("inputBarcode").setEditable(false);
            sap.ui.getCore().byId("buttonSave").setVisible(false);
            var that = this;

            // идем за полными данными по выбранному товару
            $.ajax({
                    url: "backend/web/services/manageProducts.php",
                    type: "GET",
                    async: false, // чтобы загрузить полную инфу, а уже потом выбирать из справочника
                    data: {
                        "id": oIntputData.id,
                        "clientID": oIntputData.clientID
                    }
                })
                .done(function(answer) {
                    oFullDataModel = new sap.ui.model.json.JSONModel(JSON.parse(answer));
                    that._oEditDialog.setModel(oFullDataModel);
                    if (oFullDataModel.getProperty("/barcode")) {
                        sap.ui.getCore().byId("buttonBarcodeSearch").setEnabled(true);
                    }
                })
                .fail(function(answer) {
                    if (answer.status === 401) {
                        window.location.reload();
                    }
                });

            // грузим список категорий и выбираем нужную
            $.ajax({
                    url: "backend/web/services/manageCategories.php",
                    type: "GET"
                })
                .done(function(answer) {
                    that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "categories");
                    var id = oFullDataModel.getProperty("/categoryID");
                    var clientID = oFullDataModel.getProperty("/categoryClientID");
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
                    that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "units");
                    var id = oFullDataModel.getProperty("/unitID");
                    var clientID = oFullDataModel.getProperty("/unitClientID");
                    sap.ui.getCore().byId("selectUnit").setSelectedKey(id + ":" + clientID);
                })
                .fail(function(answer) {
                    if (answer.status === 401) {
                        window.location.reload();
                    }
                });

            this._oEditDialog.open();
        } else {
            sap.m.MessageToast.show("Выберите товар");
        }
    },

    /**
     * Открытие окна для создания нового товара.
     *
     * При открытии окна только подтягиваются возможные справочники
     * Активна только одна вкладка, т.к. по товару еще не может быть никакой статистики
     * Также поля сразу доступны для редактированя
     */
    showCreateDialog: function()
    {
        var jsonModel = new sap.ui.model.json.JSONModel();

        this._oEditDialog = sap.ui.xmlfragment("yelton.view.manageProducts.editDialog", this);
        sap.ui.getCore().byId("tabPrices").destroy();
        sap.ui.getCore().byId("tabStores").destroy();
        sap.ui.getCore().byId("buttonEdit").setVisible(false);
        this._oEditDialog.setModel(jsonModel);
        var that = this;

        // грузим список категорий
        $.ajax({
                url: "backend/web/services/manageCategories.php",
                type: "GET"
            })
            .done(function(answer) {
                that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "categories");
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
                that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "units");
            })
            .fail(function(answer) {
                if (answer.status === 401) {
                    window.location.reload();
                }
            });

        this._oEditDialog.open();
    },

    /**
     * Нажатие на кнопку "Сохранить"
     *
     * Берем введённые пользователем параметры и скармливаем их backend'у.
     */
    save: function()
    {
        var id = this._oEditDialog.getModel().getProperty("/id");
        var clientID = this._oEditDialog.getModel().getProperty("/clientID");
        var name = this._oEditDialog.getModel().getProperty("/name");
        var manufacturer = this._oEditDialog.getModel().getProperty("/manufacturer");
        var barcode = this._oEditDialog.getModel().getProperty("/barcode");

        if (!name || !name.trim()) {
            sap.ui.getCore().byId("inputName").setValueState("Error");
            return;
        }

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
            .done(function(data, textStatus, jqXHR)
            {
                switch (jqXHR.status) {
                    case 200:
                        that.getView().getModel().setData(JSON.parse(data));
                        break;
                    case 204: // пусто
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
                        sap.m.sap.m.MessageToast.show("Произошла непредвиденная ошибка");
                        break;
                }
            })
            .always(function() {
                // если окно открывали на создание товара - тогда его нужно закрыть
                // если на редактирование - тогда сделать неактивными все элементы ввода, а также показать вкладки
                if (id === undefined && clientID === undefined) {
                    that._oEditDialog.destroy();
                } else {
                    sap.ui.getCore().byId("inputName").setEditable(false);
                    sap.ui.getCore().byId("selectCategory").setEnabled(false);
                    sap.ui.getCore().byId("selectUnit").setEnabled(false);
                    sap.ui.getCore().byId("inputManufacturer").setEditable(false);
                    sap.ui.getCore().byId("inputBarcode").setEditable(false);
                    sap.ui.getCore().byId("buttonDelete").setVisible(false);
                    sap.ui.getCore().byId("buttonEdit").setVisible(true);
                    sap.ui.getCore().byId("buttonSave").setVisible(false);
                    sap.ui.getCore().byId("tabPrices").setVisible(true);
                    sap.ui.getCore().byId("tabStores").setVisible(true);
                }
            });
    },

    /**
     * Нажатие на кнопку "Изменить"
     *
     * Открываем все возможные поля для редактирования,
     * но при этом временно скрываем ненужные вкладки
     */
    edit: function()
    {
        sap.ui.getCore().byId("inputName").setEditable(true);
        sap.ui.getCore().byId("selectCategory").setEnabled(true);
        sap.ui.getCore().byId("selectUnit").setEnabled(true);
        sap.ui.getCore().byId("inputManufacturer").setEditable(true);
        sap.ui.getCore().byId("inputBarcode").setEditable(true);
        sap.ui.getCore().byId("buttonDelete").setVisible(true);
        sap.ui.getCore().byId("buttonEdit").setVisible(false);
        sap.ui.getCore().byId("buttonSave").setVisible(true);
        sap.ui.getCore().byId("tabPrices").setVisible(false);
        sap.ui.getCore().byId("tabStores").setVisible(false);
    },

    /**
     * liveChange на barcode
     *
     * если не пусто - активируем кнопку поиска
     */
    onBarcodeLiveChange: function(oEvent)
    {
        var value = oEvent.getParameters().value;
        if (value) {
            sap.ui.getCore().byId("buttonBarcodeSearch").setEnabled(true);
        } else {
            sap.ui.getCore().byId("buttonBarcodeSearch").setEnabled(false);
        }
    },

    // поиск штрих-кода в интернете
    searchBarcode: function()
    {
        var barcode = this._oEditDialog.getModel().getProperty("/barcode");
        sap.m.URLHelper.redirect("https://www.google.ru/search?q=" + barcode, true);
    },

    /**
     * Закрытие окна
     */
    close: function()
    {
        this._oEditDialog.destroy();
    },

    navToPricesFilter: function(oEvent)
    {
        let productID = this._oEditDialog.getModel().getData().id;
        let productClientID = this._oEditDialog.getModel().getData().clientID;
        let productName = this._oEditDialog.getModel().getData().name;
        let storeID = oEvent.getSource().getBindingContext().getProperty().id;
        let storeClientID = oEvent.getSource().getBindingContext().getProperty().clientID;
        let storeName = oEvent.getSource().getBindingContext().getProperty().name;

        sap.m.MessageToast.show('Фильтр по товару \n"' + productName + '"\n и магазину \n"' + storeName + '"', {
            duration: 5000,
            width: "20em",
            closeOnBrowserNavigation: false
        });

        sessionStorage.setItem("pricesFilterProductName", productName);
        sessionStorage.setItem("pricesFilterStoreName", storeName);

        sap.ui.core.UIComponent.getRouterFor(this).navTo("filterProductAndStore", {
            "productID": productID,
            "productClientID": productClientID,
            "storeID": storeID,
            "storeClientID": storeClientID
        });
    }
};
