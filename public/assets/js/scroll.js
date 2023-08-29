window.addEventListener('DOMContentLoaded', function () {
    const scrolltoElement = document.getElementById('scrollto');
    const text = scrolltoElement.textContent.trim();
    const targetSection = document.getElementById(text);
    targetSection.scrollIntoView({ behavior: 'instant' });
});