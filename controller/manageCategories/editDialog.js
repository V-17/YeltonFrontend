/*
 * Copyright 2016 - 2017 Yelton authors:
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
        let path = this.getView().byId("listCategories").getSelectedContexts();

        if (path.length !== 0) {
            let model = this.getView().getModel("categories").getProperty(path[0].sPath);
            let jsonModel = new sap.ui.model.json.JSONModel(model);
            this._oEditDialog = sap.ui.xmlfragment("yelton.view.manageCategories.editDialog", this);
            this.getView().addDependent(this._oEditDialog);
            sap.ui.getCore().byId("buttonSave").setVisible(false);
            sap.ui.getCore().byId("inputName").setEditable(false);
            this._oEditDialog.setModel(jsonModel);
            this._oEditDialog.open();
        } else {
            sap.m.MessageToast.show("{i18n>selectCategory}");
        }
    },

    // нажатие кнопки create
    showCreateDialog: function()
    {
        let jsonModel = new sap.ui.model.json.JSONModel();
        this._oEditDialog = sap.ui.xmlfragment("yelton.view.manageCategories.editDialog", this);
        this.getView().addDependent(this._oEditDialog);
        sap.ui.getCore().byId("buttonEdit").setVisible(false);
        this._oEditDialog.setModel(jsonModel);
        this._oEditDialog.open();
    },

    edit: function()
    {
        sap.ui.getCore().byId("buttonEdit").setVisible(false);
        sap.ui.getCore().byId("buttonSave").setVisible(true);
        sap.ui.getCore().byId("buttonDelete").setVisible(true);
        sap.ui.getCore().byId("inputName").setEditable(true);
    },

    save: function()
    {
        let id = this._oEditDialog.getModel().getProperty("/id");
        let clientID = this._oEditDialog.getModel().getProperty("/clientID");
        let name = this._oEditDialog.getModel().getProperty("/name");

        if (!name || !name.trim()) {
            sap.ui.getCore().byId("inputName").setValueState("Error");
            return;
        }

        let out;
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

        let that = this;
        $.ajax({
                url: "/backend/web/services/manageCategories.php",
                type: "POST",
                data: out,
            })
            .done(function(data)
            {
                if (!data) data = null; // for "204 - no content" answer
                new Dict().setCategories(JSON.parse(data));
            })
            .fail(function(answer)
            {
                switch (answer.status) {
                    case 401:
                        window.location.reload();
                        break;
                    case 500:
                        sap.m.sap.m.MessageToast.show("{i18n>unexpectedError}");
                        break;
                }
            })
            .always(function()
            {
                if (id === undefined && clientID === undefined) {
                    that._oEditDialog.destroy();
                } else {
                    sap.ui.getCore().byId("buttonEdit").setVisible(true);
                    sap.ui.getCore().byId("buttonSave").setVisible(false);
                    sap.ui.getCore().byId("buttonDelete").setVisible(false);
                    sap.ui.getCore().byId("inputName").setEditable(false);
                }
            });
    },

    close: function()
    {
        this._oEditDialog.destroy();
    }
};
