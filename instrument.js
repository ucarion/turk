var renderer, scene, camera, controls;

var transitionColors = [
  0xCC6600,
  0xD17519,
  0xD68533,
  0xDB944D,
  0xE0A366,
  0xE6B280,
  0xEBC299,
  0xF0D1B2,
  0xF5E0CC,
  0xFAF0E6
];

var brassColor = transitionColors[0];
var ballColor = 0xD4D4BF;
var tubeColor = 0xD1D1D1;

var cannonBaseRadius = 10;
var cannonTopRadius = 15;
var cannonThickness = 3;
var cannonHeight = 40;

var shortestKeyLength = 15;
var longestKeyLength = 40;
var keyWidth = 5;
var keyThickness = 2;

var numKeys = 88;

var keyRadius = 100;

var bucketRadiusToCannon = 140;
var bucketPositionOffset = 0.2;

var bucketBaseRadius = 3;
var bucketTopRadius = 5;
var bucketHeight = 12;
var bucketThickness = 1;

var darkBaseRadius = bucketBaseRadius + 0.5;
var darkBaseHeight = 1;
var blackColor = 0x000000;

var tubeRadius = 3;

var numCentralizingPipes = 7;

var ballRadius = 2;

var ballHangtime = 100;
var G = -0.1;

var initVelocity = -G * ballHangtime / 2;
var firingAngle = Math.acos(keyRadius / (ballHangtime * initVelocity));
var velocityOut = Math.cos(firingAngle) * initVelocity;

var bounceHangtime = 48;

var bounceVelocity = -G * bounceHangtime / 2;
var bounceAngle = Math.acos((bucketRadiusToCannon - keyRadius) / (bounceHangtime * bounceVelocity));
var bounceOut   = Math.cos(bounceAngle) * bounceVelocity;

var keys = [];
var balls = [];
var queue = []; // pronounced: kWEH.

var ballHeadstart = 1730;

var timeInSong = -startDelay;
var lastUpdatedTime;

function Ball(keyTarget) {
  this.target = keyTarget;
  this.angle = 2 * Math.PI * keyTarget / numKeys;
  this.velocityUp = initVelocity * Math.sin(firingAngle);
  this.cannon = new THREE.Mesh(
    new THREE.SphereGeometry(ballRadius, 16, 16),
    new THREE.MeshPhongMaterial({ color: ballColor })
  );
  this.cannon.position.y = 0;
  this.object = new THREE.Object3D();
  this.object.add(this.cannon);
  this.object.rotation.y = this.angle;
}

function init() {
  var WIDTH = $('.rest').width() - 5,
      HEIGHT = $('.rest').height() - 5,
      VIEW_ANGLE = 45,
      ASPECT = WIDTH / HEIGHT,
      NEAR = 0.1,
      FAR = 10000;

  console.log('Size: ' + WIDTH + ' ' + HEIGHT);

  // create a WebGL renderer, camera
  // and a scene
  renderer = new THREE.WebGLRenderer();
  camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
  scene = new THREE.Scene();

  camera.position.y = 200;
  camera.position.z = 200;
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  // start the renderer
  renderer.setSize(WIDTH, HEIGHT);

  // attach the render-supplied DOM element
  $('#turk').append(renderer.domElement);

  // and the camera
  scene.add(camera);

  addControls();

  // draw!
  renderer.render(scene, camera);
}

function fillScene() {
  addCannon();
  addLighting();
  addKeys();
  addBuckets();
  addTubing();
}

function addLighting() {
  var light1 = new THREE.PointLight(0xFFFFFF);

  light1.position.x = 0;
  light1.position.y = 500;
  light1.position.z = 500;

  scene.add(light1);

  var light2 = new THREE.PointLight(0xFFFFFF);

  light2.position.x = 0;
  light2.position.y = 500;
  light2.position.z = -500;

  scene.add(light2);
}

function addCannon() {
  var cannon = new THREE.Mesh(
    new THREE.TubeGeometry(cannonTopRadius, cannonBaseRadius, cannonTopRadius - cannonThickness, cannonBaseRadius - cannonThickness, cannonHeight, 32, 1, false);,
    new THREE.MeshPhongMaterial({ color: brassColor })
  );

  scene.add(cannon);

  var cannonBase = new THREE.Mesh(
    new THREE.CylinderGeometry(cannonBaseRadius, cannonBaseRadius, tubeRadius * 2, 32, 1, false),
    new THREE.MeshPhongMaterial({ color: brassColor })
  );

  cannonBase.position.y = -cannonHeight / 2;

  scene.add(cannonBase);

  var centralSphere = new THREE.Mesh(
    new THREE.SphereGeometry(cannonBaseRadius, 16, 16),
    new THREE.MeshPhongMaterial({ color: brassColor })
  );

  centralSphere.position.y = -cannonHeight / 2;

  scene.add(centralSphere);
}

function addKeys() {
  for (var i = 0; i < numKeys; i++) {
    // use linear interpolation to find key length
    var weight = i / numKeys;
    var keyLength = longestKeyLength + (shortestKeyLength - longestKeyLength) * weight;

    var key = new THREE.Mesh(
      new THREE.CubeGeometry(keyLength, keyThickness, keyWidth),
      new THREE.MeshPhongMaterial({ color: brassColor })
    );

    key.position.x = keyRadius;

    var temp = new THREE.Object3D();
    temp.add(key);

    temp.rotation.y = (i / numKeys) * 2 * Math.PI;

    scene.add(temp);

    keys.push(key);
  }
}

function addBuckets() {
  for (var i = 0; i < numKeys; i++) {
    var bucket = new THREE.Mesh(
      // new THREE.CylinderGeometry(bucketTopRadius, bucketBaseRadius, bucketHeight, 32, 1, false),
      new THREE.TubeGeometry(bucketTopRadius, bucketBaseRadius, bucketTopRadius - bucketThickness, bucketBaseRadius - bucketThickness, bucketHeight, 16, 1, false),
      new THREE.MeshPhongMaterial({ color: brassColor })
    );

    bucket.position.x = bucketRadiusToCannon - bucketPositionOffset;
    bucket.rotation.z = Math.PI / 2 - firingAngle;

    var temp = new THREE.Object3D();
    temp.add(bucket);

    temp.rotation.y = (i / numKeys) * 2 * Math.PI;

    scene.add(temp);
  }
}

function addTubing() {
  var bottomTorus = new THREE.Mesh(
    new THREE.TorusGeometry(bucketRadiusToCannon, tubeRadius, 8, numKeys, 2 * Math.PI),
    new THREE.MeshPhongMaterial({ color: tubeColor })
  );

  bottomTorus.rotation.x = Math.PI / 2;
  bottomTorus.position.y = -cannonHeight / 2;

  scene.add(bottomTorus);
  
  for (var i = 0; i < numKeys; i++) {
    var upTube = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, cannonHeight / 2, 32, 1, false),
      new THREE.MeshPhongMaterial({ color: tubeColor })
    );

    upTube.position.x = bucketRadiusToCannon;

    var darkBucketBase = new THREE.Mesh(
      new THREE.CylinderGeometry(darkBaseRadius, darkBaseRadius, darkBaseHeight, 16, 1),
      new THREE.MeshPhongMaterial({ color: blackColor })
    );

    darkBucketBase.position.y = cannonHeight / 4;
    darkBucketBase.position.x = bucketRadiusToCannon;

    var temp = new THREE.Object3D();
    temp.add(upTube);
    temp.add(darkBucketBase);

    temp.position.y = -cannonHeight / 4;
    temp.rotation.y = i * 2 * Math.PI / numKeys;

    scene.add(temp);
  }

  for (var i = 0; i < numCentralizingPipes; i++) {
    var inTube = new THREE.Mesh(
      new THREE.CylinderGeometry(tubeRadius, tubeRadius, bucketRadiusToCannon, 32, 1, false),
      new THREE.MeshPhongMaterial({ color: tubeColor })
    );

    inTube.position.x = bucketRadiusToCannon / 2;
    inTube.position.y = -cannonHeight / 2;
    inTube.rotation.z = Math.PI / 2;

    var tube = new THREE.Object3D();
    tube.add(inTube);

    tube.rotation.y = (i / numCentralizingPipes) * 2 * Math.PI;

    scene.add(tube);
  }
}

function addBall(keyTarget) {
  var ball = new Ball(keyTarget);

  queue.push(Date.now());

  balls.push(ball);

  scene.add(ball.object);
}

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  if (musicPlaying) {
    throwBallsToMusic();
  }

  moveBalls();
  darkenKeys();

  renderer.render(scene, camera);
}

// where the magic happens
function throwBallsToMusic() {
  if (notes.length == 0)
    return;

  lastUpdatedTime = lastUpdatedTime || Date.now();

  var delta = 0.01;
  
  var interpolatedTime = Date.now() - lastUpdatedTime;
  
  var currTime = timeInSong + interpolatedTime;

  while (notes[0].time < currTime + ballHeadstart) {
    addBall(notes[0].note - MIDI.pianoKeyOffset);
    notes.splice(0, 1);

    if (notes.length === 0) {
      return;
    }
  }
}

function resetTimer(songTime) {
  timeInSong = songTime;
  lastUpdatedTime = Date.now();
}

function moveBalls() {
  for (var i = balls.length - 1; i >= 0; i--) {
    var ball = balls[i];

    if (ball.cannon.position.y < 0) {
      if (ball.cannon.position.x >= bucketRadiusToCannon) {
        scene.remove(ball.object);
        balls.splice(i, 1);
        continue;
      } else {
        ballHeadstart = Date.now() - queue.shift(1);

        makeKeyGlow(ball.target);

        // and bounce back up!
        ball.velocityUp = bounceVelocity * Math.sin(bounceAngle);
        ball.cannon.position.y = 0;
      }
    }

    ball.velocityUp += G;

    if (ball.cannon.position.x < bucketRadiusToCannon) {
      ball.cannon.position.y += ball.velocityUp;
      ball.cannon.position.x += velocityOut;
    } else {
      ball.cannon.position.y += ball.velocityUp;
      ball.cannon.position.x += bounceOut;
    }
  }
}

function makeKeyGlow(key) {
  keys[key].material.color.setHex(transitionColors[transitionColors.length - 1]);
}

function darkenKeys() {
  for (var i = 0; i < numKeys; i++) {
    var key = keys[i];

    var state = transitionColors.indexOf(key.material.color.getHex());
    if (state === 0) {
      continue;
    } else {
      key.material.color.setHex(transitionColors[state - 1]);
    }
  }
}

function addControls() {
    controls = new THREE.TrackballControls(camera, renderer.domElement);
    var radius = 100 * 0.75; // scalar value used to determine relative zoom distances
    controls.rotateSpeed = 1;
    controls.zoomSpeed = 0.1;
    controls.panSpeed = 1;

    controls.noZoom = false;
    controls.noPan = false;

    controls.staticMoving = false;
    controls.dynamicDampingFactor = 0.3;

    controls.minDistance = radius * 1.1;
    controls.maxDistance = radius * 25;

    controls.keys = [65, 83, 68]; // [ rotateKey, zoomKey, panKey ]
}

init();
fillScene();
animate();