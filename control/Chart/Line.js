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
    "sap/ui/core/Control"

], function(Control) {
    "use strict";
    return Control.extend("yelton.control.Chart.Line", {
        metadata: {
            properties: {
                showLegend: {
                    type: "boolean",
                    defaultValue: false
                }
            }
        },

        init: function()
        {
            jQuery.sap.require("yelton.lib.3rd.chartjs.2_5_0.Chart");
        },

        onAfterRendering: function()
        {
            let ctx = document.getElementById(this.getId());

            this._chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: this._aLabels,
                    datasets: this._aData,
                },
                options: {
                    legend: {
                        display: this.getProperty("showLegend")
                    }
                }
            });
        },

        /*
         * Устанавливает подписи для оси X
         * @parameters aLabels - массив строк
         */
        setLabels: function(aLabels)
        {
            this._aLabels = aLabels;
            if (this._chart) {
                this._chart.data.labels = aLabels;
                this._chart.update();
            }
        },

        /**
         * Установить заголовок
         */
        setTitle: function(sTitle)
        {
            this._chart.options.title.display = true;
            this._chart.options.title.text = sTitle;
            // fixme: тут нужен не render и update, а походу че-то другое.
            this._chart.update();
        },


        /**
         * Устанавливаем линию на графике
         *
         * @todo расширить для возможности добавлять много линий на график
         * @todo опиши формат
         */
        setLine: function(oLine)
        {
            // это я пока заполняю по дефолту
            // но было бы неплохо дать возможность настраивать это снаружи контрола
            oLine.backgroundColor = "rgba(75,192,192,0.4)";
            oLine.borderColor = "rgba(75,192,192,1)";
            oLine.fill = false;

            this._aData = [oLine];
            if (this._chart) {
                this._chart.data.datasets = [oLine];
                //this._chart.data.datasets.push(oLine);  // буду юзать, когда добавлю возможность множественных линий на графике
                this._chart.update();
            }
        },

        renderer: function(oRM, oControl)
        {
            oRM.write("<canvas");
            oRM.writeControlData(oControl);
            oRM.write("</canvas>");
        }
    });
});
