/*
 * Copyright 2016 - 2018 Yelton authors:
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
    "sap/ui/model/resource/ResourceModel"
], function(Controller, JSONModel, ResourceModel) {
    "use strict";
    return Controller.extend("yelton.controller.index", {

        onInit: function()
        {
            // index-page не юзает Component.js, поэтому тут нужо "вручную" прицепить локализацию
            var i18nModel = new ResourceModel({
                bundleName: "yelton.i18n.i18n"
            });
            this.getView().setModel(i18nModel, "i18n");

            let that = this;
            $.get(
                "/backend/web/services/getNews.php"
            ).done(function(answer) {
                answer = JSON.parse(answer);
                answer.forEach(function(item, index) {
                    item.subject = item.subject.toUpperCase();
                    if (index === 0) answer[0].expanded = true;
                });

                that.getView().setModel(new JSONModel(answer), 'news');
            });
        },

        gotoGooglePlay: function()
        {
            sap.m.URLHelper.redirect(
                "https://play.google.com/store/apps/details?id=ru.yelton.android&utm_source=yelton.ru&utm_medium=organic&utm_campaign=site",
                true
            );
        },

        gotoGitHub: function()
        {
            sap.m.URLHelper.redirect("https://github.com/msproduction", true);
        },

        gotoVK: function()
        {
            sap.m.URLHelper.redirect("https://vk.com/yelton", true);
        },

        handlePopoverPress: function(oEvent)
        {
            // create popover
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("yelton.view.index.loginMenu", this);
            }
            this.getView().addDependent(this._oPopover);
            this._oPopover.openBy(oEvent.getSource());

            // это чтобы логин и пароль на обоих вкладках одновременно одинаковыми были
            let oData = [{
                login: null,
                password: null
            }];
            let model = new JSONModel(oData);
            this._oPopover.setModel(model);
        },

        beforePopoverOpen: function(oEvent)
        {
            // на телефонах надо показывать заголовок с кнопкой "Закрыть"
            if (!oEvent.getParameters().openBy) {
                let sId = oEvent.getSource().getId();
                sap.ui.getCore().byId(sId).setShowHeader(true);
            }
        },

        _onButtonSignInPress: function()
        {
            let login = sap.ui.getCore().byId("inputSignInLogin").getValue();
            let password = sap.ui.getCore().byId("inputSignInPassword").getValue();
            let textView = sap.ui.getCore().byId("textViewSignIn");
            let that = this;

            $.ajax({
                    url: "/backend/web/services/signIn.php",
                    type: "POST",
                    data: {
                        login: login,
                        password: password
                    }
                })
                .done(function(data) {
                    if (data.trim() == "ok") {
                        window.location.reload();
                    } else {
                        textView.setText("Неправильный логин/пароль");
                    }
                });
        },

        /**
         * При нажании на кнопку "Зарегестрироваться"
         */
        _onButtonSignUpPress: function()
        {
            let login = sap.ui.getCore().byId("inputSignUpLogin").getValue();
            let password = sap.ui.getCore().byId("inputSignUpPassword").getValue();
            let email = sap.ui.getCore().byId("inputSignUpEmail").getValue();
            let textView = sap.ui.getCore().byId("textViewSignUp");

            let out;
            let that = this;
            if (email.length > 0) {
                out = {
                    login: login,
                    password: password,
                    email: email
                };
            } else {
                out = {
                    login: login,
                    password: password
                };
            }

            $.ajax({
                    url: "/backend/web/services/signUp.php",
                    type: "POST",
                    data: out
                })
                .done(function(data) {
                    if (data.trim() == "ok") {
                        window.location.reload();
                    } else {
                        textView.setText(data.trim());
                    }
                });
        },

        _onPopupSelect: function(e)
        {
            let newTab = e.getParameters().key;
            switch (newTab) {
                case "tabSignUp":
                    sap.ui.getCore().byId("textViewSignIn").setText();
                    break;
                case "tabSignIn":
                    sap.ui.getCore().byId("textViewSignUp").setText();
                    break;
            }
        },

        // onDonateButtonPress: function()
        // {
        //     sap.m.URLHelper.redirect(
        //         "https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=USC23UYZAKQXA&lc=RU&item_name=Yelton%2eru&currency_code=RUB&bn=PP%2dDonationsBF%3abtn_donate_LG%2egif%3aNonHosted",
        //         true);
        // }
    });
});
