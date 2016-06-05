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
            var model = this.getView().getModel().getProperty(path[0].sPath);
            var jsonModel = new sap.ui.model.json.JSONModel(model);

            this._oEditDialog = sap.ui.xmlfragment("view.manageProducts.editDialog", this);

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
                    async: false,
                    data: {
                        "id": model.id,
                        "clientID": model.clientID
                    }
                })
                .done(function(answer) {
                    var model = new sap.ui.model.json.JSONModel(JSON.parse(answer));
                    that._oEditDialog.setModel(model);
                    if (model.getProperty("/barcode")) {
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
                    that._oEditDialog.setModel(new sap.ui.model.json.JSONModel(JSON.parse(answer)), "units");
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

        this._oEditDialog = sap.ui.xmlfragment("view.manageProducts.editDialog", this);
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
                        sap.ui.getCore().byId("pageManageProducts").getModel().setData(JSON.parse(data));
                        break;
                    case 204: // пусто
                        sap.ui.getCore().byId("pageManageProducts").getModel().setData();
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
        sap.m.URLHelper.redirect("https://duckduckgo.com/?q=" + barcode, true);
    },

    /**
     * Закрытие окна
     */
    close: function()
    {
        this._oEditDialog.destroy();
    }
};
