(function() {
    'use strict';

    // Avoid `console` errors in browsers that lack a console.
    var method;
    var noop = function () {};
    var methods = [
        'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
        'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
        'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
        'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
    ];
    var length = methods.length;
    var console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

// Place any code in here.
$(function() {
    'use strict';

    /**
     * STICKY MENU
     **/
    var $navbar = $(".navigation"),
        stickyPoint = 90;

    function navbarSticky() {
        if ($(window).scrollTop() >= stickyPoint) {
            $navbar.addClass("navbar-sticky");
        } else {
            $navbar.removeClass("navbar-sticky");
        }
    }

    $(window).scroll(function () {
        navbarSticky();
    });

    navbarSticky();

    /**
     * SCROLLING NAVIGATION
     * Enable smooth transition animation when scrolling
     **/
    $('a.scrollto').on('click', function (event) {
        event.preventDefault();

        var scrollAnimationTime = 1200;
        var target = this.hash;

        $('html, body').stop().animate({
            scrollTop: $(target).offset().top
        }, scrollAnimationTime, 'easeInOutExpo', function () {
            window.location.hash = target;
        });
    });

    /**
     *  NAVBAR SIDE COLLAPSIBLE
     **/
    $(".navbar-toggler").on("click", function() {
        $navbar.toggleClass("navbar-expanded");
    });

   /**
    * AOS Initialization
    **/
    AOS.init({
        offset: 200,
        duration: 1500,
        disable: "mobile"
    });

    /**
     * Swiper Initialization
     **/
    $('.swiper-container').each(function() {
        var $this = $(this);

        var breakPoints =  false;
        var autoplay = $this.data('sw-autoplay') || false;
        var speed = $this.data('sw-speed') || 1100;
        var effect = $this.data('sw-effect') || "slide";
        var showItems = $this.data('sw-show-items') || 1;
        var loop = $this.data('sw-loop') || true;
        var centered = $this.data('sw-centered-slides') || true;
        var spaceBetween = (showItems > 1) ? 20 : 0;
        var scrollItems = $this.data('sw-scroll-items') || 1;
        var navigationElement = $this.data('sw-navigation');

        var stretch = $this.data('sw-cover-stretch') || 0;
        var depth = $this.data('sw-cover-depth') || 0;
        var modifier = $this.data('sw-cover-modifier') || 1;

        var pagination = {
            pagination: {
                el: '.swiper-pagination',
                clickable: true
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev'
            }
        };

        if (navigationElement) {
            pagination.onTransitionEnd = function (sw) {
                $('.active', navigationElement).removeClass('active');
                $('.nav-item:eq('+ sw.realIndex +')', navigationElement).addClass('active');
            }
        }

        var swiper = new Swiper (this, $.extend({
            loop: loop,
            slidesPerGroup: scrollItems,
            spaceBetween: spaceBetween,
            centeredSlides: centered,
            breakpoints: breakPoints,
            slidesPerView: showItems,
            autoplay: autoplay,
            speed: speed,
            paginationClickable: true,
            autoplayDisableOnInteraction: false,
            parallax: true,
            effect: effect,
            coverflow: {
                rotate: 0,
                stretch: stretch,
                depth: depth, // 100
                modifier: modifier,
                slideShadows : false
            }
        }, pagination));

        if (navigationElement) {
            $(navigationElement).on('click', '.nav-item', function (evt) {
                evt.preventDefault();

                var $item = $(this);

                if ($item.hasClass('active')) {
                    return false
                }

                var index = $item.index();
                swiper.slideTo(index + 1);

                $item.siblings('.active').removeClass('active');
                $item.addClass('active');

                return false
            })
        }
    });
});
