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

  const interactiveEls = document.querySelectorAll('a, button, .game-minimal-card, .catalog-card, .game-home-card, .exec-card, .executor-pill-card, .feature-luxury-card, .step-card, .team-card, .price-card, .faq-question');
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
  if (canvas && !document.body.classList.contains('page-games')) {
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
    let rafId = 0;

    const tick = () => {
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      if (Math.abs(currentX) > 0.05 || Math.abs(currentY) > 0.05) {
        card.style.transform = `perspective(1000px) rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg)`;
        rafId = requestAnimationFrame(tick);
      } else {
        card.style.transform = '';
        rafId = 0;
      }
    };

    const startTick = () => {
      if (!rafId) rafId = requestAnimationFrame(tick);
    };

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      targetX = ((y - rect.height / 2) / (rect.height / 2)) * -12;
      targetY = ((x - rect.width / 2) / (rect.width / 2)) * 12;
      startTick();
    });

    card.addEventListener('mouseleave', () => {
      targetX = 0;
      targetY = 0;
      startTick();
    });
  });

  const execStage = document.getElementById('execStage');
  const execRing = document.getElementById('execRing');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (execStage && execRing && !reduceMotion) {
    const cards = Array.from(execRing.querySelectorAll('.exec-card'));
    const count = cards.length;
    const step = 360 / count;
    let radius = window.innerWidth < 768 ? 220 : (window.innerWidth < 1024 ? 300 : 380);
    let rotation = 0;
    let velocity = 0.18;
    let dragging = false;
    let lastX = 0;
    let pitch = -8;
    let targetPitch = -8;

    const layoutCards = () => {
      radius = window.innerWidth < 768 ? 220 : (window.innerWidth < 1024 ? 300 : 380);
      cards.forEach((card, i) => {
        card.style.transform = `rotateY(${i * step}deg) translateZ(${radius}px)`;
      });
    };

    layoutCards();
    window.addEventListener('resize', layoutCards);

    execStage.addEventListener('pointerdown', (e) => {
      dragging = true;
      lastX = e.clientX;
      execStage.setPointerCapture(e.pointerId);
    });

    execStage.addEventListener('pointermove', (e) => {
      const rect = execStage.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      targetPitch = -8 + ny * -10;

      if (dragging) {
        const dx = e.clientX - lastX;
        lastX = e.clientX;
        velocity = dx * 0.12;
      } else {
        velocity += nx * 0.012;
      }
    });

    const stopDrag = () => {
      dragging = false;
    };

    execStage.addEventListener('pointerup', stopDrag);
    execStage.addEventListener('pointercancel', stopDrag);
    execStage.addEventListener('pointerleave', () => {
      targetPitch = -8;
    });

    const tick = () => {
      velocity *= dragging ? 0.92 : 0.985;
      if (!dragging && Math.abs(velocity) < 0.12) {
        velocity += 0.012;
      }
      rotation += velocity;
      pitch += (targetPitch - pitch) * 0.08;

      const wrapped = ((rotation % 360) + 360) % 360;
      cards.forEach((card, i) => {
        const angle = Math.abs(((i * step) + wrapped) % 360);
        const front = angle < step / 2 || angle > 360 - step / 2;
        card.classList.toggle('is-front', front);
      });

      execRing.style.transform = `translateY(-12px) rotateX(${pitch}deg) rotateY(${rotation}deg)`;
      requestAnimationFrame(tick);
    };

    tick();
  }

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
      if (document.body.classList.contains('page-games')) return;
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

  const gridContainers = document.querySelectorAll('.games-minimal-grid, .games-home-grid, .executors-clean-list, .features-redesigned-grid, .steps-grid, .team-grid, .pricing-grid');
  gridContainers.forEach(container => {
    const children = container.querySelectorAll('.reveal');
    children.forEach((child, index) => {
      child.style.transitionDelay = `${Math.min(index, 5) * 60}ms`;
    });
  });

  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: "0px 0px -10px 0px" });

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

  const defaultScriptText = `loadstring(game:HttpGet("https://api.jnkie.com/api/v1/luascripts/public/d4e7393e9dce7f3d4cf5c364167fc8d7cf2df4e5bf9ad9bb4dcf2ad2804c8422/download"))()`;

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
      copyToClipboard(defaultScriptText, "Rift Hub Loader copied to clipboard!");

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
      copyToClipboard(defaultScriptText, "Rift Hub Loader copied to clipboard!");
      const originalText = step1CopyBtn.innerHTML;
      step1CopyBtn.innerHTML = `<i class="fa-solid fa-check"></i> Copied!`;
      setTimeout(() => {
        step1CopyBtn.innerHTML = originalText;
      }, 2500);
    });
  }

  const gameSearch = document.getElementById('gameSearch');
  const gameFilters = document.getElementById('gameFilters');
  const gamesGrid = document.getElementById('gamesGrid');
  const gameCount = document.getElementById('gameCount');
  const gamesEmpty = document.getElementById('gamesEmpty');

  if (gamesGrid) {
    const cards = Array.from(gamesGrid.querySelectorAll('.catalog-card'));
    let activeFilter = 'all';

    const applyGameFilter = () => {
      const query = (gameSearch ? gameSearch.value : '').trim().toLowerCase();
      let visible = 0;

      cards.forEach(card => {
        const status = card.getAttribute('data-status');
        const name = card.getAttribute('data-name') || '';
        const matchesFilter = activeFilter === 'all' || status === activeFilter;
        const matchesSearch = !query || name.includes(query);
        const show = matchesFilter && matchesSearch;
        card.classList.toggle('is-hidden', !show);
        if (show) visible += 1;
      });

      if (gameCount) {
        gameCount.textContent = `${visible} title${visible === 1 ? '' : 's'}`;
      }
      if (gamesEmpty) {
        gamesEmpty.classList.toggle('show', visible === 0);
      }
    };

    if (gameFilters) {
      gameFilters.querySelectorAll('.filter-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          gameFilters.querySelectorAll('.filter-chip').forEach(other => other.classList.remove('active'));
          chip.classList.add('active');
          activeFilter = chip.getAttribute('data-filter');
          applyGameFilter();
        });
      });
    }

    if (gameSearch) {
      gameSearch.addEventListener('input', applyGameFilter);
    }
  }

  const copyModuleBtns = document.querySelectorAll('.copy-module-btn');
  copyModuleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (btn.hasAttribute('data-changelog')) {
        return;
      }
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
        <h4>1. Usage</h4>
        <p>By executing Rift Hub scripts, you use them for personal entertainment and testing purposes.</p>
        
        <h4>2. Access</h4>
        <p>Rift Hub is provided free of charge.</p>
      `
    },
    privacy: {
      title: "Privacy Policy",
      body: `
        <h4>1. Privacy</h4>
        <p>Rift Hub does not collect or store your personal data.</p>
      `
    },
    disclaimer: {
      title: "Legal Disclaimer",
      body: `
        <h4>1. Independent Project</h4>
        <p>Rift Hub is an independent project and is not affiliated with Roblox Corporation or any game creators.</p>
        
        <h4>2. Trademarks</h4>
        <p>All game titles and trademarks belong to their respective owners.</p>
      `
    },
    authorship: {
      title: "Script Authorship Notice",
      body: `
        <h4>1. Statement on Original Authorship</h4>
        <p>Killert unfairly and dishonestly appropriated my scripts after I explicitly revoked permission and prohibited their use. More than half of the scripts found in Casual Hub are my original intellectual work and code creations.</p>
        
        <h4>2. Authentic Source</h4>
        <p>Rift Hub is the authentic project maintained directly by the original author (qkaspq).</p>
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

  
  const changelogModalOverlay = document.getElementById('changelogModalOverlay');
  const changelogModalClose = document.getElementById('changelogModalClose');
  const changelogCopyBtn = document.getElementById('changelogCopyBtn');
  const changelogCard = document.querySelector('.changelog-modal-card');

  function openChangelogModal() {
    if (changelogModalOverlay) {
      changelogModalOverlay.classList.add('active');
      if (changelogCard) changelogCard.style.transform = '';
    }
  }

  function closeChangelogModal() {
    if (changelogModalOverlay) {
      changelogModalOverlay.classList.remove('active');
      if (changelogCard) changelogCard.style.transform = '';
    }
  }

  document.querySelectorAll('[data-changelog]').forEach(card => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      openChangelogModal();
    });
  });

  if (changelogModalClose) {
    changelogModalClose.addEventListener('click', closeChangelogModal);
  }

  if (changelogModalOverlay) {
    changelogModalOverlay.addEventListener('click', (e) => {
      if (e.target === changelogModalOverlay) {
        closeChangelogModal();
      }
    });

    if (changelogCard) {
      let modalCurRotX = 0, modalCurRotY = 0;
      let modalTargetRotX = 0, modalTargetRotY = 0;
      let modalCurTransX = 0, modalCurTransY = 0;
      let modalTargetTransX = 0, modalTargetTransY = 0;
      let modalRafId = 0;

      const modalTick = () => {
        modalCurRotX += (modalTargetRotX - modalCurRotX) * 0.12;
        modalCurRotY += (modalTargetRotY - modalCurRotY) * 0.12;
        modalCurTransX += (modalTargetTransX - modalCurTransX) * 0.12;
        modalCurTransY += (modalTargetTransY - modalCurTransY) * 0.12;

        const isStillMoving =
          Math.abs(modalTargetRotX - modalCurRotX) > 0.01 ||
          Math.abs(modalTargetRotY - modalCurRotY) > 0.01 ||
          Math.abs(modalTargetTransX - modalCurTransX) > 0.02 ||
          Math.abs(modalTargetTransY - modalCurTransY) > 0.02;

        if (isStillMoving) {
          changelogCard.style.transform = `perspective(1000px) rotateX(${modalCurRotX.toFixed(2)}deg) rotateY(${modalCurRotY.toFixed(2)}deg) translate3d(${modalCurTransX.toFixed(1)}px, ${modalCurTransY.toFixed(1)}px, 0)`;
          modalRafId = requestAnimationFrame(modalTick);
        } else {
          if (modalTargetRotX === 0 && modalTargetRotY === 0 && modalTargetTransX === 0 && modalTargetTransY === 0) {
            changelogCard.style.transform = '';
            modalRafId = 0;
          } else {
            changelogCard.style.transform = `perspective(1000px) rotateX(${modalCurRotX.toFixed(2)}deg) rotateY(${modalCurRotY.toFixed(2)}deg) translate3d(${modalCurTransX.toFixed(1)}px, ${modalCurTransY.toFixed(1)}px, 0)`;
            modalRafId = requestAnimationFrame(modalTick);
          }
        }
      };

      const startModalTick = () => {
        if (!modalRafId) modalRafId = requestAnimationFrame(modalTick);
      };

      changelogModalOverlay.addEventListener('mousemove', (e) => {
        if (!changelogModalOverlay.classList.contains('active')) return;
        const rect = changelogCard.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const normX = (e.clientX - centerX) / (rect.width / 2);
        const normY = (e.clientY - centerY) / (rect.height / 2);

        modalTargetRotX = Math.max(-7, Math.min(7, normY * -7));
        modalTargetRotY = Math.max(-7, Math.min(7, normX * 7));
        modalTargetTransX = Math.max(-10, Math.min(10, normX * 7));
        modalTargetTransY = Math.max(-10, Math.min(10, normY * 7));

        startModalTick();
      });

      changelogModalOverlay.addEventListener('mouseleave', () => {
        modalTargetRotX = 0;
        modalTargetRotY = 0;
        modalTargetTransX = 0;
        modalTargetTransY = 0;
        startModalTick();
      });
    }
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (legalModalOverlay) legalModalOverlay.classList.remove('active');
      closeChangelogModal();
    }
  });

  if (changelogCopyBtn) {
    changelogCopyBtn.addEventListener('click', () => {
      copyToClipboard(defaultScriptText, "Grow a Garden 2 script loader copied!");
      const btnText = changelogCopyBtn.querySelector('span');
      const icon = changelogCopyBtn.querySelector('i');
      if (btnText && icon) {
        const origText = btnText.textContent;
        btnText.textContent = "Copied Loader!";
        icon.className = "fa-solid fa-check";
        setTimeout(() => {
          btnText.textContent = origText;
          icon.className = "fa-solid fa-code";
        }, 2500);
      }
    });
  }

});

