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

/**
 * Тут собрана работа со справочникми
 * @type {Object}
 */
function Dict()
{

    /**
     * Обновляем категории (снова тянем с бэкенда)
     * @return {[type]} [description]
     */
    this.refreshCategories = function()
    {
        getData("backend/web/services/manageCategories.php", "categories");
    };

    /**
     * Обновляем
     * @return {[type]} [description]
     */
    this.refreshPrices = function()
    {
        getData("backend/web/services/managePrices.php", "prices");
    };

    /**
     * Обновляем
     * @return {[type]} [description]
     */
    this.refreshProducts = function()
    {
        getData("backend/web/services/manageProducts.php", "products");
    };

    /**
     * Обновляем
     * @return {[type]} [description]
     */
    this.refreshStores = function()
    {
        getData("backend/web/services/manageStores.php", "stores");
    };

    /**
     * Обновляем
     * @return {[type]} [description]
     */
    this.refreshUnits = function()
    {
        getData("backend/web/services/manageUnits.php", "units");
    };

    /**
     * Пишем данные в модель
     * @param {[type]} oCategories [description]
     */
    this.setCategories = function(oCategories)
    {
        setData(oCategories, "categories");
    };

    /**
     * Пишем данные в модель
     * @param {[type]} oCategories [description]
     */
    this.setPrices = function(oPrices)
    {
        setData(oPrices, "prices");
    };

    /**
     * Пишем данные в модель
     * @param {[type]} oCategories [description]
     */
    this.setProducts = function(oProducts)
    {
        setData(oProducts, "products");
    };

    /**
     * Пишем данные в модель
     * @param {[type]} oCategories [description]
     */
    this.setStores = function(oStores)
    {
        setData(oStores, "stores");
    };

    /**
     * Пишем данные в модель
     * @param {[type]} oCategories [description]
     */
    this.setUnits = function(oUnits)
    {
        setData(oUnits, "units");
    };

    //----------------------------------------------------------------------------------------------------------------//
    //----------------------------------------------- PRIVATE --------------------------------------------------------//
    //----------------------------------------------------------------------------------------------------------------//

    /**
     * [getData description]
     * @private
     * @param  {[type]} sUrl       [description]
     * @param  {[type]} sModelName [description]
     * @param  {[type]} oData      [description]
     * @return {[type]}            [description]
     *
     */
    var getData = function(sUrl, sModelName)
    {
        $.ajax({
                url: sUrl,
                type: "GET"
            })
            .done(function(data)
            {
                if (!data) data = null; // for "204 - no content" answer
                let model = new sap.ui.model.json.JSONModel(JSON.parse(data));

                // было бы круто, ложить все эти модели в sap.ui.getCore().setModel()
                // Но если так делать, тогда почему-то биндинг UI элементов не работает напрямую
                sap.ui.getCore().byId("__xmlview0--splitApp").setModel(model, sModelName);
                model.setSizeLimit(model.getData().length + 1);
            })
            .fail(function(answer)
            {
                if (answer.status === 401) {
                    window.location.reload();
                }
            });
    };

    /**
     * Функция, которая принимает на вход данные и обновляет ими модель
     *
     * Когда используется: backend в ответах на POST/DEL-запросы в случае успеха тут же отдаёт новые данные.
     * т.е. вместо того, чтобы делать POST/DEL, а потом еще раз идти на сервер с GET-запросом мы получаем 2в1.
     * На мой взгляд, это хорошее решение.
     *
     * Вот эта самая функция как раз и принимает на вход те данные, что будут возвращать POST/DEL-запросы
     * и обновлять ими модель, чтобы лишний раз не делать refreshXXX()
     *
     * @private
     */
    var setData = function(oData, sModelName)
    {
        let model = new sap.ui.model.json.JSONModel(oData);
        // было бы круто, ложить все эти модели в sap.ui.getCore().setModel()
        // Но если так делать, тогда почему-то биндинг UI элементов не работает напрямую
        sap.ui.getCore().byId("__xmlview0--splitApp").setModel(model, sModelName);
        model.setSizeLimit(model.getData().length + 1);
    };
}
