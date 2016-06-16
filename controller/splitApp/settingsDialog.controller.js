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
        "sap/ui/model/json/JSONModel"
    ],
    function(Controller, JSONModel) {
        "use strict";
        return Controller.extend("yelton.controller.splitApp.settingsDialog", {

            onChangePasswordPress: function()
            {
                var textView = sap.ui.getCore().byId("textViewChangePassword");
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
                        textView.setSemanticColor("Positive");
                        textView.setText("Пароль успешно изменен");
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
                var splitAppID = "__xmlview0--splitApp";
                var textView = sap.ui.getCore().byId("textViewChangeEmail");
                var out = {
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
                        textView.setText("Email успешно изменен");
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
                var oList = oEvent.getSource();
                var oItem = oEvent.getParameter("listItem");
                var iClientID = oItem.getBindingContext("user").getProperty().clientID;

                var dialog = new sap.m.Dialog({
                    title: "Отключить мобильное устройство?",
                    type: "Message",
                    content: new sap.m.Text({
                        text: "Все несинхронизированные на нём данные будут утеряны.\n" +
                            "А также потребуется повторный вход в аккаунт"
                    }),
                    initialFocus: "buttonNo",
                    beginButton: new sap.m.Button({
                        text: "Да",
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
                                .done(function(data, textStatus, jqXHR)
                                {
                                    switch (jqXHR.status) {
                                        case 200:
                                            sap.ui.getCore().byId("dialogSettings").getModel("user").setData(
                                                JSON.parse(data));
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
                                });

                            dialog.close();
                        }
                    }),
                    endButton: new sap.m.Button("buttonNo", {
                        text: "Нет",
                        press: function() {
                            dialog.close();
                        }
                    }),
                    afterClose: function() {
                        dialog.destroy();
                    }
                });

                dialog.open();
            }
        });
    });
