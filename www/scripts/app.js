/**
 * Created by yanhao on 15/12/15.
 */
$(function () {



    $('.page').height($(window).height());

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
            /**
             * status 0 不存在, 1 已存在
             */
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

    $container.on('click', '.tab', function(){
        $('.tab').removeClass('active');
        $(this).addClass('active');
        $('.content').removeClass('active');
        $('.' + $(this).attr('data-id')).addClass('active');
    });

    $container.on('click', '.foodQrcode', function(){
        $('.qrcode-dialog').show();
        $('.img-qrcode').attr('src','images/face.png');
        $('.qrcode-dialog').find('.detail-close').on('click', function () {
            $('.qrcode-dialog').hide();
        });
    });

    // toast
    $container.on('click', '#showToast', function () {
        $('#toast').show();
        setTimeout(function () {
            $('#toast').hide();
        }, 5000);
    });
    $container.on('click', '#showLoadingToast', function () {
        $('#loadingToast').show();
        setTimeout(function () {
            $('#loadingToast').hide();
        }, 5000);
    });

    $container.on('click', '#showDialog1', function () {
        $('#dialog1').show();
        $('#dialog1').find('.weui_btn_dialog').on('click', function () {
            $('#dialog1').hide();
        });
    });
    $container.on('click', '#showDialog2', function () {
        $('#dialog2').show();
        $('#dialog2').find('.weui_btn_dialog').on('click', function () {
            $('#dialog2').hide();
        });
    });

    function hideActionSheet(weuiActionsheet, mask) {
        weuiActionsheet.removeClass('weui_actionsheet_toggle');
        mask.removeClass('weui_fade_toggle');
        weuiActionsheet.on('transitionend', function () {
            mask.hide();
        }).on('webkitTransitionEnd', function () {
            mask.hide();
        })
    }
    $container.on('click','#showActionSheet', function () {
        var mask = $('#mask');
        var weuiActionsheet = $('#weui_actionsheet');
        weuiActionsheet.addClass('weui_actionsheet_toggle');
        mask.show().addClass('weui_fade_toggle').click(function () {
            hideActionSheet(weuiActionsheet, mask);
        });
        $('#actionsheet_cancel').click(function () {
            hideActionSheet(weuiActionsheet, mask);
        });
        weuiActionsheet.unbind('transitionend').unbind('webkitTransitionEnd');
    });
});