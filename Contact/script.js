<script>
/* Simple contact form handler
   - Tries to POST the form data as JSON to the endpoint in form.dataset.endpoint
   - If the POST fails (no backend), falls back to opening a mailto: draft in the user's mail client
   - Replace data-endpoint with your Formspree or your server endpoint for real delivery.
*/

(function(){
  const form = document.getElementById('contact-form');
  const statusBox = document.getElementById('form-status');
  const btnClear = document.getElementById('btn-clear');
  const submitBtn = form.querySelector('.btn-submit');

  // Helper: show status
  function showStatus(message, type = 'success') {
    statusBox.hidden = false;
    statusBox.textContent = message;
    statusBox.className = 'form-status ' + (type === 'error' ? 'error' : 'success');
  }

  // Helper: basic validation (beyond browser required attrs)
  function validate() {
    const name = form.name.value.trim();
    const email = form.email.value.trim();
    const message = form.message.value.trim();
    if (name.length < 2) { showStatus('Please enter your name (2+ characters).', 'error'); return false; }
    if (!/^\S+@\S+\.\S+$/.test(email)) { showStatus('Please enter a valid email address.', 'error'); return false; }
    if (message.length < 10) { showStatus('Please write a bit more about the project (10+ characters).', 'error'); return false; }
    return true;
  }

  // Build a mailto fallback if server not available
  function openMailtoFallback() {
    const subject = encodeURIComponent(form.subject.value || 'Contact from portfolio');
    const body = encodeURIComponent(
      `Name: ${form.name.value}\nEmail: ${form.email.value}\nPhone: ${form.phone.value}\n\nMessage:\n${form.message.value}`
    );
    // Change the recipient to your email
    const mailto = `mailto:your.email@example.com?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  }

  // On submit
  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    statusBox.hidden = true;

    // prevent double submits
    if (submitBtn.disabled) return;

    if (!validate()) return;

    // prepare payload
    const payload = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      subject: form.subject.value.trim(),
      message: form.message.value.trim(),
      phone: form.phone.value.trim()
    };

    const endpoint = form.dataset.endpoint || '';

    // if endpoint is not set or seems like a placeholder, use mail client fallback
    const useFallbackDirectly = !endpoint || endpoint === '/contact';

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      if (useFallbackDirectly) {
        // No backend provided — open user's mail client (fallback)
        showStatus('No server configured — opening your mail app as a fallback...', 'success');
        setTimeout(openMailtoFallback, 800);
        submitBtn.textContent = 'Send Message';
        submitBtn.disabled = false;
        return;
      }

      // Try to POST JSON to your backend
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // treat as failure and open fallback
        const text = await res.text().catch(()=> '');
        throw new Error(text || 'Server returned an error');
      }

      // success
      showStatus('Message sent! I will reply as soon as I can. Thank you 😊', 'success');
      form.reset();
    } catch (err) {
      console.error('Contact submit error:', err);
      // Fallback to mailto if sending fails
      showStatus('Could not send via server — opening your mail client as a fallback.', 'error');
      setTimeout(openMailtoFallback, 900);
    } finally {
      submitBtn.textContent = 'Send Message';
      submitBtn.disabled = false;
    }
  });

  // Clear button
  btnClear.addEventListener('click', function () {
    form.reset();
    statusBox.hidden = true;
  });

})();
</script>
