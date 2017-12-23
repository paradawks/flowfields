export default function flowfieldSketch (p) {


  // Configurable variables

  let width;
  let height;
  let outer;

  let particleCount;
  let particleExpire;

  let flowCellSize;
  let flowAccuracy;
  let flowDrift;
  let flowDriftScale;
  let noiseScale;
  let noiseRadius;
  let noiseSeed;

  // Calculated values

  let flowWidth;
  let flowHeight;
  let flowGrid;

  // State

  let redraw = false;
  let recalc = true;

  let particles;
  let strokeWeight;

  let color1;
  let color2;
  let color3;
  let backgroundColor;

  let color1rgb;
  let color2rgb;
  let color3rgb;
  let backgroundrgb;

  let colorScaling;
  let colorSpread;
  let colorType = 0;

  let fadeAmount;
  let fadeSpeed;

  let paused = false;
  let prevTriggerSave = false;
  let triggerSave = false;

  let prevProps;

  let fadeOffset = 0;
  let fadeLastTime = 0;

  function triggerRedraw(prev, next) {
    redraw = prev.redraw !== next.redraw;
  }

  function triggerRecalc(prev, next) {
    const recalcFields = [
      'particleCount',
      'particleExpire',
      'flowCellSize',
      'flowAccuracy',
      'flowDrift',
      'flowDriftScale',
      'noiseScale',
      'noiseRadius',
      'noiseSeed',
      'strokeWeight',
      'colorScaling',
      'colorSpread',
      'canvasHeight',
      'canvasWidth',
      'outer',
      'color1',
      'color2',
      'color3',
      'backgroundColor',
      'fadeAmount',
      'fadeSpeed',
    ];
    recalcFields.forEach( (field) => { if (prev[field] !== next[field]) recalc = true; });
  }

  p.myCustomRedrawAccordingToNewPropsHandler = (props) => {
    // console.log(props);

    particleCount = parseInt(props.particleCount, 10);
    particleExpire = parseInt(props.particleExpire, 10);
    flowCellSize = parseInt(props.flowCellSize, 10);
    flowAccuracy = parseInt(props.flowAccuracy, 10);
    flowDrift = parseInt(props.flowDrift, 10);
    flowDriftScale = parseInt(props.flowDriftScale, 10);
    noiseScale = parseFloat(props.noiseScale);
    noiseRadius = parseInt(props.noiseRadius, 10);
    noiseSeed = parseInt(props.noiseSeed, 10);
    strokeWeight = parseInt(props.strokeWeight, 10);
    colorScaling = parseInt(props.colorScaling, 10);
    colorSpread = parseInt(props.colorSpread, 10);
    outer = parseInt(props.outer, 10);
    fadeAmount = parseInt(props.fadeAmount, 10);
    fadeSpeed = parseInt(props.fadeSpeed, 10);

    color1rgb = props.color1;
    color2rgb = props.color2;
    color3rgb = props.color3;
    backgroundrgb = props.backgroundColor;

    paused = props.paused;
    triggerSave = props.triggerSave;

    triggerRedraw(prevProps || {}, props);
    triggerRecalc(prevProps || {}, props);

    const newWidth = parseInt(props.canvasWidth, 10);
    const newHeight = parseInt(props.canvasWidth, 10);
    if ( width !== newWidth || height !== newHeight ) {
      width = newWidth;
      height = newHeight;
      p.resizeCanvas(width, height);
    }

    prevProps = {...props};
  };

  p.setup = () => {
    p.createCanvas(width, height);
  };

  p.draw = () => {

    const frameTime = p.millis();

    if ( triggerSave !== prevTriggerSave ) {
      prevTriggerSave = triggerSave;
      console.log('Save triggered.');
      p.saveCanvas('flowfield', 'jpg');
    }

    if ( !paused ) {

      if (recalc) {
        console.log('Recalculating systems.');
        recalc = false;
        redraw = true;
        calculateVariables();
      }

      if (redraw) {
        redraw = false;
        resetCanvas();
        initializeParticles();
        // console.log(particles);
      }

      if ( flowDrift > 0 ) {
        for ( let x=0; x < flowWidth; x++ ) {
          for ( let y=0; y < flowHeight; y++ ) {
            flowGrid[x][y].rotate( flowDrift * (p.noise(x / flowDriftScale, y / flowDriftScale, p.frameCount / flowDriftScale) - 0.5) / 1000 );
          }
        }
      }

      if (0 && p.frameCount % 10 == 0) {
        drawFlow();
      }

      p.translate(-outer, -outer);

      // Fade offset is a minor optimization... Update just one byte of the four
      // background color bytes each time through. This is because (with minimal testing,
      // and I might be wrong) array updates to the pixels array seem to be very expensive.
      if ( fadeAmount > 0 && (frameTime - fadeLastTime > fadeSpeed) ) {
        fadeBackground(fadeAmount, fadeOffset);
        fadeOffset = ( fadeOffset + 1 ) % 3;
        if (fadeOffset === 0) {
          // console.log(`fadeComplete: ${frameTime}`)
          fadeLastTime = frameTime;
        }
      }

      if (particleExpire > 0) {
        expireParticles();
      }
      updateParticles();
      drawParticles();
    }
  };

  /* Call after config changes to reset calculated variables */

  function calculateVariables() {
    p.noiseSeed(noiseSeed);
    p.randomSeed(noiseSeed);

    flowWidth = p.floor( (width + (outer * 2)) / flowCellSize );
    flowHeight = p.floor( (height + (outer * 2)) / flowCellSize );

    p.colorMode(p.HSB);
    color1 = p.color(color1rgb);
    color2 = p.color(color2rgb);
    color3 = p.color(color3rgb);
    p.colorMode(p.RGB);

    // console.log('c1');
    // console.log(color1);
    backgroundColor = p.color(backgroundrgb);

    initializeFlow();
  }

  function resetCanvas() {
    p.background(backgroundColor);
    p.smooth();
    p.strokeWeight(strokeWeight);
  }

  /* Flow setup */

  function initializeFlow() {
    console.log(`Calculating flow field... ${flowWidth} x ${flowHeight}`);
    const t0 = performance.now();

    flowGrid = new Array(flowWidth);
    for ( let x=0; x < flowWidth; x++ ) {
      flowGrid[x] = new Array(flowHeight);
      for ( let y=0; y < flowHeight; y++ ) {
        flowGrid[x][y] = calculateFlow(x, y);
      }
    }

    const t1 = performance.now();
    console.log('Finished in ' + (t1-t0) + 'ms.');
  }

  function calculateFlow(x, y) {
    let high_val = 0;
    let low_val = 1;

    let high_pos = p.createVector(0, 0);
    let low_pos = p.createVector(0, 0);

    for ( let i=0; i < flowAccuracy; i++ ) {
      const angle = i / flowAccuracy * p.TAU;
      const pos = p.createVector( x + (p.cos(angle) * noiseRadius), y + (p.sin(angle) * noiseRadius));
      const val = p.noise(pos.x / noiseScale, pos.y / noiseScale);

      if (val > high_val) {
        high_val = val;
        high_pos.x = pos.x;
        high_pos.y = pos.y;
      }
      if (val < low_val) {
        low_val = val;
        low_pos.x = pos.x;
        low_pos.y = pos.y;
      }
    }

    let angle = p.createVector(x - high_pos.x, y - high_pos.y);
    angle
      .normalize()
      .mult(0.2)
      .mult(high_val - low_val)
      .rotate(p.HALF_PI);

    return angle;
  }

  function mapFlowToScreenX(x) {
    return (x * flowCellSize) - (outer * 2);
  }

  function mapFlowToScreenY(y) {
    return (y * flowCellSize) - (outer * 2);
  }

  function getFlow(x, y) {
    const flowX = p.constrain(p.floor(x / flowCellSize), 0, flowWidth-1);
    const flowY = p.constrain(p.floor(y / flowCellSize), 0, flowHeight-1);
    return flowGrid[flowX][flowY];
  }

  function drawNoise() {
    const t0 = performance.now();

    p.background(backgroundColor);
    const img = p.createImage(width, height);
    img.loadPixels();
    const d = p.pixelDensity();
    for ( let x=0; x < width*d; x++ ) {
      for ( let y=0; y < height*d; y++ ) {
        const val = p.noise(x / noiseScale, y / noiseScale) * 255;
        // const val = p.random() * 255;
        // img.set(x, y, p.color(val,val,val) );
        const i = x * width * 4 + y * 4;
        img.pixels[i] = val;
        img.pixels[i+1] = val;
        img.pixels[i+2] = val;
        img.pixels[i+3] = 255;
      }
    }
    const t1 = performance.now();
    img.updatePixels();
    p.image(img, 0, 0);
    const t2 = performance.now();

    console.log('drawNoise set: ' + (t1 - t0) + 'ms');
    console.log('drawNoise image: ' + (t2 - t1) + 'ms');

  }

  function drawFlow() {

    console.log(flowGrid);

    p.background(0);
    p.stroke(255);
    p.strokeWeight(1);

    for ( let x=0; x < flowWidth; x++ ) {
      for ( let y=0; y < flowHeight; y++ ) {
        const map_x = mapFlowToScreenX(x);
        const map_y = mapFlowToScreenY(y);
        const val = flowGrid[x][y].copy().mult(25 * flowCellSize);
        if ( map_x > 0 && map_y > 0 )
          p.line(map_x, map_y, map_x + val.x, map_y + val.y);
      }
    }
  }

  /* Particles */

  function smoothstep(x) {
    return x * x * (3 - 2 * x);
  }

  function isOut(particle) {
    const x = particle.pos.x;
    const y = particle.pos.y;

    if ( x < outer ) return true;
    if ( x > width + 2 * outer) return true;
    if ( y < outer ) return true;
    if ( y > height + 2 * outer) return true;

    return false;
  }

  function createParticle(spawnTime) {
    let rand = p.int(p.random(2));
    const x = rand === 0 ? p.random(outer) : p.random(width + 2 * outer);
    const y = rand === 0 ? p.random(height + 2 * outer) : p.random(outer) + height + outer;

    let color;
    if ( colorType === 1 ) {
      const colorPoint = p.noise(x / colorScaling, y / colorScaling);
      const stepPoint = smoothstep(smoothstep(colorPoint));
      color = p.lerpColor(color1, color2, stepPoint);
    }
    else {
      const colorPoint = p.noise(x / colorScaling, y / colorScaling);
      const colorOffset = Math.floor( (p.noise(y / colorScaling, x / colorScaling) - 0.5) * colorSpread ) ;

      if ( colorPoint < 0.39 ) {
        color = p.color( p.hue(color1) + colorOffset, p.saturation(color1), p.brightness(color1), p.alpha(color1) );
      }
      else if ( colorPoint > 0.53 ) {
        color = p.color( p.hue(color2) + colorOffset, p.saturation(color2), p.brightness(color2), p.alpha(color2) );
      }
      else {
        color = p.color( p.hue(color3) + colorOffset, p.saturation(color3), p.brightness(color3), p.alpha(color3) );
      }
    }

    return {
      prev: p.createVector(x, y),
      pos: p.createVector(x, y),
      vel: p.createVector(0, 0),
      acc: p.createVector(0, 0),
      color,
      spawnTime,
    };
  }

  function initializeParticles() {
    console.log("Initialzing particles");
    const t0 = performance.now();
    const spawnTime = p.millis();

    p.colorMode(p.HSB);
    particles = new Array(particleCount);
    for (let i = 0; i < particleCount; i++) {
      particles[i] = createParticle(spawnTime);
    }
    p.colorMode(p.RGB);

    const t1 = performance.now();
    console.log("Particles initialized in " + (t1-t0) + "ms.");
  }

  function updateParticles() {
    for (let i = 0; i < particleCount; i++) {
      const prt = particles[i];
      const flow = getFlow(prt.pos.x, prt.pos.y);

      prt.acc = p.createVector(0, 0);
      prt.acc.add(flow).mult(5);

      prt.vel
        .add(prt.acc)
        .normalize()
        .mult(2);

      prt.prev.x = prt.pos.x;
      prt.prev.y = prt.pos.y;

      prt.pos.x = mod(prt.pos.x + prt.vel.x, width + 2 * outer);
      prt.pos.y = mod(prt.pos.y + prt.vel.y, height + 2 * outer);
    }
  }

  function drawParticles() {
    for (let i = 0; i < particleCount; i++) {
      p.stroke(particles[i].color);
      if ( particles[i].prev.dist(particles[i].pos) < 10 )
        p.line(particles[i].prev.x, particles[i].prev.y, particles[i].pos.x, particles[i].pos.y);
    }
  }

  function expireParticles() {
    // console.log("Expiring particles");
    // const t0 = performance.now();
    const now = p.millis();
    const checkTime = now - ( particleExpire * 1000);
    let count = 0;
    for (let i = 0; i < particleCount; i++) {
      if ( particles[i].spawnTime < checkTime && isOut(particles[i]) ) {
        particles[i] = createParticle(now);
        count++;
      }
    }
    // const t1 = performance.now();
    // if (count > 0) {
    //   console.log(`Expired ${count} in ${t1-t0}ms.`);
    // }
  }

  /* Background */

  /* TODO  : this needs to be background color aware. */
  function fadeBackground(fade, offset) {
    const t0 = performance.now();
    p.loadPixels();
    const t1 = performance.now();
    const d = p.pixelDensity();
    const max = 4 * width * d * height * d;
    const pixels = p.pixels;
    for ( let i=0; i < max; i+=4 ) {
      let val = pixels[i + offset];
      if ( val > 0 )
        pixels[i + offset] = val > fade ? val - fade : 0;
    }
    const t2 = performance.now();
    p.updatePixels();
    const t3 = performance.now();

    // console.log(`fade load: ${t1-t0}`);
    // console.log(`fade change: ${t2-t1}`);
    // console.log(`fade update: ${t3-t2}`);
  }

  /* Utilities */

  function mod(x, n) {
    // return x % n;
    return (x % n + n) % n;
  }

};