// Consent checkbox validation
// Blocks form submission and shows an inline error if the box is unchecked.
(function () {
    const form          = document.querySelector('.lead-form');
    const checkbox      = document.getElementById('consent');
    const errorMsg      = document.getElementById('consent-error');

    if (!form || !checkbox || !errorMsg) return;

    // Clear the error as soon as the user checks the box
    checkbox.addEventListener('change', function () {
        if (checkbox.checked) {
            errorMsg.classList.remove('visible');
            checkbox.setAttribute('aria-invalid', 'false');
        }
    });

    // Intercept submit: if unchecked, prevent submission and show the error
    form.addEventListener('submit', function (e) {
        if (!checkbox.checked) {
            e.preventDefault();
            errorMsg.classList.add('visible');
            checkbox.setAttribute('aria-invalid', 'true');
            // Scroll the checkbox into view and focus it for keyboard/screen-reader users
            checkbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
            checkbox.focus();
        }
    });
}());

// FAQ accordion
document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        faqItem.classList.toggle('active');
        const content = faqItem.querySelector('.faq-content');
        if (faqItem.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + "px";
        } else {
            content.style.maxHeight = 0;
        }
    });
});

// Scroll reveal — triggers .reveal and .reveal-stagger elements as they enter the viewport
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target); // animate once
        }
    });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal, .reveal-stagger').forEach(el => observer.observe(el));