/* =========================================================================
   The procession rail — a stylized 3D Rato Machhindranath chariot,
   pulled by the crowd. The procession only moves while the reader
   scrolls: stop to read, and the pullers rest; scroll on, and they pull.
   ========================================================================= */
function initChariotRail(rail, canvas) {
  "use strict";
  if (!window.THREE) return false;
  if (!window.matchMedia("(min-width: 1240px)").matches) return false;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  } catch (e) {
    return false;
  }
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 260);
  camera.position.set(0, 42, 34);
  camera.lookAt(0, 1, -8);

  // ---- light: warm valley afternoon ----
  scene.add(new THREE.AmbientLight(0xfff4e0, 0.75));
  const sun = new THREE.DirectionalLight(0xffe8c4, 0.95);
  sun.position.set(-8, 20, 6);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.camera.left = -14; sun.shadow.camera.right = 14;
  sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -26;
  scene.add(sun);

  // ---- street: procedural brick pavement, scrolled for motion ----
  function brickTexture() {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 256;
    const g = c.getContext("2d");
    g.fillStyle = "#b3a790"; g.fillRect(0, 0, 256, 256);
    const rows = 8, cols = 4;
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const off = (r % 2) * 32;
        const x = k * 64 + off - 32, y = r * 32;
        const t = 0.9 + Math.random() * 0.14;
        g.fillStyle = "rgb(" + (158 * t | 0) + "," + (138 * t | 0) + "," + (112 * t | 0) + ")";
        g.fillRect(x + 2, y + 2, 60, 28);
      }
    }
    g.fillStyle = "rgba(60,44,30,.12)";
    for (let r = 0; r <= rows; r++) g.fillRect(0, r * 32 - 1, 256, 2);
    const tx = new THREE.CanvasTexture(c);
    tx.wrapS = tx.wrapT = THREE.RepeatWrapping;
    tx.repeat.set(3, 22);
    return tx;
  }
  const streetTex = brickTexture();
  const street = new THREE.Mesh(
    new THREE.PlaneGeometry(13, 130),
    new THREE.MeshStandardMaterial({ map: streetTex, roughness: 1 })
  );
  street.rotation.x = -Math.PI / 2;
  street.position.z = -30;
  street.receiveShadow = true;
  scene.add(street);

  // curbs
  const curbMat = new THREE.MeshStandardMaterial({ color: 0x8f7f68, roughness: 1 });
  [-6.9, 6.9].forEach(x => {
    const curb = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.3, 130), curbMat);
    curb.position.set(x, 0.15, -30);
    curb.receiveShadow = true;
    scene.add(curb);
  });

  // ---- the chariot ----
  const chariot = new THREE.Group();
  const crimson = new THREE.MeshStandardMaterial({ color: 0x8b2015, roughness: 0.75 });
  const crimsonDeep = new THREE.MeshStandardMaterial({ color: 0x6e170e, roughness: 0.8 });
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9982a, roughness: 0.45, metalness: 0.55 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x3a2417, roughness: 0.9 });
  const green = new THREE.MeshStandardMaterial({ color: 0x3f5d33, roughness: 0.85 });
  const greenDark = new THREE.MeshStandardMaterial({ color: 0x33492a, roughness: 0.85 });

  // wheels — four great wooden wheels with crimson hubs
  const wheels = [];
  const wheelGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.42, 20);
  const hubGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.46, 16);
  [[-1.75, 1.4], [1.75, 1.4], [-1.75, -1.4], [1.75, -1.4]].forEach(p => {
    const w = new THREE.Group();
    const rim = new THREE.Mesh(wheelGeo, wood);
    rim.rotation.z = Math.PI / 2;
    const hub = new THREE.Mesh(hubGeo, crimsonDeep);
    hub.rotation.z = Math.PI / 2;
    w.add(rim); w.add(hub);
    w.position.set(p[0], 1.15, p[1]);
    w.traverse(o => { o.castShadow = true; });
    chariot.add(w);
    wheels.push(w);
  });

  // axle beam (Karkotaka, the serpent king, is the main beam)
  const beam = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 7.4), wood);
  beam.position.set(0, 1.1, -0.6);
  beam.castShadow = true;
  chariot.add(beam);

  // base platform + pavilion
  const base = new THREE.Mesh(new THREE.BoxGeometry(3.3, 1.3, 4.3), crimson);
  base.position.y = 2.15;
  base.castShadow = true;
  chariot.add(base);
  const trim = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.18, 4.5), gold);
  trim.position.y = 2.85;
  chariot.add(trim);
  const shrine = new THREE.Mesh(new THREE.BoxGeometry(2.2, 1.1, 2.2), crimsonDeep);
  shrine.position.y = 3.5;
  shrine.castShadow = true;
  chariot.add(shrine);
  const roof = new THREE.Mesh(new THREE.ConeGeometry(1.8, 0.9, 4), gold);
  roof.rotation.y = Math.PI / 4;
  roof.position.y = 4.5;
  roof.castShadow = true;
  chariot.add(roof);

  // the great leaning spire of greenery
  const spire = new THREE.Group();
  const segs = 11;
  for (let i = 0; i < segs; i++) {
    const t = i / (segs - 1);
    const r = 1.35 * (1 - t) + 0.16 * t;
    const seg = new THREE.Mesh(
      new THREE.CylinderGeometry(r * 0.82, r, 0.85, 10),
      i % 3 === 2 ? greenDark : green
    );
    seg.position.y = i * 0.8;
    seg.position.z = -Math.pow(t, 1.6) * 2.2;   /* the forward curve */
    seg.rotation.x = -t * 0.32;
    seg.castShadow = i % 2 === 0;
    spire.add(seg);
    if (i === 3 || i === 7) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.07, 8, 18), gold);
      ring.rotation.x = Math.PI / 2 - t * 0.32;
      ring.position.copy(seg.position);
      spire.add(ring);
    }
  }
  const finial = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.7, 8), gold);
  finial.position.set(0, segs * 0.8 + 0.2, -2.35);
  spire.add(finial);
  spire.position.y = 4.7;
  chariot.add(spire);

  chariot.position.z = 3.5;
  scene.add(chariot);

  // ---- ropes ----
  const ropeMat = new THREE.LineBasicMaterial({ color: 0xe6d8bd });
  function rope(x) {
    const pts = [];
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push(new THREE.Vector3(
        x * (1 - t * 0.25),
        1.6 - Math.sin(t * Math.PI) * 0.55 - t * 0.65,
        1.4 - t * 13.4
      ));
    }
    return new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ropeMat);
  }
  scene.add(rope(-1.15));
  scene.add(rope(1.15));

  // ---- the crowd: pullers on the ropes, companions alongside ----
  const clothColors = [0x8b2015, 0xb0522a, 0x6e5a3e, 0x314a44, 0x7a2f42, 0x54462f, 0x9c6b1f, 0x44392e];
  const skin = new THREE.MeshStandardMaterial({ color: 0xc99b72, roughness: 0.9 });
  const people = [];

  function person(x, z, phase) {
    const g = new THREE.Group();
    const cloth = new THREE.MeshStandardMaterial({
      color: clothColors[(Math.random() * clothColors.length) | 0],
      roughness: 0.9
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.22, 0.62, 8), cloth);
    body.position.y = 0.62;
    body.castShadow = true;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.155, 10, 8), skin);
    head.position.y = 1.08;
    head.castShadow = true;
    const legL = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.05, 0.36, 6), skin);
    const legR = legL.clone();
    legL.position.set(-0.08, 0.18, 0);
    legR.position.set(0.08, 0.18, 0);
    g.add(body); g.add(head); g.add(legL); g.add(legR);
    g.position.set(x, 0, z);
    g.scale.setScalar(1.45);
    g.userData = { phase: phase, legL: legL, legR: legR, x: x };
    scene.add(g);
    people.push(g);
    return g;
  }

  // two columns of pullers along the ropes
  for (let i = 0; i < 7; i++) {
    person(-1.05 - (i % 2) * 0.5, 0.4 - i * 1.75, Math.random() * Math.PI * 2);
    person(1.05 + (i % 2) * 0.5, 0.4 - i * 1.75, Math.random() * Math.PI * 2);
  }
  // companions walking beside and behind the chariot
  person(-3.3, 3.2, 1.2); person(3.3, 4.1, 2.6);
  person(-2.9, 7.4, 0.4); person(2.8, 7.9, 3.4); person(0.3, 8.8, 5.1); person(-1.2, 9.4, 2.2);

  // ---- motion: scroll pulls the procession ----
  let speed = 0;          // current speed
  let target = 0;         // decays quickly once scrolling stops
  let lastY = scrollY;
  let wobT = 0;

  addEventListener("scroll", () => {
    const dy = Math.abs(scrollY - lastY);
    lastY = scrollY;
    target = Math.min(9, target + dy * 0.045);
  }, { passive: true });

  function resize() {
    const w = rail.clientWidth, h = rail.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);

  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);

    target *= Math.pow(0.06, dt);                 // stop soon after scrolling stops
    speed += (target - speed) * Math.min(1, dt * 6);
    if (speed < 0.01) speed = 0;

    // street flows beneath the procession
    streetTex.offset.y -= speed * dt * 0.11;

    // wheels roll
    wheels.forEach(w => { w.children.forEach(c => { c.rotation.x -= speed * dt / 1.15; }); });

    // the tall spire sways with the pull
    wobT += dt * (1 + speed * 0.6);
    spire.rotation.z = Math.sin(wobT * 1.3) * (0.008 + speed * 0.004);
    spire.rotation.x = Math.sin(wobT * 0.9) * 0.006 * speed;
    chariot.position.y = Math.abs(Math.sin(wobT * 2.1)) * 0.02 * speed;

    // the crowd: lean into the ropes and step while moving, rest when still
    const effort = Math.min(1, speed / 3);
    people.forEach(p => {
      const u = p.userData;
      u.phase += dt * (2 + speed * 2.2);
      p.rotation.x = -0.3 * effort;
      p.position.y = Math.abs(Math.sin(u.phase)) * 0.055 * effort;
      p.position.x = u.x + Math.sin(u.phase * 0.5) * 0.02 * effort;
      u.legL.rotation.x = Math.sin(u.phase) * 0.7 * effort;
      u.legR.rotation.x = -Math.sin(u.phase) * 0.7 * effort;
    });

    renderer.render(scene, camera);
  }

  rail.classList.add("on");
  resize();
  renderer.render(scene, camera);   /* first paint even if rAF is throttled */
  requestAnimationFrame(tick);
  return true;
}
