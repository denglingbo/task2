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
    
        <div class="slider-container">
            <div class="slider-outer">

                <!-- 未完成 -->
                <div class="slider-page" id="list-wrapper-doing" data-name="doing">
                    <div class="scroll-inner">
                        <div class="list-wrapper-content"><!-- Content --></div>
                        <div class="scroll-loader hide">获取更多 doing</div>
                    </div>
                </div>

                <!-- 已完成 -->
                <div class="slider-page" id="list-wrapper-done" data-name="done">
                    <div class="scroll-inner">
                        <div class="list-wrapper-content">done</div>
                        <div class="scroll-loader hide">获取更多 done</div>
                    </div>
                </div>

                <!-- 已撤销 -->
                <div class="slider-page" id="list-wrapper-cancel" data-name="cancel">
                    <div class="scroll-inner">
                        <div class="list-wrapper-content">cancel</div>
                        <div class="scroll-loader hide">获取更多 cancel</div>
                    </div>
                </div>

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