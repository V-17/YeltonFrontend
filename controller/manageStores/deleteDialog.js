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

var storesDeleteDialog = {

    show: function()
    {
        var path = this.getView().byId("listStores").getSelectedContexts();

        if (path.length !== 0) {
            var model = this.getView().getModel().getProperty(path[0].sPath);
            var jsonModel = new sap.ui.model.json.JSONModel(model);
            this._oDeleteDialog = sap.ui.xmlfragment("yelton.view.manageStores.deleteDialog", this);
            this._oDeleteDialog.setModel(jsonModel);
            this._oDeleteDialog.open();
        } else {
            sap.m.MessageToast.show("Выберите магазин");
        }
    },

    apply: function()
    {
        var id = this._oDeleteDialog.getModel().getProperty("/id");
        var clientID = this._oDeleteDialog.getModel().getProperty("/clientID");

        var that = this;
        $.ajax({
                url: "/backend/web/services/manageStores.php",
                type: "DEL",
                data: {
                    id: id,
                    clientID: clientID
                },
            })
            .done(function(data, textStatus, jqXHR)
            {
                switch (jqXHR.status) {
                    case 200:
                        sap.ui.getCore().byId("pageManageStores").getModel().setData(JSON.parse(data));
                        break;
                    case 204:
                        sap.ui.getCore().byId("pageManageStores").getModel().setData();
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
                that._oDeleteDialog.destroy();
                that._oEditDialog.destroy();
            });
    },

    cancel: function()
    {
        this._oDeleteDialog.destroy();
    }
};
