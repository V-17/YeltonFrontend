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

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel",
        'sap/m/MessageToast'
    ],
    function(Controller, JSONModel, MessageToast) {
        "use strict";
        return Controller.extend("controller.settings", {

            onChangePasswordPress: function()
            {
                var out = {
                    oldPassword: sap.ui.getCore().byId("inputOldPassword").getValue(),
                    newPassword: sap.ui.getCore().byId("inputNewPassword").getValue()
                };
                $.ajax({
                        url: 'backend/web/services/user.php',
                        type: 'POST',
                        data: {
                            password: JSON.stringify(out)
                        }
                    })
                    .done(function() {
                        MessageToast.show("Пароль успешно изменен");
                    })
                    .fail(function(data) {
                        MessageToast.show(data.responseText);
                    })
                    .always(function() {
                        sap.ui.getCore().byId("inputOldPassword").setValue();
                        sap.ui.getCore().byId("inputNewPassword").setValue();
                    });
            },

            onClose: function()
            {
                sap.ui.getCore().byId("dialogSettings").destroy();
            }
        });
    });
