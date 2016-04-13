<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, minimal-ui" />
    <title>Hello Coder</title>
</head>
<body>
    <div class="main">

        <!-- 未完成 -->
        <div class="slider-outer">
            <div class="slider-page" id="list-wrapper-doing"></div>

            <!-- 已完成 -->
            <div class="slider-page" id="list-wrapper-done">
                
            </div>

            <!-- 已撤销 -->
            <div class="slider-page" id="list-wrapper-cancel">
                
            </div>
        </div>

        <ul class="tab-page border border-top">
            <li data-name="doing">未完成</li>
            <li data-name="done">已完成</li>
            <li data-name="cancel">已撤销</li>
        </ul>

    </div>
    <script type="text/javascript" src="../dep/cordova.js"></script>
</body>
</html>