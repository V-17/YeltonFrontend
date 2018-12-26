/**
 * Либа различных техниеских (и не только) функций
 */

sap.ui.define([], function() {
    "use strict";

    // const LIB = {}; // для каких то внутренних настроек
    return {
        /**
         * Возвращает полную копию объекта
         */
        cloneObject: function(oObject) {
            try {
                return JSON.parse(JSON.stringify(oObject));
            } catch (e) {
                console.error(e);
                return {};
            }
        },

        /**
         * Проверка, корректное ли это число
         */
        isNumeric: function(n) {
            return !isNaN(parseFloat(n)) && isFinite(n);
        },

        getComponent: function()
        {
            return sap.ui.getCore().getComponent('component');
        },

        getRootView: function()
        {
            return this.getComponent().byId('splitAppView');
        },

        getSplitApp: function()
        {
            return this.getRootView().byId('splitApp');
        },

        getMainMenu: function() {
            return this.getRootView().byId('listMainMenu');
        }
    };

});
