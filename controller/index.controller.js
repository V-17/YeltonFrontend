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
    ],
    function(Controller, JSONModel) {
        "use strict";
        return Controller.extend("controller.index", {

            onInit: function() {

            },


            goToGooglePlay: function()
            {
                sap.m.URLHelper.redirect("https://play.google.com/store/apps/details?id=ru.yelton.android");
            },

            handlePopoverPress: function(oEvent)
            {
                // create popover
                if (!this._oPopover) {
                    this._oPopover = sap.ui.xmlfragment("view.index.loginMenu", this);
                }
                this._oPopover.openBy(this.byId("buttonLogin"));

                // это чтобы логин и пароль на обоих вкладках одновременно одинаковыми были
                var oData = [{
                    login: null,
                    password: null
                }];
                var model = new JSONModel(oData);
                this._oPopover.setModel(model);
            },

            _onButtonSignInPress: function()
            {
                var login = sap.ui.getCore().byId("inputSignInLogin").getValue();
                var password = sap.ui.getCore().byId("inputSignInPassword").getValue();

                $.post(
                    "/backend/web/services/signIn.php", {
                        login: login,
                        password: password
                    },
                    onAjaxSuccess
                );

                function onAjaxSuccess(data) {
                    if (data.trim() == "ok") {
                        document.location = '/index.php';
                    } else {
                        sap.m.MessageToast.show("Неправильный логин/пароль");
                    }
                }
            },

            _onButtonSignUpPress: function()
            {
                var login = sap.ui.getCore().byId("inputSignUpLogin").getValue();
                var password = sap.ui.getCore().byId("inputSignUpPassword").getValue();
                var email = sap.ui.getCore().byId("inputSignUpEmail").getValue();

                var data;
                if (email.length > 0) {
                    data = {
                        login: login,
                        password: password,
                        email: email
                    };
                } else {
                    data = {
                        login: login,
                        password: password
                    };
                }

                $.post(
                    "/backend/web/services/signUp.php",
                    data,
                    onAjaxSuccess
                );


                function onAjaxSuccess(data)
                {
                    if (data.trim() == "ok") {
                        document.location = '/index.php';
                    } else {
                        sap.m.MessageToast.show(data.trim());
                    }
                }
            },

            onDonateButtonPress: function()
            {
                sap.m.URLHelper.redirect("https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=USC23UYZAKQXA&lc=RU&item_name=Yelton%2eru&currency_code=RUB&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted", true);
            }
        });
    });
