export default function flowfieldSketch (p) {


  // Configurable variables

  let width;
  let height;
  let outer;

  let particleCount;

  let flowCellSize;
  let flowAccuracy;
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
  let color1rgb;
  let color2rgb;
  let colorScaling;

  let paused = false;
  let prevTriggerSave = false;
  let triggerSave = false;

  let prevProps;

  function triggerRedraw(prev, next) {
    redraw = prev.redraw !== next.redraw;
  }

  function triggerRecalc(prev, next) {
    const recalcFields = [
      'particleCount',
      'flowCellSize',
      'flowAccuracy',
      'noiseScale',
      'noiseRadius',
      'noiseSeed',
      'strokeWeight',
      'colorScaling',
      'canvasHeight',
      'canvasWidth',
      'outer',
      'color1',
      'color2',
    ];
    recalcFields.forEach( (field) => { if (prev[field] !== next[field]) recalc = true; });
  }

  p.myCustomRedrawAccordingToNewPropsHandler = (props) => {
    // console.log(props);

    particleCount = parseInt(props.particleCount, 10);
    flowCellSize = parseInt(props.flowCellSize, 10);
    flowAccuracy = parseInt(props.flowAccuracy, 10);
    noiseScale = parseFloat(props.noiseScale);
    noiseRadius = parseInt(props.noiseRadius, 10);
    noiseSeed = parseInt(props.noiseSeed, 10);
    strokeWeight = parseInt(props.strokeWeight, 10);
    colorScaling = parseInt(props.colorScaling, 10);
    outer = parseInt(props.outer, 10);

    color1rgb = props.color1;
    color2rgb = props.color2;

    paused = props.paused;
    triggerSave = props.triggerSave;

    triggerRedraw(prevProps || {}, props);
    triggerRecalc(prevProps || {}, props);
    prevProps = {...props};

    if ( props.canvasWidth !== width || props.canvasHeight !== height ) {
      width = parseInt(props.canvasWidth, 10);
      height = parseInt(props.canvasHeight, 10);
      recalc = true;
      p.resizeCanvas(width, height);
    }

  };

  p.setup = () => {
    p.createCanvas(width, height);
  };

  p.draw = () => {

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
      }

      p.translate(-outer, -outer);
      // p.background(0,3);
      updateParticles();
      drawParticles();
    }



    if (redraw) {
      // drawFlow();
      // drawNoise();
      redraw = false;
    }
  };

  /* Call after config changes to reset calculated variables */

  function calculateVariables() {
    flowWidth = p.floor( (width + (outer * 2)) / flowCellSize );
    flowHeight = p.floor( (height + (outer * 2)) / flowCellSize );

    color1 = p.color(color1rgb);
    color2 = p.color(color2rgb);

    p.noiseSeed(noiseSeed);
    p.randomSeed(noiseSeed);

    initializeFlow();
  }

  function resetCanvas() {
    p.background(0);
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

    p.background(0);
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

    p.background(0);
    p.stroke(255);
    p.strokeWeight(1);

    for ( let x=0; x < flowWidth; x++ ) {
      for ( let y=0; y < flowHeight; y++ ) {
        const map_x = mapFlowToScreenX(x);
        const map_y = mapFlowToScreenY(y);
        const val = flowGrid[x][y].mult(25 * flowCellSize);
        if ( map_x > 0 && map_y > 0 )
          p.line(map_x, map_y, map_x + val.x, map_y + val.y);
      }
    }
  }

  /* Particles */

  function initializeParticles() {
    console.log("Initialzing particles");
    const t0 = performance.now();
    particles = new Array(particleCount);
    for (let i = 0; i < particleCount; i++) {

      let rand = p.int(p.random(2));
      const x = rand === 0 ? p.random(outer) : p.random(width + 2 * outer);
      const y = rand === 0 ? p.random(height + 2 * outer) : p.random(outer) + height + outer;
      // x = p.int(x);
      // y = p.int(y);

      particles[i] = {
        prev: p.createVector(x, y),
        pos: p.createVector(x, y),
        vel: p.createVector(0, 0),
        acc: p.createVector(0, 0),
        color: p.lerpColor(color1, color2, p.noise(x / colorScaling, y / colorScaling)),
      };
    }
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

      //prt.acc = p5.Vector.fromAngle(noise(prt.seed * 10, tick) * TAU).mult(0.01);
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

  function mod(x, n) {
    // return x % n;
    return (x % n + n) % n;
  }

};