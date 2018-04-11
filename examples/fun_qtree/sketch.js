// The Nature of Code
// Daniel Shiffman
// http://natureofcode.com

// vehicle part ****************************

// An array of vehicles
var population = [];

// An array of "food"
var food = [];
// An array of "poison"
var poison = [];

// How good is food, how bad is poison?
var nutrition = [0.1, -1];

// Show additional info on DNA?
var debug;

var longestlive = [];
var longestlivetot = [];

var cwidth = 0;
var coffset = 0;
var runtime = 0;
var savecount = 900;
var BestDNA = [];

// qtree part ********************************

// The old way to do intersection tests, look how slow!!

let particleCount = 200;
let particles = []; // ArrayList for all "things"


let framerateP;
let withQuadTree;
let total;

function setup() {
  createCanvas(600, 400);

  //********************************//
  //canvas.parent('canvascontainer');
  //debug = select('#debug');

  coffset = 0;
  cwidth = width - coffset;

  // Create 10 vehicles
  angleMode(RADIANS);
  for (var i = 0; i < 10; i++) {
    population[i] = new Vehicle(cwidth / 2, height / 2);
  }
  
  //************************//

  // Put 2000 Things in the system
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle(random(width), random(height)));
  }

  framerateP = createP('framerate: ');
  withQuadTree = createCheckbox('using quadtree');
  withQuadTree.checked(true);
  let totalP = createP(particleCount);
  total = createSlider(1, 5000, 1000);
  total.input(function () {
    particleCount = total.value();
    totalP.html(particleCount);
    while (particleCount > particles.length) {
      particles.push(new Particle(random(width), random(height)));
    }
    if (particleCount < particles.length) {
      particles.splice(0, particles.length - particleCount);
    }
  });

}

function draw() {
  let boundary = new Rectangle(width / 2, height / 2, width / 2, height / 2);
  qtree = new QuadTree(boundary, 4);

  background(0);
  fill(255);
  noStroke();
  // Run through the Grid
  stroke(255);

  // Display and move all Things
  let f = 0;
  for (let p of particles) {
    p.highlight = false;
    let point = new Point(p.x, p.y, p);
    food[f] = p;
    f++
    qtree.insert(point);
  }


  for (let p of particles) {
    
    if (withQuadTree.checked()) {
      let range = new Circle(p.x, p.y, p.r * 2);
      let points = qtree.query(range);
      for (let point of points) {
        let other = point.userData;
        if (p != other && other.highlight == false) {
          let d = dist(p.x, p.y, other.x, other.y);
          if (d < p.r / 2 + other.r / 2) {
            other.highlight = true;
          }
        }
      }
    } else {
      for (let other of particles) {

        if ((p != other) && (other.highlight == false)) {
          let d = dist(p.x, p.y, other.x, other.y);
          if (d < p.r / 2 + other.r / 2) {
            other.highlight = true;
          }
        }
      }
    }
  }

  // update particles for vehicles
  f=0;
  for (let p of particles) {
     food[f] = p;
     f++
  }

  // Go through all vehicles
  for (var i = population.length - 1; i >= 0; i--) {
    var v = population[i];
  
    // Eat the food (index 0)
    var gone = v.eat(food, 0);
    if (gone > -1 )
    particles.splice(gone, 1);
    
    // Check boundaries
    v.boundaries();

    // Update and draw
    v.update();
    v.display();

    // If the vehicle has died, remove
    if (v.dead()) {
      population.splice(i, 1);
    } else {
      // Every vehicle has a chance of cloning itself
      var child = v.birth();
      if (child != null) {
        population.push(child);
      }
    }

  }

  for (let p of particles) {
    p.render();
    p.move();
  }

  let fr = floor(frameRate());
  framerateP.html("Framerate: " + fr);

  if (withQuadTree.checked()) show(qtree);

}

function show(qtree) {
  stroke(255);
  noFill();
  strokeWeight(1);
  rectMode(CENTER);
  rect(qtree.boundary.x, qtree.boundary.y, qtree.boundary.w * 2, qtree.boundary.h * 2);
  // for (let p of qtree.points) {
  //   strokeWeight(2);
  //   point(p.x, p.y);
  // }

  if (qtree.divided) {
    show(qtree.northeast);
    show(qtree.northwest);
    show(qtree.southeast);
    show(qtree.southwest);
  }
}