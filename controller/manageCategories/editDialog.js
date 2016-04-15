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

var categoriesEditDialog = {

    // нажатие кнопки Редактировать
    showEditDialog: function()
    {
        var path = this.getView().byId("tableCategories").getSelectedContexts();

        if (path.length !== 0) {
            var model = this.getView().getModel().getProperty(path[0].sPath);
            var jsonModel = new sap.ui.model.json.JSONModel(model);
            this._oEditDialog = sap.ui.xmlfragment("view.manageCategories.editDialog", this);
            this._oEditDialog.setModel(jsonModel);
            this._oEditDialog.open();
        } else {
            sap.m.MessageToast.show("Выберите категорию");
        }
    },

    // нажатие кнопки create
    showCreateDialog: function()
    {
        var oData = [{
            id: null,
            clientID: null,
            name: null
        }];
        var jsonModel = new sap.ui.model.json.JSONModel(oData);

        this._oEditDialog = sap.ui.xmlfragment("view.manageCategories.editDialog", this);
        this._oEditDialog.setModel(jsonModel);
        this._oEditDialog.open();
    },

    apply: function()
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
                        sap.m.sap.m.MessageToast.show("Произошла непредвиденная ошибка");
                        break;
                }
            })
            .always(function()
            {
                that._oEditDialog.destroy();
            });
    },

    cancel: function()
    {
        this._oEditDialog.destroy();
    }
};
