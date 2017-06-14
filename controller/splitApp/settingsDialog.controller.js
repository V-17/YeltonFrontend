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

sap.ui.define([
        "sap/ui/core/mvc/Controller",
        "sap/ui/model/json/JSONModel"
    ],
    function(Controller, JSONModel) {
        "use strict";
        return Controller.extend("yelton.controller.splitApp.settingsDialog", {

            onChangePasswordPress: function()
            {
                let textView = sap.ui.getCore().byId("textViewChangePassword");
                let out = {
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
                        textView.setSemanticColor("Positive");
                        textView.setText("{i18n>passwordChanged}");
                    })
                    .fail(function(answer) {
                        if (answer.status === 401) {
                            window.location.reload();
                        } else {
                            textView.setSemanticColor("Negative");
                            textView.setText(answer.responseText);
                        }
                    })
                    .always(function() {
                        sap.ui.getCore().byId("inputOldPassword").setValue();
                        sap.ui.getCore().byId("inputNewPassword").setValue();
                    });
            },

            onChangeEmailPress: function()
            {
                //FIXME: по нормальному нужно получать id
                let splitAppID = "__xmlview0--splitApp";
                let textView = sap.ui.getCore().byId("textViewChangeEmail");
                let out = {
                    email: sap.ui.getCore().byId("inputNewEmail").getValue()
                };
                $.ajax({
                        url: "backend/web/services/user.php",
                        type: "POST",
                        data: {
                            changeEmail: JSON.stringify(out)
                        }
                    })
                    .done(function() {
                        textView.setSemanticColor("Positive");
                        textView.setText("{i18n>emailChanged}");
                        sap.ui.getCore().byId(splitAppID).getModel("user").loadData("backend/web/services/user.php");
                    })
                    .fail(function(answer) {
                        if (answer.status === 401) {
                            window.location.reload();
                        } else {
                            textView.setSemanticColor("Negative");
                            textView.setText(answer.responseText);
                        }
                    })
                    .always(function() {
                        sap.ui.getCore().byId("inputNewEmail").setValue();
                    });
            },

            onClose: function()
            {
                sap.ui.getCore().byId("dialogSettings").destroy();
            },

            /**
             * Удаление выбранного девайса
             */
            onDeleteDevice: function(oEvent)
            {
                let oList = oEvent.getSource();
                let oItem = oEvent.getParameter("listItem");
                let iClientID = oItem.getBindingContext("user").getProperty().clientID;

                let dialog = new sap.m.Dialog({
                    title: "{i18n>deleteDeviceQuestion}",
                    type: "Message",
                    content: new sap.m.Text({
                        text: "{i18n>deleteDeviceWarning}"
                    }),
                    initialFocus: "buttonNo",
                    beginButton: new sap.m.Button({
                        text: "{i18n>yes}",
                        type: "Reject",
                        press: function() {
                            $.ajax({
                                    url: "/backend/web/services/user.php",
                                    type: "DEL",
                                    data: {
                                        "device": JSON.stringify({
                                            "clientID": iClientID
                                        })
                                    },
                                })
                                .done(function(data, textStatus, jqXHR) {
                                    switch (jqXHR.status) {
                                        case 200:
                                            sap.ui.getCore().byId("dialogSettings").getModel("user").setData(
                                                JSON.parse(data));
                                            break;
                                    }
                                })
                                .fail(function(answer) {
                                    switch (answer.status) {
                                        case 401:
                                            window.location.reload();
                                            break;
                                        case 500:
                                            sap.m.sap.m.MessageToast.show("{i18n>unexpectedError}");
                                            break;
                                    }
                                });

                            dialog.close();
                        }
                    }),
                    endButton: new sap.m.Button("buttonNo", {
                        text: "{i18n>no}",
                        press: function() {
                            dialog.close();
                        }
                    }),
                    afterClose: function() {
                        dialog.destroy();
                    }
                });
                //this.getView().addDependent(dialog);
                dialog.open();
            }
        });
    });
