// Simple JavaScript to handle the FAQ toggle action
document.querySelectorAll('.faq-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const faqItem = button.parentElement;
        
        // Toggle the "active" class on the clicked item
        faqItem.classList.toggle('active');
        
        // Set the correct height for smooth transition
        const content = faqItem.querySelector('.faq-content');
        if (faqItem.classList.contains('active')) {
            content.style.maxHeight = content.scrollHeight + "px";
        } else {
            content.style.maxHeight = 0;
        }
    });
});