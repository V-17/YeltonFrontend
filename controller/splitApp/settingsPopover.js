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

var settings = {

    showPopover: function()
    {
        if (!this._oPopover) {
            this._oPopover = sap.ui.xmlfragment("yelton.view.splitApp.settingsPopover", this);
        }
        this.getView().addDependent(this._oPopover);
        this._oPopover.openBy(this.byId("buttonSettings"));
    },

    showSettings: function()
    {
        let oCtrl = sap.ui.controller("yelton.controller.splitApp.settingsDialog");
        let settignsDialog = sap.ui.xmlfragment("yelton.view.splitApp.settingsDialog", oCtrl);
        // onInit там не работает, поэтому придется грузить модель тут
        this.getView().addDependent(settignsDialog);
        settignsDialog.open();
    },

    logout: function()
    {
        $.post("backend/web/services/signOut.php");
        window.location.reload();
    }
};
