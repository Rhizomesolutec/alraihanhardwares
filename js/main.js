(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();
    
    
    // Initiate the wowjs
    new WOW().init();


    // Sticky Navbar
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.sticky-top').addClass('shadow-sm').css('top', '0px');
        } else {
            $('.sticky-top').removeClass('shadow-sm').css('top', '-100px');
        }
    });
    
    
    // Back to top button
    $(window).scroll(function () {
        if ($(this).scrollTop() > 300) {
            $('.back-to-top').fadeIn('slow');
        } else {
            $('.back-to-top').fadeOut('slow');
        }
    });
    $('.back-to-top').click(function () {
        $('html, body').animate({scrollTop: 0}, 1500, 'easeInOutExpo');
        return false;
    });


    // Facts counter
    $('[data-toggle="counter-up"]').counterUp({
        delay: 10,
        time: 2000
    });


    // Cinematic hero video
    var heroVideo = document.getElementById('hero-video');
    if (heroVideo) {
        var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var saveData = navigator.connection && navigator.connection.saveData;
        var heroCarousel = document.getElementById('header-carousel');

        if (reduceMotion && heroCarousel && window.bootstrap) {
            var carousel = bootstrap.Carousel.getOrCreateInstance(heroCarousel, {
                interval: false,
                ride: false
            });
            carousel.pause();
        }

        if (reduceMotion || saveData) {
            heroVideo.pause();
            heroVideo.removeAttribute('autoplay');
            heroVideo.querySelectorAll('source').forEach(function (source) {
                source.remove();
            });
            heroVideo.load();
        } else {
            var revealHero = function () {
                heroVideo.classList.add('is-ready');
            };
            heroVideo.addEventListener('loadeddata', revealHero);
            heroVideo.addEventListener('canplay', revealHero);
            if (heroVideo.readyState >= 2) {
                revealHero();
            }
        }
    }


    // Contact form: WhatsApp plus both office inboxes
    var contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function (event) {
            event.preventDefault();
            var name = document.getElementById('name').value.trim();
            var email = document.getElementById('email').value.trim();
            var mobile = document.getElementById('mobile').value.trim();
            var subject = document.getElementById('subject').value.trim();
            var message = document.getElementById('message').value.trim();
            var mailSubject = subject || ('Website enquiry from ' + name);
            var body = [
                'Name: ' + name,
                'Mobile: ' + mobile,
                'Email: ' + (email || '-'),
                'Subject: ' + mailSubject,
                '',
                message
            ].join('\n');
            var whatsappUrl = 'https://wa.me/971568656399?text=' + encodeURIComponent(body);
            var mailUrl = 'mailto:Sales@alraihanhardwares.com,Info@alraihanhardwares.com?subject=' + encodeURIComponent(mailSubject) + '&body=' + encodeURIComponent(body);
            window.open(whatsappUrl, '_blank', 'noopener');
            window.location.href = mailUrl;
        });
    }


    // Testimonials carousel
    $(".testimonial-carousel").owlCarousel({
        autoplay: true,
        smartSpeed: 1000,
        items: 1,
        dots: false,
        loop: true,
        nav: true,
        navText : [
            '<i class="bi bi-chevron-left"></i>',
            '<i class="bi bi-chevron-right"></i>'
        ]
    });

    
})(jQuery);

