// Mobile navigation hamburger toggle
(function () {
    const toggle  = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-right-group');

    if (!toggle || !navMenu) return;

    // Open / close the dropdown
    toggle.addEventListener('click', function (e) {
        e.stopPropagation(); // Prevent the document click below from firing immediately
        const isOpen = navMenu.classList.toggle('open');
        toggle.setAttribute('aria-expanded', isOpen);
        toggle.textContent = isOpen ? '✕' : '☰';
    });

    // Close when any nav link is tapped (smooth UX after selecting an item)
    navMenu.querySelectorAll('a').forEach(function (link) {
        link.addEventListener('click', function () {
            navMenu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = '☰';
        });
    });

    // Close when tapping anywhere outside the nav
    document.addEventListener('click', function (e) {
        if (!toggle.contains(e.target) && !navMenu.contains(e.target)) {
            navMenu.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.textContent = '☰';
        }
    });
}());

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

// Lead form submission → Formspree
// Sends in the background, then redirects to our own confirmation page
// (Formspree's free plan doesn't support custom redirects on a normal POST).
(function () {
    const form     = document.querySelector('.lead-form');
    const errorMsg = document.getElementById('form-submit-error');
    if (!form || !window.fetch) return; // no fetch → normal POST to Formspree still works

    const button = form.querySelector('.submit-button');

    form.addEventListener('submit', function (e) {
        if (e.defaultPrevented) return; // consent check above blocked it
        e.preventDefault();

        if (errorMsg) errorMsg.hidden = true;
        button.disabled = true;
        const originalHTML = button.innerHTML;
        button.textContent = 'Sending…';

        // Build a plain object; repeated names (checkbox groups) become one comma-separated value
        const data = {};
        new FormData(form).forEach(function (value, key) {
            data[key] = data[key] ? data[key] + ', ' + value : value;
        });

        fetch(form.action, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: { 'Accept': 'application/json', 'Content-Type': 'application/json' }
        }).then(function (res) {
            if (!res.ok) throw new Error('Formspree returned ' + res.status);
            window.location.href = form.dataset.redirect || 'confirmation.html';
        }).catch(function () {
            button.disabled = false;
            button.innerHTML = originalHTML;
            if (errorMsg) errorMsg.hidden = false;
        });
    });
}());

// Property address autocomplete (Google Places API — New)
// Paste your Google Maps API key below to turn it on. With no key the field works
// as a normal text box. Restrict the key to your domain in Google Cloud Console.
const GOOGLE_MAPS_API_KEY = 'AIzaSyDohtlTpb4Mao1lM9p9ePeuxQhdlGYRWeU';

(function () {
    const input = document.getElementById('property_address');
    const list  = document.getElementById('address-suggestions');

    if (!input || !list || !GOOGLE_MAPS_API_KEY) return;

    let placesLib     = null;
    let sessionToken  = null;
    let suggestions   = [];
    let activeIndex   = -1;
    let debounceTimer = null;
    let requestId     = 0;

    // Load the Maps JS API, then the Places library
    window.__rareInitMaps = function () {
        google.maps.importLibrary('places').then(function (lib) {
            placesLib = lib;
        });
    };
    const tag = document.createElement('script');
    tag.src = 'https://maps.googleapis.com/maps/api/js?key=' + encodeURIComponent(GOOGLE_MAPS_API_KEY) +
              '&loading=async&callback=__rareInitMaps';
    tag.async = true;
    document.head.appendChild(tag);

    // Accessibility: describe the input as a combobox
    input.setAttribute('autocomplete', 'off'); // keep the browser's own dropdown out of the way
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', 'address-suggestions');
    input.setAttribute('aria-expanded', 'false');

    function closeList() {
        list.hidden = true;
        list.innerHTML = '';
        suggestions = [];
        activeIndex = -1;
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
    }

    function setActive(index) {
        const items = list.querySelectorAll('.address-suggestion');
        items.forEach(function (el, i) { el.classList.toggle('active', i === index); });
        activeIndex = index;
        if (items[index]) {
            input.setAttribute('aria-activedescendant', items[index].id);
            items[index].scrollIntoView({ block: 'nearest' });
        }
    }

    function render() {
        list.innerHTML = '';
        if (!suggestions.length) { closeList(); return; }

        suggestions.forEach(function (prediction, i) {
            const li = document.createElement('li');
            li.className = 'address-suggestion';
            li.id = 'address-option-' + i;
            li.setAttribute('role', 'option');

            const main = document.createElement('span');
            main.className = 'address-suggestion-main';
            main.textContent = prediction.mainText ? prediction.mainText.toString() : prediction.text.toString();
            li.appendChild(main);

            if (prediction.secondaryText) {
                const secondary = document.createElement('span');
                secondary.className = 'address-suggestion-secondary';
                secondary.textContent = prediction.secondaryText.toString().replace(/, USA$/, '');
                li.appendChild(secondary);
            }

            // mousedown (not click) so it fires before the input loses focus
            li.addEventListener('mousedown', function (e) {
                e.preventDefault();
                select(i);
            });
            list.appendChild(li);
        });

        const attribution = document.createElement('li');
        attribution.className = 'address-attribution';
        attribution.setAttribute('aria-hidden', 'true');
        attribution.textContent = 'powered by Google';
        list.appendChild(attribution);

        list.hidden = false;
        input.setAttribute('aria-expanded', 'true');
        activeIndex = -1;
    }

    function fetchSuggestions(value) {
        if (!placesLib) return;
        if (!sessionToken) sessionToken = new placesLib.AutocompleteSessionToken();

        const thisRequest = ++requestId;
        placesLib.AutocompleteSuggestion.fetchAutocompleteSuggestions({
            input: value,
            sessionToken: sessionToken,
            includedRegionCodes: ['us'],
            includedPrimaryTypes: ['street_address', 'premise', 'subpremise'],
            // Prefer metro Atlanta results without excluding the rest of the US
            locationBias: { center: { lat: 33.749, lng: -84.388 }, radius: 50000 }
        }).then(function (res) {
            if (thisRequest !== requestId) return; // a newer keystroke superseded this one
            suggestions = res.suggestions
                .map(function (s) { return s.placePrediction; })
                .filter(Boolean)
                .slice(0, 5);
            render();
        }).catch(function () {
            closeList(); // fail quietly — the user can still type the address manually
        });
    }

    function select(index) {
        const prediction = suggestions[index];
        if (!prediction) return;

        // Show the suggestion text right away, then upgrade to the full address with ZIP
        input.value = prediction.text.toString().replace(/, USA$/, '');
        closeList();

        const place = prediction.toPlace();
        place.fetchFields({ fields: ['formattedAddress'] }).then(function () {
            if (place.formattedAddress) {
                input.value = place.formattedAddress.replace(/, USA$/, '');
            }
        }).catch(function () { /* keep the suggestion text */ });

        sessionToken = null; // fetching details ends the billing session
    }

    input.addEventListener('input', function () {
        clearTimeout(debounceTimer);
        const value = input.value.trim();
        if (value.length < 3) { requestId++; closeList(); return; }
        debounceTimer = setTimeout(function () { fetchSuggestions(value); }, 250);
    });

    input.addEventListener('keydown', function (e) {
        if (list.hidden) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setActive((activeIndex + 1) % suggestions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setActive((activeIndex - 1 + suggestions.length) % suggestions.length);
        } else if (e.key === 'Enter' && activeIndex >= 0) {
            e.preventDefault(); // pick the address instead of submitting the form
            select(activeIndex);
        } else if (e.key === 'Escape') {
            closeList();
        }
    });

    input.addEventListener('blur', function () {
        setTimeout(closeList, 150);
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