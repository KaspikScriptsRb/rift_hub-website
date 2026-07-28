document.addEventListener('DOMContentLoaded', () => {

  const cursorDot = document.createElement('div');
  const cursorOutline = document.createElement('div');
  cursorDot.className = 'custom-cursor-dot';
  cursorOutline.className = 'custom-cursor-outline';
  document.body.appendChild(cursorDot);
  document.body.appendChild(cursorOutline);

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let dotX = mouseX, dotY = mouseY;
  let outlineX = mouseX, outlineY = mouseY;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function animateCursor() {
    dotX += (mouseX - dotX) * 0.35;
    dotY += (mouseY - dotY) * 0.35;
    outlineX += (mouseX - outlineX) * 0.15;
    outlineY += (mouseY - outlineY) * 0.15;

    cursorDot.style.transform = `translate3d(${dotX - 4}px, ${dotY - 4}px, 0)`;
    cursorOutline.style.transform = `translate3d(${outlineX - 18}px, ${outlineY - 18}px, 0)`;

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  const interactiveEls = document.querySelectorAll('a, button, .game-minimal-card, .executor-pill-card, .feature-luxury-card, .step-card, .team-card, .price-card, .faq-question');
  interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => cursorOutline.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => cursorOutline.classList.remove('cursor-hover'));
  });

  window.addEventListener('click', (e) => {
    const ripple = document.createElement('div');
    ripple.className = 'click-ripple';
    ripple.style.left = `${e.clientX - 25}px`;
    ripple.style.top = `${e.clientY - 25}px`;
    document.body.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  });

  const canvas = document.getElementById('particles-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouse = { x: width / 2, y: height / 2, targetX: width / 2, targetY: height / 2 };

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    window.addEventListener('mousemove', (e) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
    });

    const spacing = 42;
    let time = 0;

    function renderFluidGrid() {
      ctx.clearRect(0, 0, width, height);

      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      time += 0.025;

      const cols = Math.ceil(width / spacing);
      const rows = Math.ceil(height / spacing);
      const nodes = [];

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const origX = i * spacing + 20;
          const origY = j * spacing + 20;

          const dx = mouse.x - origX;
          const dy = mouse.y - origY;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let pushX = 0;
          let pushY = 0;
          let offsetRadius = 1.3;
          let alpha = 0.1;

          if (dist < 280) {
            const factor = Math.pow(1 - dist / 280, 2);
            pushX = (dx / dist) * factor * -55;
            pushY = (dy / dist) * factor * -55;
            offsetRadius = 1.3 + factor * 4.8;
            alpha = 0.1 + factor * 0.75;
          }

          const waveX = Math.cos(time + origY * 0.015) * 5;
          const waveY = Math.sin(time + origX * 0.015) * 5;

          const finalX = origX + pushX + waveX;
          const finalY = origY + pushY + waveY;

          nodes.push({ x: finalX, y: finalY, alpha: alpha, radius: offsetRadius, dist: dist });

          ctx.beginPath();
          ctx.arc(finalX, finalY, offsetRadius, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.globalAlpha = alpha;
          ctx.fill();
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].dist < 220) {
          for (let j = i + 1; j < nodes.length; j++) {
            if (nodes[j].dist < 220) {
              const nodeDx = nodes[i].x - nodes[j].x;
              const nodeDy = nodes[i].y - nodes[j].y;
              const nodeDist = Math.sqrt(nodeDx * nodeDx + nodeDy * nodeDy);

              if (nodeDist < 60) {
                const lineAlpha = (1 - nodeDist / 60) * (1 - nodes[i].dist / 220) * 0.3;
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = '#ffffff';
                ctx.globalAlpha = lineAlpha;
                ctx.lineWidth = 0.8;
                ctx.stroke();
              }
            }
          }
        }
      }

      requestAnimationFrame(renderFluidGrid);
    }
    renderFluidGrid();
  }

  const glassPanels = document.querySelectorAll('.glass-panel');
  glassPanels.forEach(panel => {
    panel.addEventListener('mousemove', (e) => {
      const rect = panel.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      panel.style.setProperty('--mouse-x', `${x}px`);
      panel.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  const tiltCards = document.querySelectorAll('.tilt-card');
  tiltCards.forEach(card => {
    let currentX = 0, currentY = 0;
    let targetX = 0, targetY = 0;
    let isHovered = false;

    card.addEventListener('mouseenter', () => {
      isHovered = true;
    });

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      targetX = ((y - centerY) / centerY) * -16;
      targetY = ((x - centerX) / centerX) * 16;
    });

    card.addEventListener('mouseleave', () => {
      isHovered = false;
      targetX = 0;
      targetY = 0;
    });

    function updateTilt() {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (isHovered || Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
        card.style.transform = `perspective(1000px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
      } else if (!isHovered && Math.abs(currentX) <= 0.05 && Math.abs(currentY) <= 0.05) {
        card.style.transform = '';
      }
      requestAnimationFrame(updateTilt);
    }
    updateTilt();
  });

  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;

  const scrollProgress = document.getElementById('scrollProgress');
  const spotlight1 = document.getElementById('spotlight1');
  const spotlight2 = document.getElementById('spotlight2');
  const header = document.getElementById('header');
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    const currentScrollY = window.scrollY;
    scrollVelocity = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (currentScrollY / totalHeight) * 100;
    if (scrollProgress) {
      scrollProgress.style.width = `${progress}%`;
    }

    if (spotlight1) {
      spotlight1.style.transform = `translate3d(0, ${currentScrollY * 0.22}px, 0)`;
    }
    if (spotlight2) {
      spotlight2.style.transform = `translate3d(0, ${-currentScrollY * 0.18}px, 0)`;
    }

    if (currentScrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    let currentSection = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 160;
      const sectionHeight = section.offsetHeight;
      if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
        currentSection = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentSection}`) {
        link.classList.add('active');
      }
    });
  });

  const magneticBtns = document.querySelectorAll('.btn, .logo-icon, .step-num-pill');
  magneticBtns.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate3d(${x * 0.3}px, ${y * 0.3}px, 0) scale(1.06)`;
    });

    btn.addEventListener('mouseleave', () => {
      btn.style.transform = `translate3d(0, 0, 0) scale(1)`;
    });
  });

  const gridContainers = document.querySelectorAll('.games-minimal-grid, .executors-clean-list, .features-redesigned-grid, .steps-grid, .team-grid, .pricing-grid');
  gridContainers.forEach(container => {
    const children = container.querySelectorAll('.reveal');
    children.forEach((child, index) => {
      child.style.transitionDelay = `${index * 110}ms`;
    });
  });

  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      } else {
        entry.target.classList.remove('active');
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -20px 0px" });

  revealElements.forEach(el => revealObserver.observe(el));

  const mobileToggle = document.getElementById('mobileToggle');
  const navLinksContainer = document.querySelector('.nav-links');
  if (mobileToggle && navLinksContainer) {
    mobileToggle.addEventListener('click', () => {
      navLinksContainer.classList.toggle('active');
      const icon = mobileToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navLinksContainer.classList.remove('active');
        const icon = mobileToggle.querySelector('i');
        if (icon) {
          icon.classList.add('fa-bars');
          icon.classList.remove('fa-xmark');
        }
      });
    });
  }

  const defaultScriptText = `loadstring(game:HttpGet("https://api.jnkie.com/api/v1/luascripts/public/056bf72c3cd7af38ca292db583aaba9ecd12205d214716e14654ee7781bfee23/download"))()`;

  function copyToClipboard(text, message) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(message || "Copied script loader to clipboard!");
    }).catch(err => {
      console.error('Failed to copy: ', err);
      showToast("Error copying script to clipboard");
    });
  }

  const copyScriptBtn = document.getElementById('copyScriptBtn');
  if (copyScriptBtn) {
    copyScriptBtn.addEventListener('click', () => {
      copyToClipboard(defaultScriptText, "Casual Hub Loader copied to clipboard!");

      const btnText = copyScriptBtn.querySelector('.btn-copy-text');
      const icon = copyScriptBtn.querySelector('i');
      if (btnText && icon) {
        const originalText = btnText.textContent;
        btnText.textContent = "Copied Loader!";
        icon.className = "fa-solid fa-check";

        setTimeout(() => {
          btnText.textContent = originalText;
          icon.className = "fa-regular fa-copy";
        }, 2500);
      }
    });
  }

  const step1CopyBtn = document.getElementById('step1CopyBtn');
  if (step1CopyBtn) {
    step1CopyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      copyToClipboard(defaultScriptText, "Casual Hub Loader copied to clipboard!");
      const originalText = step1CopyBtn.innerHTML;
      step1CopyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
      setTimeout(() => {
        step1CopyBtn.innerHTML = originalText;
      }, 2500);
    });
  }

  const copyModuleBtns = document.querySelectorAll('.copy-module-btn');
  copyModuleBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const moduleName = btn.getAttribute('data-module');
      copyToClipboard(defaultScriptText, `${moduleName} script loader copied!`);

      const indicator = btn.querySelector('.game-copy-indicator span');
      const icon = btn.querySelector('.game-copy-indicator i');
      if (indicator && icon) {
        const origText = indicator.textContent;
        indicator.textContent = "Copied!";
        icon.className = "fa-solid fa-check";
        setTimeout(() => {
          indicator.textContent = origText;
          icon.className = "fa-regular fa-copy";
        }, 2500);
      }
    });
  });

  function showToast(message) {
    const toastContainer = document.getElementById('toastContainer');
    const toastMessage = document.getElementById('toastMessage');

    if (toastContainer && toastMessage) {
      toastMessage.textContent = message;
      toastContainer.classList.add('show');

      setTimeout(() => {
        toastContainer.classList.remove('show');
      }, 3200);
    }
  }

  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherAnswer = otherItem.querySelector('.faq-answer');
        if (otherAnswer) otherAnswer.style.maxHeight = null;
      });

      if (!isOpen) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + "px";
      }
    });
  });

  const legalModalOverlay = document.getElementById('legalModalOverlay');
  const legalModalClose = document.getElementById('legalModalClose');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const legalContent = {
    terms: {
      title: "Terms of Service",
      body: `
        <h4>1. Usage License & Scope</h4>
        <p>By executing Casual Hub scripts or accessing our platform, you agree to these Terms of Service. Casual Hub provides high-performance Lua script loaders for Roblox titles strictly for personal entertainment and testing purposes.</p>
        
        <h4>2. Key System & Access Tiers</h4>
        <p>Free Keys are valid for 24 hours and acquired through official link checkpoints. Premium Keys ($5.00 lifetime) provide permanent keyless execution, zero ads, Premium Discord role, and early access to new script builds. Reselling, sharing, or attempting to crack key access will result in an immediate blacklisting of your key.</p>
        
        <h4>3. Cloud Service Uptime</h4>
        <p>Our server infrastructure operates 24/7 cloud sync. During major Roblox platform engine updates, script execution may be temporarily paused for hotfix deployment to guarantee stealth protection.</p>
      `
    },
    privacy: {
      title: "Privacy Policy",
      body: `
        <h4>1. Complete Privacy Protection</h4>
        <p>Casual Hub values your privacy. We do NOT collect, store, or sell any personal data, passwords, real names, or IP tracking databases.</p>
        
        <h4>2. Local Configuration Storage</h4>
        <p>Your custom script settings, draggable UI layouts, and saved game configurations are stored locally on your device in your executor's workspace folder (e.g. <code>casual_hub_config.json</code>).</p>
        
        <h4>3. Community Data & Discord</h4>
        <p>Joining our official Discord community is completely voluntary. Support tickets and key verifications are processed strictly through authorized Discord bots without exposing private credentials.</p>
      `
    },
    disclaimer: {
      title: "Legal Disclaimer",
      body: `
        <h4>1. Independent Development</h4>
        <p>Casual Hub is an independent developer project and is NOT affiliated with, sponsored by, or endorsed by Roblox Corporation or game creators.</p>
        
        <h4>2. User Discretion & Safety</h4>
        <p>While Casual Hub incorporates advanced anti-tamper hooks and stealth execution to protect user accounts, third-party script execution is used at your own discretion and risk.</p>
        
        <h4>3. Intellectual Property</h4>
        <p>All game titles, trademarks, cover art, and brand names mentioned on this site belong to their respective copyright holders.</p>
      `
    }
  };

  window.openLegalModal = function(type) {
    if (legalContent[type] && legalModalOverlay) {
      modalTitle.textContent = legalContent[type].title;
      modalBody.innerHTML = legalContent[type].body;
      legalModalOverlay.classList.add('active');
    }
  };

  if (legalModalClose) {
    legalModalClose.addEventListener('click', () => {
      legalModalOverlay.classList.remove('active');
    });
  }

  if (legalModalOverlay) {
    legalModalOverlay.addEventListener('click', (e) => {
      if (e.target === legalModalOverlay) {
        legalModalOverlay.classList.remove('active');
      }
    });
  }

});
