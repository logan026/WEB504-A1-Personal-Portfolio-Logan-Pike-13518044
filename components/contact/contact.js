//Link to our contact form
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(event) {
        event.preventDefault(); //Stop the page reloading
        alert('Thank you for reaching out! Your message has been sent / simulated successfully!');
        contactForm.reset(); //Start fresh form
    });
}