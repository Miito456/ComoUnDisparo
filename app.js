/**
 * COMO UN DISPARO — AISSA ft. NICKZZY
 * Professional Dynamic 3D Web Engine (Three.js)
 * Features:
 *  - Bullet ONLY rotates when user is actively scrolling (freezes when idle)
 *  - Dynamic section-by-section background color morphing & nav contrast
 *  - Realistic tactical 2011 pistol with 3D mouse parallax
 *  - Procedural 108 BPM Afro-Drill beat preview
 *  - Robust safe clipboard and error-handling
 */

document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     1. THREE.JS 3D SCENE & REALISTIC PISTOL SETUP
     ========================================================================== */
  const canvas3D = document.getElementById('webgl-canvas');
  let scene, camera, renderer;
  let gunGroup, gunMesh, gunMat, shadowMat;
  let muzzleFlashGroup, flashCore, shockRing, flashLight;
  let bulletGroup, bulletMesh, chromeSilverMat, goldenBrassMat, redSealantMat, primerMat, bulletLight;
  const BULLET_BASE_SCALE = 0.50; // Sleek, realistic compact 9mm caliber scale

  // DOM HUD Telemetry Elements
  const hudDot = document.getElementById('hud-dot');
  const hudStatus = document.getElementById('hud-status');
  const hudSection = document.getElementById('hud-section');

  let mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
  let scrollProgress = 0;
  let smoothScroll = 0;
  let animTime = 0;

  // SCROLL VELOCITY ENGINE (Bullet only rotates when scrolling)
  let lastScrollY = window.scrollY;
  let scrollVelocity = 0;
  let isScrolling = false;
  let scrollTimer = null;

  function init3D() {
    if (!canvas3D || typeof THREE === 'undefined') return;

    try {
      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
      camera.position.set(0, 0, 16);

      renderer = new THREE.WebGLRenderer({
        canvas: canvas3D,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.25);
      scene.add(ambientLight);

      const keyLight = new THREE.DirectionalLight(0xffffff, 1.9);
      keyLight.position.set(8, 12, 10);
      scene.add(keyLight);

      const rimLight = new THREE.DirectionalLight(0xff3300, 2.8);
      rimLight.position.set(-10, -6, -8);
      scene.add(rimLight);

      const bottomFill = new THREE.DirectionalLight(0xffffff, 0.65);
      bottomFill.position.set(0, -10, 8);
      scene.add(bottomFill);

      // Studio Reflection Map for photorealistic Chrome & Brass gleam
      scene.environment = createStudioEnvironment();

      // Models
      buildRealisticPistol3D();
      buildBullet3D();

      // Events
      window.addEventListener('resize', onWindowResize, { passive: true });
      window.addEventListener('mousemove', (e) => {
        mouse.targetX = (e.clientX / window.innerWidth) * 2 - 1;
        mouse.targetY = -(e.clientY / window.innerHeight) * 2 + 1;
      }, { passive: true });

      // Start loop
      animate3D();
    } catch (err) {
      console.warn('WebGL init error:', err);
    }
  }

  /* ==========================================================================
     REALISTIC TACTICAL PISTOL (High-Res Photographic Texture with 3D Depth)
     ========================================================================== */
  function buildRealisticPistol3D() {
    gunGroup = new THREE.Group();

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      'assets/gun_realistic_right.png',
      (texture) => {
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;

        // Aspect ratio: 538 / 344 = ~1.564
        const planeWidth = 7.4;
        const planeHeight = planeWidth / 1.564;

        const gunGeo = new THREE.PlaneGeometry(planeWidth, planeHeight);
        gunMat = new THREE.MeshStandardMaterial({
          map: texture,
          transparent: true,
          alphaTest: 0.05,
          roughness: 0.35,
          metalness: 0.85,
          side: THREE.DoubleSide
        });

        gunMesh = new THREE.Mesh(gunGeo, gunMat);
        gunGroup.add(gunMesh);

        // Soft depth shadow
        shadowMat = new THREE.MeshBasicMaterial({
          map: texture,
          transparent: true,
          opacity: 0.28,
          color: 0x000000
        });
        const shadowMesh = new THREE.Mesh(gunGeo, shadowMat);
        shadowMesh.position.set(-0.14, -0.16, -0.25);
        gunGroup.add(shadowMesh);

        // Muzzle Blast System at barrel tip (x = +3.4, y = +1.45)
        muzzleFlashGroup = new THREE.Group();
        muzzleFlashGroup.position.set(3.4, 1.45, 0.05);

        // 1. Core star/diamond flash
        const coreGeo = new THREE.PlaneGeometry(1.6, 1.6);
        const coreMat = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false
        });
        flashCore = new THREE.Mesh(coreGeo, coreMat);
        muzzleFlashGroup.add(flashCore);

        // 2. Fiery expanding shockwave ring (aligned with shot axis +X)
        const ringGeo = new THREE.RingGeometry(0.18, 0.55, 32);
        const ringMat = new THREE.MeshBasicMaterial({
          color: 0xff6600,
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        shockRing = new THREE.Mesh(ringGeo, ringMat);
        shockRing.rotation.y = Math.PI / 2; // Face forward along firing direction (+X)
        muzzleFlashGroup.add(shockRing);

        // 3. Dynamic flash light
        flashLight = new THREE.PointLight(0xffcc44, 0, 12);
        muzzleFlashGroup.add(flashLight);

        gunGroup.add(muzzleFlashGroup);
      },
      undefined,
      (err) => console.warn('Texture load fallback:', err)
    );

    gunGroup.position.set(-0.2, 2.0, 5.5);
    gunGroup.rotation.set(0.08, -0.12, -0.02);
    scene.add(gunGroup);
  }

  /* ==========================================================================
     STUDIO ENVIRONMENT REFLECTION (Crisp Softboxes & Razor Horizon for Chrome & Gold)
     ========================================================================== */
  function createStudioEnvironment() {
    const envCanvas = document.createElement('canvas');
    envCanvas.width = 512;
    envCanvas.height = 256;
    const ctx = envCanvas.getContext('2d');

    // Studio horizon gradient: high-contrast chrome reflex
    const grad = ctx.createLinearGradient(0, 0, 0, 256);
    grad.addColorStop(0.0, '#ffffff'); // bright studio ceiling
    grad.addColorStop(0.2, '#ddeeff'); // soft sky fill
    grad.addColorStop(0.48, '#778899'); // horizon falloff
    grad.addColorStop(0.50, '#101216'); // sharp dark horizon line (gives chrome its razor reflections!)
    grad.addColorStop(0.75, '#22262d'); // ground bounce
    grad.addColorStop(1.0, '#443322'); // warm floor tone
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 256);

    // Studio softbox 1 (Key light reflex)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
    ctx.fillRect(60, 20, 110, 80);

    // Studio softbox 2 (Rim reflex)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.fillRect(340, 30, 90, 60);

    // Subtle warm rim reflex for brass
    ctx.fillStyle = 'rgba(255, 215, 120, 0.45)';
    ctx.fillRect(180, 160, 160, 40);

    const texture = new THREE.CanvasTexture(envCanvas);
    texture.mapping = THREE.EquirectangularReflectionMapping;
    return texture;
  }

  /* ==========================================================================
     TACTICAL 3D 9MM BULLET (Polished Silver Chrome Tip, Red Sealant Ring, Gold Brass Case)
     Exact 1:1 match to user reference render
     ========================================================================== */
  function buildBullet3D() {
    bulletGroup = new THREE.Group();
    bulletMesh = new THREE.Group();
    bulletGroup.add(bulletMesh);

    // 1. Silver Chrome Projectile Tip (Mirror polish)
    chromeSilverMat = new THREE.MeshStandardMaterial({
      color: 0xf2f5f8,
      metalness: 0.98,
      roughness: 0.08,
      envMapIntensity: 2.2
    });

    // 2. Vibrant Red Lacquer Sealant Ring
    redSealantMat = new THREE.MeshStandardMaterial({
      color: 0xdc1424,
      metalness: 0.15,
      roughness: 0.32
    });

    // 3. Golden Polished Brass Casing
    goldenBrassMat = new THREE.MeshStandardMaterial({
      color: 0xebb748,
      metalness: 0.96,
      roughness: 0.16,
      envMapIntensity: 1.9
    });

    // 4. Extractor Groove & Base Primer
    const grooveMat = new THREE.MeshStandardMaterial({
      color: 0xd4a537,
      metalness: 0.94,
      roughness: 0.28
    });

    primerMat = new THREE.MeshStandardMaterial({
      color: 0xdfaf42,
      metalness: 0.92,
      roughness: 0.20
    });

    // --- A. Silver Chrome Ogive Projectile Tip ---
    const tipPoints = [
      new THREE.Vector2(0.4500, 0.0000),
      new THREE.Vector2(0.4393, 0.0594),
      new THREE.Vector2(0.4228, 0.1187),
      new THREE.Vector2(0.4030, 0.1781),
      new THREE.Vector2(0.3807, 0.2375),
      new THREE.Vector2(0.3564, 0.2969),
      new THREE.Vector2(0.3303, 0.3562),
      new THREE.Vector2(0.3026, 0.4156),
      new THREE.Vector2(0.2735, 0.4750),
      new THREE.Vector2(0.2430, 0.5344),
      new THREE.Vector2(0.2114, 0.5938),
      new THREE.Vector2(0.1786, 0.6531),
      new THREE.Vector2(0.1448, 0.7125),
      new THREE.Vector2(0.1100, 0.7719),
      new THREE.Vector2(0.0742, 0.8312),
      new THREE.Vector2(0.0375, 0.8906),
      new THREE.Vector2(0.0000, 0.9500)
    ];
    const tipGeo = new THREE.LatheGeometry(tipPoints, 32);
    const tipMesh = new THREE.Mesh(tipGeo, chromeSilverMat);
    tipMesh.position.set(0, 0.41, 0); // Sits right above red sealant ring
    bulletMesh.add(tipMesh);

    // --- B. Vibrant Red Sealant Band (Case Mouth) ---
    const redBandGeo = new THREE.CylinderGeometry(0.453, 0.453, 0.07, 32);
    const redBandMesh = new THREE.Mesh(redBandGeo, redSealantMat);
    redBandMesh.position.set(0, 0.375, 0);
    bulletMesh.add(redBandMesh);

    // --- C. Golden Brass Main Casing Cylinder ---
    const caseGeo = new THREE.CylinderGeometry(0.45, 0.45, 1.45, 32);
    const caseMesh = new THREE.Mesh(caseGeo, goldenBrassMat);
    caseMesh.position.set(0, -0.385, 0);
    bulletMesh.add(caseMesh);

    // --- D. Extractor Groove (Beveled cut) ---
    const grooveGeo = new THREE.CylinderGeometry(0.395, 0.395, 0.14, 32);
    const grooveMesh = new THREE.Mesh(grooveGeo, grooveMat);
    grooveMesh.position.set(0, -1.17, 0);
    bulletMesh.add(grooveMesh);

    // --- E. Extractor Rim Flange ---
    const rimGeo = new THREE.CylinderGeometry(0.465, 0.465, 0.12, 32);
    const rimMesh = new THREE.Mesh(rimGeo, goldenBrassMat);
    rimMesh.position.set(0, -1.29, 0);
    bulletMesh.add(rimMesh);

    // --- F. Detailed Primer Base (Rear Face) ---
    const pocketGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.02, 24);
    const pocketMat = new THREE.MeshBasicMaterial({ color: 0x332611 });
    const pocketMesh = new THREE.Mesh(pocketGeo, pocketMat);
    pocketMesh.position.set(0, -1.355, 0);
    bulletMesh.add(pocketMesh);

    const primerGeo = new THREE.CylinderGeometry(0.20, 0.20, 0.03, 24);
    const primerMesh = new THREE.Mesh(primerGeo, primerMat);
    primerMesh.position.set(0, -1.352, 0);
    bulletMesh.add(primerMesh);

    // Dynamic environmental light on bullet
    bulletLight = new THREE.PointLight(0xff3300, 1.4, 8);
    bulletLight.position.set(0.3, 0.4, 0.6);
    bulletGroup.add(bulletLight);

    bulletGroup.scale.set(BULLET_BASE_SCALE, BULLET_BASE_SCALE, BULLET_BASE_SCALE);
    bulletGroup.position.set(3.2, 3.45, 5.5);
    bulletGroup.visible = false;

    scene.add(bulletGroup);
  }

  /* ==========================================================================
     SCROLL TRACKER & VELOCITY ENGINE
     ========================================================================== */
  function onScroll() {
    const currentScrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    scrollProgress = maxScroll > 0 ? Math.min(Math.max(currentScrollY / maxScroll, 0), 1) : 0;

    // Calculate scroll delta
    const delta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    // Instantaneous scroll velocity with smooth clamp
    scrollVelocity = Math.max(Math.min(delta * 0.032, 0.6), -0.6);
    isScrolling = true;

    // Update Telemetry HUD
    if (hudStatus && Math.abs(delta) > 0) {
      const speedKm = Math.min(Math.abs(Math.round(delta * 22)), 980);
      hudStatus.textContent = `VEL // ${speedKm} M/S`;
      hudStatus.style.color = '#efff04';
    }
    if (hudDot) {
      hudDot.style.top = `${scrollProgress * 100}%`;
    }

    // Reset idle timeout
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => {
      isScrolling = false;
    }, 45);

    // Update Section Background Color Morphing
    updateSectionColorTheme();
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ==========================================================================
     DYNAMIC BACKGROUND MORPHING (Adapts color between sections smoothly)
     ========================================================================== */
  const colorSections = document.querySelectorAll('.color-section');
  let currentActiveSectionId = '';

  function updateSectionColorTheme() {
    const triggerY = window.innerHeight * 0.45;
    let activeSec = colorSections[0];

    colorSections.forEach((sec) => {
      const rect = sec.getBoundingClientRect();
      if (rect.top <= triggerY && rect.bottom >= triggerY) {
        activeSec = sec;
      }
    });

    if (activeSec && activeSec.id !== currentActiveSectionId) {
      currentActiveSectionId = activeSec.id;
      const targetBg = activeSec.getAttribute('data-bg');
      const targetText = activeSec.getAttribute('data-text');
      const navMode = activeSec.getAttribute('data-nav-mode');

      // Apply background color to body
      if (targetBg) document.body.style.backgroundColor = targetBg;
      if (targetText) document.body.style.color = targetText;

      // Toggle nav mode class for high contrast header
      if (navMode === 'light-elements') {
        document.body.classList.add('nav-light');
      } else {
        document.body.classList.remove('nav-light');
      }

      // Update HUD Section indicator
      if (hudSection) {
        const secLabels = {
          'hero': '[00] HERO',
          'reproductor': '[01] AUDIO',
          'letra': '[02] LETRA',
          'cancion': '[03] TEMA',
          'artista': '[04] ARTISTA'
        };
        hudSection.textContent = secLabels[activeSec.id] || '[00] COMO UN DISPARO';
      }

      // Dynamic light color on bullet to reflect section atmosphere
      if (bulletLight) {
        const lightColors = {
          'hero': 0xff3300,
          'reproductor': 0xff5500,
          'letra': 0xe6a832,
          'cancion': 0xefff04,
          'artista': 0xe05a30
        };
        bulletLight.color.setHex(lightColors[activeSec.id] || 0xffffff);
      }
    }
  }

  /* ==========================================================================
     3D ANIMATION LOOP (Bullet ONLY rotates when scrolling)
     ========================================================================== */
  function animate3D() {
    requestAnimationFrame(animate3D);

    if (!renderer || !scene || !camera) return;

    animTime += 0.016;

    // Smooth lerps
    mouse.x += (mouse.targetX - mouse.x) * 0.06;
    mouse.y += (mouse.targetY - mouse.y) * 0.06;
    smoothScroll += (scrollProgress - smoothScroll) * 0.08;

    // Dampen scroll velocity to zero when not scrolling
    if (!isScrolling) {
      scrollVelocity *= 0.82;
      if (Math.abs(scrollVelocity) < 0.0001) {
        scrollVelocity = 0;
        if (hudStatus) {
          hudStatus.textContent = 'IDLE // 0 M/S';
          hudStatus.style.color = '';
        }
      }
    }

    // CRITICAL USER CONSTRAINT:
    // The bullet ONLY rotates on its cylinder axis when user is actively scrolling!
    // When idle, scrollVelocity is 0 and bulletMesh stays completely frozen!
    if (bulletMesh && Math.abs(scrollVelocity) > 0.0001) {
      bulletMesh.rotation.y += scrollVelocity;
    }

    // Responsive right corridor position (stays in margin, never over text)
    const corridorX = Math.min(camera.aspect * 3.7, 5.5);

    // -------------------------------------------------------------
    // CHOREOGRAPHY
    // -------------------------------------------------------------
    if (smoothScroll < 0.16) {
      // PHASE 1: HERO & CINEMATIC FIRING SEQUENCE
      const t = smoothScroll / 0.16;

      // --- A. PISTOL RECOIL BLOWBACK ---
      if (gunGroup) {
        gunGroup.visible = true;

        // Snappy mechanical impulse: slide kicks back fast at initial scroll, then elastically recovers
        let recoilKick = 0;
        let recoilPitch = 0;
        if (t < 0.14) {
          const snapT = t / 0.14;
          const kickImpulse = Math.sin(Math.min(snapT * Math.PI, Math.PI));
          recoilKick = Math.pow(kickImpulse, 1.6) * 1.10;
          recoilPitch = Math.pow(kickImpulse, 1.4) * 0.28;
        }

        gunGroup.position.x = -0.3 + mouse.x * 0.3 - recoilKick - t * 4.4;
        gunGroup.position.y = 2.0 + Math.sin(animTime * 1.4) * 0.05 + mouse.y * 0.25 + recoilKick * 0.38;
        gunGroup.position.z = 5.5 - t * 3.5;

        gunGroup.rotation.y = -0.12 + mouse.x * 0.15;
        gunGroup.rotation.x = 0.08 - mouse.y * 0.12;
        gunGroup.rotation.z = -0.02 + recoilPitch + mouse.x * 0.03;

        // Smooth fade out as gun slides away
        if (gunMat) {
          gunMat.opacity = Math.max(0, 1 - Math.max(0, (t - 0.22) / 0.72));
        }
        if (shadowMat && gunMat) {
          shadowMat.opacity = gunMat.opacity * 0.25;
        }

        // --- B. CINEMATIC MUZZLE BLAST & EXPANDING SHOCKWAVE RING ---
        if (muzzleFlashGroup) {
          if (t >= 0.015 && t <= 0.09) {
            const blastT = (t - 0.015) / 0.075;
            const blastPulse = Math.sin(blastT * Math.PI);

            flashCore.scale.setScalar(0.4 + blastPulse * 2.4);
            flashCore.material.opacity = blastPulse;

            shockRing.scale.setScalar(0.3 + blastT * 3.8);
            shockRing.position.x = blastT * 2.0;
            shockRing.material.opacity = Math.pow(1.0 - blastT, 1.5) * blastPulse * 1.3;

            flashLight.intensity = blastPulse * 6.0;
          } else {
            if (flashCore) flashCore.material.opacity = 0;
            if (shockRing) shockRing.material.opacity = 0;
            if (flashLight) flashLight.intensity = 0;
          }
        }
      }

      // --- C. SUPERSONIC BULLET EXIT & FLIGHT TRANSITION ---
      if (bulletGroup) {
        if (t < 0.02) {
          bulletGroup.visible = false;
        } else {
          bulletGroup.visible = true;

          const barrelTipX = (gunGroup ? gunGroup.position.x : -0.3) + 3.4;
          const barrelTipY = (gunGroup ? gunGroup.position.y : 2.0) + 1.45;

          const flightT = Math.min(Math.max((t - 0.02) / 0.98, 0), 1);

          if (flightT < 0.22) {
            // STAGE 1: SUPERSONIC FORWARD BURST (High-velocity forward surge out of muzzle)
            const burstProgress = flightT / 0.22;
            const burstEase = Math.sin(burstProgress * Math.PI * 0.5);

            // Shoots straight forward out of the barrel tip along +X
            bulletGroup.position.x = barrelTipX + burstEase * 2.8;
            bulletGroup.position.y = barrelTipY;
            bulletGroup.position.z = 5.5 + burstEase * 1.0;

            // Pointing directly forward (horizontal right)
            bulletGroup.rotation.z = -Math.PI / 2;
            bulletGroup.rotation.x = 0;
            bulletGroup.rotation.y = 0;

            // High-speed supersonic velocity stretch
            const stretch = 1.0 + Math.sin(burstProgress * Math.PI) * 0.42;
            bulletGroup.scale.set(
              BULLET_BASE_SCALE / Math.sqrt(stretch),
              BULLET_BASE_SCALE * stretch,
              BULLET_BASE_SCALE / Math.sqrt(stretch)
            );

          } else {
            // STAGE 2: AERODYNAMIC CURVE INTO CORRIDOR (Decelerates into right companion rail)
            const arcProgress = (flightT - 0.22) / 0.78;
            const arcEase = Math.pow(arcProgress, 0.7);

            const startArcX = barrelTipX + 2.8;

            bulletGroup.position.x = THREE.MathUtils.lerp(startArcX, corridorX, arcEase) + mouse.x * 0.1;
            bulletGroup.position.y = THREE.MathUtils.lerp(barrelTipY, 1.2, arcProgress);
            bulletGroup.position.z = THREE.MathUtils.lerp(6.5, 8.5, arcProgress);

            // Smooth heading rotation into downward dive posture
            bulletGroup.rotation.z = THREE.MathUtils.lerp(-Math.PI / 2, -Math.PI * 0.88, arcEase);
            bulletGroup.rotation.x = 0.15;
            bulletGroup.rotation.y = -0.10;

            // Stabilize to compact, sleek base scale
            bulletGroup.scale.set(BULLET_BASE_SCALE, BULLET_BASE_SCALE, BULLET_BASE_SCALE);
          }
        }
      }

      camera.position.set(0, 0, 16);
      camera.lookAt(0, 0, 0);

    } else {
      // PHASE 2: DESCENT THROUGH CONTENT SECTIONS (Dedicated Companion Rail)
      const t = (smoothScroll - 0.16) / 0.84;

      if (gunGroup) gunGroup.visible = false;

      if (bulletGroup) {
        bulletGroup.visible = true;

        // The bullet stays strictly along the dedicated right corridor!
        // Never wandering across the central content or lyrics!
        bulletGroup.position.x = corridorX + mouse.x * 0.15;
        bulletGroup.position.y = 1.2 - t * 3.2 + Math.sin(animTime * 2.0) * 0.05;
        bulletGroup.position.z = 8.5;

        // Sleek compact 9mm scale
        bulletGroup.scale.set(BULLET_BASE_SCALE, BULLET_BASE_SCALE, BULLET_BASE_SCALE);

        // Aerodynamic downwards heading
        bulletGroup.rotation.z = -Math.PI * 0.88;
        bulletGroup.rotation.x = 0.15 + mouse.y * 0.08;
        bulletGroup.rotation.y = -0.10 + mouse.x * 0.12;
      }

      camera.position.x = mouse.x * 0.4;
      camera.position.y = mouse.y * 0.3;
      camera.lookAt(0, 0, 0);
    }

    renderer.render(scene, camera);
  }

  function onWindowResize() {
    if (!camera || !renderer) return;
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateSectionColorTheme();
  }

  init3D();
  updateSectionColorTheme();

  /* ==========================================================================
     2. PROCEDURAL 108 BPM AFRO-DRILL BEAT PREVIEW
     ========================================================================== */
  let audioCtx = null;
  let masterGain = null;
  let isBeatPlaying = false;
  let beatInterval = null;
  let beatStep = 0;

  function initAudio() {
    if (!audioCtx) {
      try {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
          masterGain = audioCtx.createGain();
          masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
          masterGain.connect(audioCtx.destination);
        }
      } catch (e) {
        console.warn('AudioContext unavailable:', e);
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playKick() {
    if (!audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.09);

    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(now);
    osc.stop(now + 0.22);
  }

  function playHiHat(isRoll = false) {
    if (!audioCtx || !masterGain) return;
    const count = isRoll ? 3 : 1;
    for (let c = 0; c < count; c++) {
      const time = audioCtx.currentTime + c * 0.07;
      const bufferSize = audioCtx.sampleRate * 0.05;
      const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (audioCtx.sampleRate * 0.012));
      }

      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;

      const bandpass = audioCtx.createBiquadFilter();
      bandpass.type = 'bandpass';
      bandpass.frequency.setValueAtTime(8000, time);
      bandpass.Q.setValueAtTime(3, time);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.4, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

      noise.connect(bandpass);
      bandpass.connect(gain);
      gain.connect(masterGain);
      noise.start(time);
    }
  }

  function playAfroChord() {
    if (!audioCtx || !masterGain) return;
    const now = audioCtx.currentTime;
    const notes = [185.00, 220.00, 277.18, 329.63];
    notes.forEach((freq, idx) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = idx % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + 0.7);
    });
  }

  const btnToggleBeat = document.getElementById('btn-toggle-beat');
  const beatIcon = document.getElementById('beat-icon');
  const beatLabel = document.getElementById('beat-label');
  const vinylDisc = document.getElementById('vinyl-disc');
  const liveIndicator = document.getElementById('live-indicator');

  if (btnToggleBeat) {
    btnToggleBeat.addEventListener('click', () => {
      initAudio();
      isBeatPlaying = !isBeatPlaying;

      if (isBeatPlaying) {
        if (beatIcon) beatIcon.textContent = '⏸';
        if (beatLabel) beatLabel.textContent = 'PAUSAR BEAT';
        if (vinylDisc) vinylDisc.classList.add('spinning');
        if (liveIndicator) {
          liveIndicator.textContent = 'ON AIR';
          liveIndicator.classList.add('playing');
        }

        const stepTimeMs = ((60 / 108) / 4) * 1000;
        beatStep = 0;
        beatInterval = setInterval(() => {
          if (beatStep === 0 || beatStep === 6 || beatStep === 10) playKick();
          if (beatStep === 4 || beatStep === 12) playHiHat(false);
          if (beatStep % 2 === 0) playHiHat(false);
          else if (beatStep === 15) playHiHat(true);
          if (beatStep === 0 || beatStep === 8) playAfroChord();

          beatStep = (beatStep + 1) % 16;
        }, stepTimeMs);

      } else {
        if (beatIcon) beatIcon.textContent = '▶';
        if (beatLabel) beatLabel.textContent = 'REPRODUCIR BEAT';
        if (vinylDisc) vinylDisc.classList.remove('spinning');
        if (liveIndicator) {
          liveIndicator.textContent = 'STANDBY';
          liveIndicator.classList.remove('playing');
        }

        if (beatInterval) {
          clearInterval(beatInterval);
          beatInterval = null;
        }
      }
    });
  }

  /* ==========================================================================
     3. SAFE CLIPBOARD COPY
     ========================================================================== */
  function copyTextSafely(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        textArea.remove();
        if (successful) resolve();
        else reject(new Error('Copy failed'));
      } catch (err) {
        reject(err);
      }
    });
  }

  const btnCopyLyrics = document.getElementById('btn-copy-lyrics');
  if (btnCopyLyrics) {
    btnCopyLyrics.addEventListener('click', () => {
      const lyricLines = document.querySelectorAll('.lyric-line');
      const textToCopy = Array.from(lyricLines)
        .map(l => l.textContent.trim())
        .join('\n');

      copyTextSafely(textToCopy)
        .then(() => {
          const prev = btnCopyLyrics.textContent;
          btnCopyLyrics.textContent = '✓ ¡COPIADA!';
          btnCopyLyrics.style.background = '#00cc66';
          setTimeout(() => {
            btnCopyLyrics.textContent = prev;
            btnCopyLyrics.style.background = '';
          }, 2000);
        })
        .catch(() => {
          btnCopyLyrics.textContent = 'LISTA';
          setTimeout(() => {
            btnCopyLyrics.textContent = 'COPIAR LETRA 📋';
          }, 1500);
        });
    });
  }

  console.log('⚡ Dynamic Engine Loaded: Scroll-Only Bullet Spin + Section Background Morphing.');
});
