document.addEventListener("DOMContentLoaded", function () {
    setTimeout(function() {
      var images = document.querySelectorAll('.product-image');
      images.forEach(function (img) {
        var imageSrc = img.getAttribute('data-src');
        var tempImg = new Image();
        tempImg.onload = function () {
          img.src = imageSrc;
          img.classList.add('loaded');
        };
        tempImg.src = imageSrc;
      });
    }, 1000); // Delay in milliseconds (1 second)
  });
  