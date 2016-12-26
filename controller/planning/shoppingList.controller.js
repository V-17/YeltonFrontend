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
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function(Controller, JSONModel, Filter, FilterOperator) {
    "use strict";
    return Controller.extend("yelton.controller.planning.shoppingList", {

        onNavBackPress: function()
        {
            // ugly hack
            this.getView()._oRouter.navTo("planning");
        },

        // Поиск
        onFilterLiveSearch: function(oEvent)
        {
            let sQuery = oEvent.getParameter("newValue");
            let list = this.getView().byId("listUnselectedProducts");
            list.getBinding("items").filter(
                new Filter([
                    new Filter("categoryName", FilterOperator.Contains, sQuery),
                    new Filter("name", FilterOperator.Contains, sQuery)
                ])
            );
        },

        /**
         * При выборе товара из списка
         * @param  {[type]} oEvent [description]
         * @return {[type]}        [description]
         */
        onSelectProduct: function(oEvent)
        {
            // Индекс выделенного элемента
            let index = parseInt(oEvent.getParameters().listItem.getBindingContext("unselected").sPath.split("/")[1]);

            let mSelected = this.getView().getModel("selected");
            let mUnselected = this.getView().getModel("unselected");

            // перемещаем этот элемент в другую модель
            mSelected.getData().push(mUnselected.getData()[index]);
            mUnselected.getData().splice(index, 1);
            mSelected.refresh();
            mUnselected.refresh();
            this.updateButtons();
        },

        /**
         * Удаление выбранного товара из списка
         * @param  {[type]} oEvent [description]
         */
        onDeleteProduct: function(oEvent)
        {
            // Индекс выделенного элемента
            let index = parseInt(oEvent.getParameters().listItem.getBindingContext("selected").sPath.split("/")[1]);

            let mSelected = this.getView().getModel("selected");
            let mUnselected = this.getView().getModel("unselected");

            // перемещаем этот элемент в другую модель
            mUnselected.getData().push(mSelected.getData()[index]);
            mSelected.getData().splice(index, 1);
            mSelected.refresh();
            mUnselected.refresh();
            this.updateButtons();
        },

        /**
         * Функция для обновления счётчика выбранных товаров и кнопки "Далее"
         * @return {[type]} [description]
         */
        updateButtons: function()
        {
            let aSelected = this.getView().getModel("selected").getData();

            this.byId("buttonBasket")
                .setEnabled(aSelected.length > 0)
                .setText(aSelected.length);

            this.byId("buttonNext")
                .setEnabled(aSelected.length > 0);
        },

        /**
         * При нажатии на иконку просмотра выбранных покупок
         * @param  {[type]} oEvent [description]
         */
        onShowSelectedProductsPress: function(oEvent)
        {
            if (!this._oPopover) {
                this._oPopover = sap.ui.xmlfragment("yelton.view.planning.shoppingListPopover", this);
                this.getView().addDependent(this._oPopover);
            }
            this._oPopover.openBy(oEvent.getSource());
        },

        /**
         * Переход на страницу результатов
         * @param  {[type]} evt [description]
         */
        onGetResultPress: function(evt)
        {
            let oNavCon = this.byId("navCon");
            oNavCon.setBusy(true);
            let aOut = [];
            let aSelected = this.getView().getModel("selected").getData();
            for (let oItem of aSelected) {
                aOut.push({
                    id: oItem.id,
                    clientID: oItem.clientID
                });
            }

            let that = this;
            $.ajax({
                    url: "backend/web/services/planning.php",
                    type: "POST",
                    data: {
                        "shoppingList": JSON.stringify(aOut)
                    }
                })
                .done(function(answer)
                {
                    that.getView().setModel(new JSONModel(JSON.parse(answer)), "shoppingList");
                    that.byId("navCon").to(that.byId("page2"));
                })
                .fail(function(answer)
                {
                    if (answer.status === 401) {
                        window.location.reload();
                    }
                })
                .always(function()
                {
                    oNavCon.setBusy(false);
                });
        },

        /**
         * При нажатии кнопки "Назад" на странице
         */
        onBackPress: function()
        {
            this.byId("navCon").back();
        }
    });
});
