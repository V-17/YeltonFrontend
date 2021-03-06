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

var productsDeleteDialog = {

    show: function()
    {
        let path = this.getView().byId("listProducts").getSelectedContexts();

        if (path.length !== 0) {
            let model = this.getView().getModel("products").getProperty(path[0].sPath);
            let jsonModel = new sap.ui.model.json.JSONModel(model);
            this._oDeleteDialog = sap.ui.xmlfragment("yelton.view.manageProducts.deleteDialog", this);
            this.getView().addDependent(this._oDeleteDialog);
            this._oDeleteDialog.setModel(jsonModel);
            this._oDeleteDialog.open();
        } else {
            sap.m.MessageToast.show("{i18n>selectProduct}");
        }
    },

    apply: function()
    {
        let id = this._oDeleteDialog.getModel().getProperty("/id");
        let clientID = this._oDeleteDialog.getModel().getProperty("/clientID");

        let that = this;
        $.ajax({
                url: "/backend/web/services/manageProducts.php",
                type: "DEL",
                data: {
                    id: id,
                    clientID: clientID
                }
            })
            .done(function(data)
            {
                if (!data) data = null; // for "204 - no content" answer
                new Dict().setProducts(JSON.parse(data));
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
                that._oEditDialog.destroy();
                that._oDeleteDialog.destroy();
            });
    },

    cancel: function()
    {
        this._oDeleteDialog.destroy();
    }
};
