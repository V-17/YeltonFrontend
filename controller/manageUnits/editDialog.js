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

var unitsEditDialog = {

    showEditDialog: function()
    {
        let path = this.getView().byId("listUnits").getSelectedContexts();

        if (path.length !== 0) {
            let model = this.getView().getModel("units").getProperty(path[0].sPath);
            let jsonModel = new sap.ui.model.json.JSONModel(model);
            this._oEditDialog = sap.ui.xmlfragment("yelton.view.manageUnits.editDialog", this);
            this.getView().addDependent(this._oEditDialog);
            sap.ui.getCore().byId("buttonSave").setVisible(false);
            sap.ui.getCore().byId("inputFullName").setEditable(false);
            sap.ui.getCore().byId("inputShortName").setEditable(false);
            this._oEditDialog.setModel(jsonModel);
            this._oEditDialog.open();
        } else {
            sap.m.MessageToast.show("{i18n>selectUnit}");
        }
    },

    showCreateDialog: function()
    {
        let jsonModel = new sap.ui.model.json.JSONModel();
        this._oEditDialog = sap.ui.xmlfragment("yelton.view.manageUnits.editDialog", this);
        this.getView().addDependent(this._oEditDialog);
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
        let id = this._oEditDialog.getModel().getProperty("/id");
        let clientID = this._oEditDialog.getModel().getProperty("/clientID");
        let fullName = this._oEditDialog.getModel().getProperty("/fullName");
        let shortName = this._oEditDialog.getModel().getProperty("/shortName");

        let canContinue = true;
        if (!fullName || !fullName.trim()) {
            sap.ui.getCore().byId("inputFullName").setValueState("Error");
            canContinue = false;
        }
        if (!shortName || !shortName.trim()) {
            sap.ui.getCore().byId("inputShortName").setValueState("Error");
            canContinue = false;
        }
        if (!canContinue) {
            return;
        }

        let out;
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

        let that = this;
        $.ajax({
                url: "/backend/web/services/manageUnits.php",
                type: "POST",
                data: out,
            })
            .done(function(data)
            {
                if (!data) data = null; // for "204 - no content" answer
                new Dict().setUnits(JSON.parse(data));
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
