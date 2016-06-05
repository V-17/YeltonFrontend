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

var unitsEditDialog = {

    showEditDialog: function()
    {
        var path = this.getView().byId("listUnits").getSelectedContexts();

        if (path.length !== 0) {
            var model = this.getView().getModel().getProperty(path[0].sPath);
            var jsonModel = new sap.ui.model.json.JSONModel(model);
            this._oEditDialog = sap.ui.xmlfragment("view.manageUnits.editDialog", this);
            sap.ui.getCore().byId("buttonSave").setVisible(false);
            sap.ui.getCore().byId("inputFullName").setEditable(false);
            sap.ui.getCore().byId("inputShortName").setEditable(false);
            this._oEditDialog.setModel(jsonModel);
            this._oEditDialog.open();
        } else {
            sap.m.MessageToast.show("Выберите меру");
        }
    },


    showCreateDialog: function()
    {
        var jsonModel = new sap.ui.model.json.JSONModel();

        this._oEditDialog = sap.ui.xmlfragment("view.manageUnits.editDialog", this);
        sap.ui.getCore().byId("buttonEdit").setVisible(false);
        this._oEditDialog.setModel(jsonModel);
        this._oEditDialog.open();
    },

    edit: function()
    {
        sap.ui.getCore().byId("inputFullName").setEditable(true);
        sap.ui.getCore().byId("inputShortName").setEditable(true);
        sap.ui.getCore().byId("buttonDelete").setVisible(true);
        sap.ui.getCore().byId("buttonSave").setVisible(true);
        sap.ui.getCore().byId("buttonEdit").setVisible(false);
    },

    save: function()
    {
        var id = this._oEditDialog.getModel().getProperty("/id");
        var clientID = this._oEditDialog.getModel().getProperty("/clientID");
        var fullName = this._oEditDialog.getModel().getProperty("/fullName");
        var shortName = this._oEditDialog.getModel().getProperty("/shortName");

        var out;
        // создаем или изменяем
        // в зависимости от того, что мы передадим POST (будут там айдишники или нет)
        // сервис поймет, создавать ему или обновлять
        if (id === undefined && clientID === undefined) {
            out = {
                fullName: fullName,
                shortName: shortName
            };
        } else {
            out = {
                id: id,
                clientID: clientID,
                fullName: fullName,
                shortName: shortName
            };
        }


        var that = this;
        $.ajax({
                url: "/backend/web/services/manageUnits.php",
                type: "POST",
                data: out,
            })
            .done(function(data, textStatus, jqXHR)
            {
                switch (jqXHR.status) {
                    case 200:
                        sap.ui.getCore().byId("pageManageUnits").getModel().setData(JSON.parse(data));
                        break;
                    case 204:
                        sap.ui.getCore().byId("pageManageUnits").getModel().setData();
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
                if (id === undefined && clientID === undefined) {
                    that._oEditDialog.destroy();
                } else {
                    sap.ui.getCore().byId("inputFullName").setEditable(false);
                    sap.ui.getCore().byId("inputShortName").setEditable(false);
                    sap.ui.getCore().byId("buttonDelete").setVisible(false);
                    sap.ui.getCore().byId("buttonSave").setVisible(false);
                    sap.ui.getCore().byId("buttonEdit").setVisible(true);
                }
            });
    },

    close: function()
    {
        this._oEditDialog.destroy();
    }
};
