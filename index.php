<!--
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
-->
<!DOCTYPE HTML>
<html>
    <head>
        <title>Yelton - выгодные покупки</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta charset="UTF-8">
        <meta NAME="description" CONTENT="Ваш личный помощник в планировании выгодных покупок">
        <meta NAME="keywords" CONTENT="покупки, шопинг, экономия, планирование, выгода">

        <script
            src="/openui5/1.34.8/resources/sap-ui-core.js"
            id="sap-ui-bootstrap"
            data-sap-ui-libs="sap.m"
            data-sap-ui-theme="sap_bluecrystal"
            data-sap-ui-bindingSyntax="complex"
            data-sap-ui-resourceroots='{
					 "view": "./view",
					 "controller": "./controller"
				}'></script>
        <script src="core/lib.js"></script>

		<?php
            // Провекра логина
            if (session_status() == PHP_SESSION_NONE) {
                session_start();
            }
            // если пользователь не залогинен - показыаем ему index страницу
            if (empty($_SESSION['userID'])) {
                echo '
				<script>
					sap.ui.localResources("view");
					new sap.m.Shell({
						app: sap.ui.view({viewName: "view.index.V", type: sap.ui.core.mvc.ViewType.XML})
					}).placeAt("content");
				</script>';
            // иначе - норм приложуху
            } else {
                echo '
				<script>
					sap.ui.localResources("view");
					new sap.m.Shell({
						app: sap.ui.view({viewName: "view.splitApp", type: sap.ui.core.mvc.ViewType.XML})
					}).placeAt("content");
				</script>';
            }
         ?>

         <link rel="stylesheet" type="text/css" href="css/my.css">

    </head>
    <body class="sapUiBody" role="application">
		<div id="content"/>
    </body>
</html>
