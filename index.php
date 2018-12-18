<!DOCTYPE HTML>
<html>
    <head>
        <?php
            $y = '_yandexMetrika.php';
            $g = '_googleAnalytics.php';
            if(file_exists($y))
                include $y;
            if(file_exists($g))
                include $g;
        ?>

        <title>Yelton</title>
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta charset="UTF-8">
        <meta NAME="description" CONTENT="Ваш личный помощник в планировании выгодных покупок">
        <meta NAME="keywords" CONTENT="покупки, шопинг, экономия, планирование, выгода">
        <meta name="google-play-app" content="app-id=ru.yelton.android">

        <script
            src="/lib/3rd/openui5/1.60.2/resources/sap-ui-core.js"
            id="sap-ui-bootstrap"
            data-sap-ui-libs="sap.m"
            data-sap-ui-theme="sap_belize"
            data-sap-ui-bindingSyntax="complex"
            data-sap-ui-preload="async"
            data-sap-ui-resourceroots='{
                "yelton.view": "./view",
                "yelton.controller": "./controller",
                "yelton": "./",
                "yelton.control": "./control",
                "yelton.i18n": "./i18n"
            }'></script>
        <script src="lib/YeltonLib.js"></script>

        <?php
            include $_SERVER ['DOCUMENT_ROOT'].'/backend/'.'web/services/internal/sessions.php';

            // если пользователь залогинен - показыаем ему приложение
            if (\yelton\isSetUserID() === true) {
                echo '
                <script>
                    sap.ui.getCore().attachInit(function() {
                        new sap.ui.core.ComponentContainer({
                            name : "yelton"
                        }).placeAt("content");
                        document.title="Yelton";
                    });
                </script>';
            // иначе - index страницу
            } else {
                echo '
                <script>
                    sap.ui.getCore().attachInit(function() {
                        sap.m.App({
                            pages: [
                                sap.ui.xmlview({
                                    viewName : "yelton.view.index.V",
                                    type: sap.ui.core.mvc.ViewType.XML
                                })
                            ]
                        }).placeAt("content");
                    });
                </script>';
            }
         ?>
         <!-- <link rel="stylesheet" type="text/css" href="css/style.css"> -->
    </head>
    <body class="sapUiBody" role="application">
        <div id="content"/>
    </body>
</html>
