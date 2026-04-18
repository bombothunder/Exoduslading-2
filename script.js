/* ============================================================
   DIGITAIFLOW VSL LANDING PAGE — JAVASCRIPT
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ── Scroll-triggered animations ──
  const animItems = document.querySelectorAll('.animate-in');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -40px 0px'
  });

  animItems.forEach(item => observer.observe(item));

  // ── Video play button ──
  const placeholder = document.getElementById('video-placeholder');
  const video = document.getElementById('vsl-video');

  if (placeholder && video) {
    placeholder.addEventListener('click', () => {
      placeholder.style.opacity = '0';
      placeholder.style.pointerEvents = 'none';
      placeholder.style.transition = 'opacity 0.4s ease';

      video.style.display = 'block';
      if (video.tagName.toLowerCase() === 'iframe') {
        const currentSrc = video.getAttribute('src');
        if (!currentSrc.includes('autoplay=1')) {
          video.src = currentSrc + (currentSrc.includes('?') ? '&' : '?') + 'autoplay=1';
        }
      } else {
        video.play().catch(() => {});
      }

      setTimeout(() => {
        placeholder.style.display = 'none';
      }, 400);
    });
  }

  // ── Smooth CTA link handling ──
  // If user hasn't set a Calendly/booking link, scroll to the video
  document.querySelectorAll('.cta-btn, .cta-btn-sticky').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const href = btn.getAttribute('href');
      if (href === '#' || href === '') {
        e.preventDefault();
        const videoWrapper = document.getElementById('video-wrapper');
        if (videoWrapper) {
          videoWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });

  // ── Header scroll effect ──
  const header = document.getElementById('site-header');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;
    if (currentScroll > 60) {
      header.style.background = 'rgba(5, 5, 9, 0.85)';
    } else {
      header.style.background = 'rgba(5, 5, 9, 0.6)';
    }
    lastScroll = currentScroll;
  }, { passive: true });

  // ── Sticky CTA visibility ──
  const stickyCta = document.getElementById('sticky-cta');
  const ctaArea = document.getElementById('cta-area');

  if (stickyCta && ctaArea) {
    const stickyObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          stickyCta.classList.remove('visible');
        } else {
          stickyCta.classList.add('visible');
        }
      });
    }, { threshold: 0 });

    stickyObserver.observe(ctaArea);
  }

  // ── Count-up animation for trust numbers ──
  const trustNumbers = document.querySelectorAll('.trust-number');
  const trustObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const finalText = el.textContent.trim();

        // Only animate pure numbers
        const num = parseInt(finalText.replace(/[^0-9]/g, ''), 10);
        if (!isNaN(num) && num > 0 && /^\d+$/.test(finalText.trim())) {
          animateNumber(el, 0, num, 1200);
        }

        trustObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  trustNumbers.forEach(n => trustObserver.observe(n));

  function animateNumber(el, start, end, duration) {
    const startTime = performance.now();

    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      const current = Math.round(start + (end - start) * eased);
      el.textContent = current;

      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = end;
      }
    }

    requestAnimationFrame(tick);
  }

  // ── Parallax on mouse move for orbs (subtle) ──
  const orbs = document.querySelectorAll('.orb');

  document.addEventListener('mousemove', (e) => {
    const x = (e.clientX / window.innerWidth - 0.5) * 2;
    const y = (e.clientY / window.innerHeight - 0.5) * 2;

    orbs.forEach((orb, i) => {
      const intensity = (i + 1) * 8;
      orb.style.transform = `translate(${x * intensity}px, ${y * intensity}px)`;
    });
  });

  // ── Form Submission Handling for Onboarding ──
  const onboardingForm = document.querySelector('.onboarding-form');
  if (onboardingForm) {
    onboardingForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const submitBtn = onboardingForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = 'Submitting...';
      submitBtn.disabled = true;

      const formData = new FormData(onboardingForm);
      const data = new URLSearchParams(formData);

      // ⚠️ IMPORTANT: REPLACE THESE WITH YOUR SUPABASE CREDENTIALS!
      const SUPABASE_URL = "https://fkxgywvzjxoiylgpyyka.supabase.co";
      const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZreGd5d3Z6anhvaXlsZ3B5eWthIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjY0MzAsImV4cCI6MjA5MjA0MjQzMH0.oBKVkvzWgqrsTCJ0ZMvOjWb9GHryFubM5QRiN5f8Bt4";

      if (SUPABASE_URL === "YOUR_SUPABASE_PROJECT_URL") {
          // If you haven't pasted your URL yet, just skip to the thank-you page.
          window.location.href = onboardingForm.getAttribute('action');
          return;
      }

      // Format data exactly for our Supabase SQL columns
      const payload = {
        full_name: formData.get('fullName'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        goal: formData.get('goal'),
        challenge: formData.get('challenge')
      };

      fetch(`${SUPABASE_URL}/rest/v1/onboarding_leads`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify(payload)
      })
      .then(response => {
        if (!response.ok) throw new Error("Supabase Database Error");
        window.location.href = onboardingForm.getAttribute('action');
      })
      .catch(err => {
        console.error('Error submitting form:', err);
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        alert('Hubo un problema enviando tus datos. Por favor revisa que ingresaste bien tu URL y API Key en script.js.');
      });
    });
  }

});
