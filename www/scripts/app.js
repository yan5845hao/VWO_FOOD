/**
 * Created by yanhao on 15/12/15.
 */
$(function () {

    $('.vwo-page').height($(window).height());

    // page stack
    var URLMAPS = new Object();
    //var stack = [];
    var $container = $('.js_container');
    //location.hash = "";

    $container.on('click', '.btn[data-id]', function () {
        var id = $(this).data('id');
        go("#" + id);
    });

    var currentStack = undefined;
    // location.hash = '#hash1' 和点击后退都会触发`hashchange`，这个demo页面只关心后退
    $(window).on('hashchange', function (e) {
        var stack = URLMAPS[e.newURL];
        if(stack == undefined){
            var el = $($(location.hash + '_html').html()).addClass('slideIn');
            if(el){
                URLMAPS[URL] = stack = el;
            }
        }

        $container.append(stack);
        $(stack).addClass('slideIn').on('webkitAnimationEnd', function (){
            $(this).removeClass('slideIn');
            if(currentStack)
                $(currentStack).remove();
            currentStack = stack;
        }).on('animationend', function (){
            $(this).removeClass('slideIn');
            if(currentStack)
                $(currentStack).remove();
            currentStack = stack;
        });
    });

    function go(id){
        location.hash = id;
    }

    var hash = location.hash;
    if(/#.*/gi.test(location.href))
        location.hash = "";
    go((/#.*/gi.test(hash))?hash:'#home');


    function toFixed2 (num) {
        return parseFloat(+num.toFixed(2));
    }

    var clip = new photoClip('.vwo-page',{
        width: 200,
        height: 200,
        strictSize: false
    });

    $container.on("touchstart",".photo-clip-area",function(event){
        var touchPros = event.touches[0];
        startX = touchPros.pageX;
        startY = touchPros.pageY;
        ctop = $(this)[0].offsetTop;
        cleft = $(this)[0].offsetLeft;
        return false;
    }).on("touchmove",".photo-clip-area",function(event){
        var touchPros = event.touches[0];
        moveX = touchPros.pageX - startX + cleft;
        moveY = touchPros.pageY - startY + ctop;
        $(this).css({
            "top":(moveY) + 'px',
            "left":(moveX) + 'px',
            "position": "absolute"
        });
        clip.initCss(moveY, moveX);
    });

    // 获取相片
    $container.on('change', '#cameraInput', function(e){
        var that = this;
        lrz(that.files[0], {
            width: 800
        }).then(function (rst) {
            var	sourceSize = toFixed2(that.files[0].size / 1024),
                resultSize = toFixed2(rst.fileLen / 1024),
                scale = parseInt(100 - (resultSize / sourceSize * 100));
            img = new Image();
            img.src = rst.base64;
            clip.createImg(rst.base64);
            return rst;
        });
        clip.init();
    });

    //删除图片
    $container.on('click', '.imgRemove', function(){
        $(this).parents('li').remove();
    });

    //切图
    $container.on('click', '.cut', function(){
        var dataUrl = clip.clipImg();
        $('#camer-image').before('<li class="text-center vwo-p05" style="width: 30%; float: left; ">' +
            '<div class="food-group">' +
                '<i class="imgRemove"></i>' +
                '<img src="' + dataUrl + '">' +
            '</div>' +
        '</li>');
    });
    // 助力
    $container.on('click', '.foodHelp', function () {
        $(this).find('img').attr('src', "images/help_btn2_pressed.png");
        $(this).append("<span>+12</span>");
    });
    // 使用说明
    $container.on('click', '.instructions', function(){
        $('.detail-dialog').show();
        $('.detail-dialog').find('.detail-close').on('click', function () {
            $('.detail-dialog').hide();
        });
    });

    // TAB页面切换
    $container.on('click', '.tab', function(){
        $('.tab').removeClass('active');
        $(this).addClass('active');
        $('.content').removeClass('active');
        $('.' + $(this).attr('data-id')).addClass('active');
    });

    // 二维码弹窗
    $container.on('click', '.foodQrcode', function(){
        $('.qrcode-dialog').show();
        $('.img-qrcode').attr('src','images/face.png');
        $('.qrcode-dialog').find('.detail-close').on('click', function () {
            $('.qrcode-dialog').hide();
        });
    });

});


function photoClip(container, option) {
    var clipWidth = option.width,		//截图的宽度
        clipHeight = option.height,		//截图的高度
        strictSize = option.strictSize;

    var $img,
        $imgWidth, $imgHeight, //图片当前的宽高
        imgLoaded; //图片是否已经加载完成

    var img,//原始图片
        imageWidth, imageHeight;//图片当前的宽高
    var canvas,ctx,
        canvasW,canvasH;

    var $container, // 容器，包含裁剪视图层和遮罩层
        canvas, // 图片裁剪用到的画布
        containerWidth,
        containerHeight;

    var $clip,$imageView,$clipArea,$maskTop,$maskLeft,$maskBottom,$maskRight;
    self = this;
    this.init = function(){
        if($clip){
            $clip.show();
        } else {
            containerWidth = $(window).width();
            containerHeight = $(window).height();
            initView();
            initClip();
        }
        var $win = $(window);
        resize();
        $win.resize(resize);
    }

    this.initCss = function(top, left){
        $imageView.css({
            "position": "absolute",
            "z-index":2
        });
        $clipArea.css({
            'border':'1px dashed rgb(221, 221, 221)',
            "position": "absolute",
            "width": clipWidth + 'px',
            "height":clipHeight + 'px',
            "top":top + 'px',
            'left':left + 'px',
            'z-index':4
        });
        $maskTop.css({
            "position": "absolute",
            "top": 0,
            "width": containerWidth + 'px',
            "height":top + 'px',
            "background-color": "rgba(0,0,0,.5)",
            "z-index":3
        });
        $maskLeft.css({
            "position": "absolute",
            "left": 0,
            "top": top + 'px',
            "width": left + 'px',
            "height": clipHeight + 'px',
            "background-color": "rgba(0,0,0,.5)",
            "z-index":3
        });
        $maskBottom.css({
            "position": "absolute",
            "bottom": 0,
            "width": containerWidth + 'px',
            "height":containerHeight-clipHeight-top + 'px',
            "background-color": "rgba(0,0,0,.5)",
            "z-index":3
        });
        $maskRight.css({
            "position": "absolute",
            "right": 0,
            "top": top + 'px',
            "width": (containerWidth-clipWidth-left) + 'px',
            "height": clipHeight + 'px',
            "background-color": "rgba(0,0,0,.5)",
            "z-index":3
        });
    }

    var atRotation, // 是否正在旋转中
        curX, // 旋转层的当前X坐标
        curY, // 旋转层的当前Y坐标
        curAngle; // 旋转层的当前角度

    /**
     * 清除画布
     */
    function clearCanvas() {
        ctx.clearRect(0, 0, canvasW,canvasH);
    }

    /**
     * 将旋转过后的画布内容取出来并重新创建画布
     * @param {Object} w 画布的宽
     * @param {Object} h 画布的高
     */
    function createCanvas(w,h){
        /**得到旋转后的img对象 —— BUG 在获取到img后，旋转就错乱了**/
        var data = ctx.getImageData(0,0,w,h);
        ctx.clearRect(0, 0, w,h);
        /**重设画布的宽高**/
        //canvasH = h;canvasW =w;
        //imgWidth = w, imgHeight = h;
        /**将旋转后的得到的图片覆盖以前的画布**/
            //canvas = document.getElementById('vwo-canvas');
        canvas.width = w;
        canvas.height = h;
        ctx = canvas.getContext("2d");
        ctx.globalAlpha = 1;
        ctx.putImageData(data,0,0);
        img = new Image();
        img.src =  canvas.toDataURL();
        createImg(canvas.toDataURL());
    }

    function initClip() {
        canvas = document.createElement("canvas");
        canvas.id = "vwo-canvas";
        //canvas.setAttribute("id", "vwo-canvas");
        canvas.width = clipWidth;
        canvas.height = clipHeight;
    }
    this.clipImg = function() {
        if (!imgLoaded) {
            alert("亲，当前没有图片可以裁剪!");
            $('.vwo-clip').hide();
            return;
        }

        var local = {
            x:$($clipArea)[0].offsetLeft - $($imageView)[0].offsetLeft,
            y:$($clipArea)[0].offsetTop - $($imageView)[0].offsetTop
        };

        var ctx = canvas.getContext("2d");
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();

        var scale = getScale(imageWidth, imageHeight, $imgWidth, $imgHeight);
        if (strictSize) {
            ctx.scale(scale, scale);
        } else {
            canvas.width = clipWidth / scale;
            canvas.height = clipHeight / scale;
        }
        ctx.translate(-local.x / scale, -local.y / scale);
        ctx.rotate(curAngle * Math.PI / 180);

        ctx.drawImage($img[0], 0, 0);
        ctx.restore();

        var dataURL = canvas.toDataURL("image/jpeg");
        $('.vwo-clip').hide();
        return dataURL;
    }

    function resize() {
        containerWidth = $(window).width();
        containerHeight = $(window).height();
    }

    function getScale(w1, h1, w2, h2) {
        var sx = w1 / w2;
        var sy = h1 / h2;
        return sx > sy ? sx : sy;
    }

    this.createImg = function (src) {
        if ($img && $img.length) {
            // 删除旧的图片以释放内存，防止IOS设备的webview崩溃
            $img.remove();
            delete $img[0];
        }
        $img = $("<img>").css({
            "user-select": "none",
            "pointer-events": "none"
        });

        imgLoaded = true;
        $img.attr("src", src); // 设置图片base64值
        $imageView.append($img);

        imageWidth = $imgWidth = $img.width();
        imageHeight = $imgHeight = $img.height();
        if(imageWidth <= clipWidth){
            imageHeight = parseFloat(clipWidth/imageWidth)*imageHeight;
            imageWidth = clipWidth;
        }else if(imageWidth > containerWidth){
            imageHeight = parseFloat(containerWidth/imageWidth)*imageHeight;
            imageWidth = containerWidth;
        }

        if(imageHeight <= clipHeight){
            imageWidth = parseFloat(clipHeight/imageHeight)*imageWidth;
            imageHeight = clipHeight;
        }else if(imageHeight > containerHeight){
            imageWidth = parseFloat(containerHeight/imageHeight)*imageWidth;
            imageHeight = containerHeight;
        }

        $imageView.css({
            width:imageWidth + 'px',
            height:imageHeight + 'px',
            top: parseFloat(containerHeight-imageHeight)/2 + 'px',
            left: parseFloat(containerWidth-imageWidth)/2 + 'px'
        });

        $img.css({
            'width':'100%'
        });

    }

    // 初始化容器
    var initView = function() {
        // 初始化容器
        $container = $(container).css({
            "user-select": "none",
            "overflow": "hidden"
        });
        if ($container.css("position") == "static")
            $container.css("position", "relative");

        $clip = $("<div class='vwo-clip'>").appendTo($container);

        $imageView = $("<div class='photo-clip-image'>").appendTo($clip);

        // 创建截取区域
        $clipArea = $("<div class='photo-clip-area'>").appendTo($clip);

        $maskTop = $("<div class='photo-clip-mask-top'>").appendTo($clip);

        $maskLeft = $("<div class='photo-clip-mask-left'>").appendTo($clip);

        $maskBottom = $("<div class='photo-clip-mask-bottom'>").appendTo($clip);

        $maskRight = $("<div class='photo-clip-mask-right'>").appendTo($clip);

        $cut = $("<div class='cut'>").css({
            'z-index':4,
            'text-align': 'center',
            'line-height': '36px',
            border: '1px solid #ddd',
            left:(containerWidth-80)/2 + 'px',
            width: '80px',
            height: '40px',
            background: '#fff',
            'border-radius': '20px',
            position: 'absolute',
            bottom: '20px'
        }).appendTo($clip);
        $("<i class='fa fa-crop'>").appendTo($cut);

        self.initCss((containerHeight-clipHeight)/2,(containerWidth-clipWidth)/2);
    }
}

