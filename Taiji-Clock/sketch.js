let isPlaying = false;

let circles = [];
let numCircles = 12; // 12circles-12hours

let particles = [];

let centerX, centerY; // The center point of Taiji
let radius = 200; // Outside radius of Taiji

let sound;
const volumeMap = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.7, 0.8, 0.9, 1.0, 0.9, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3];
const pitchMap = [220, 247, 
    261.63, 293.66, 329.63, 349.23, 392, 440, // C4 to G4
    493.88, 523.25, 587.33, 659.25, 698.46, // A4 to B5
    783.99, 880, 987.77, 1046.50, 1174.66, 1318.51, 1396.91, 1567.98, 1760, 1975.53, 2093.00];
let oscillator;
let musicSpeed = 1;


let lastHour = -1;
let currentHour = -1; 


function preload() {
    sound = loadSound('assets/particles.mp3', 
        () => {
            console.log('Sound loaded successfully');
        }, 
        (error) => {
            console.error('Error loading sound:', error);
        }
    );
}

function setup() {
    createCanvas(1280, 720);
    frameRate(60);
    angleMode(DEGREES);

    document.getElementById('startButton').addEventListener('click', startMusic);
    document.getElementById('pauseButton').addEventListener('click', pauseMusic);

    for (let i = 0; i < numCircles; i++) {
        let angle = map(i, 0, numCircles, 0, TWO_PI); // angle of each circle
        let x = centerX + cos(angle) * radius; 
        let y = centerY + sin(angle) * radius; 
        circles.push({ x, y }); // save the location of circles
    }

    // Set up particles
    for (let i = 0; i < 500; i++) {
        particles.push(new Particle(random(width), random(height)));
    }

    centerX = width / 2;
    centerY = height / 2;
}
    

function startMusic() {
    if (!isPlaying) {
        getAudioContext().resume().then(() => {
            playNoteForCurrentHour();
            sound.loop();
            isPlaying = true;
        });
    }
}

function pauseMusic() {
    if (isPlaying) {
        sound.pause();
        isPlaying = false;
        stopNote();
    }
}

function draw() {
    background(0, 10);
    textSize(11);
    fill(255);
    text('Click the button to play music', 5, 15);

    // Update the particles generation
    push(); 
    for (let particle of particles) {
        particle.update();
        particle.display();
    }
    pop(); 

    currentHour = hour();
    if (currentHour !== lastHour) {
        lastHour = currentHour;
        playNoteForCurrentHour();
        generateCircles();
    }

    // Draw Taiji
    let currentMinute = minute();
    let rotationAngle = map(currentMinute, 0, 60, 0, 360);
    push(); 
    translate(centerX, centerY);
    rotate(rotationAngle);
    drawTaijiSymbol();
    pop();

    // Update circles generation
    push(); 
    for (let circle of circles) {
        circle.update();
        circle.display();
    }
    pop();
    
    
    updateAudioParameters();
}

function generateCircles() {
    circles = [];
    let totalCircles = hour() || 1; // Ensure at least one circle
    let angleStep = 360 / totalCircles;

    for (let i = 0; i < totalCircles; i++) {
        let angle = i * angleStep; 
        circles.push(new FallingCircle(i, angle, totalCircles));
    }


    if (currentHour === 0) {
        circles.push(new FallingCircle(0, 0, 1)); // 仍然生成一个圆圈
    }
}

class FallingCircle {
    constructor(index, angle, totalCircles) {
        this.index = index; 
        this.angle = angle;
        this.size = map(minute(), 0, 59, 1, 20); 
        this.speedY = map(minute(), 0, 59, 1, 20); 
        this.targetX = centerX + radius * cos(this.angle); 
        this.targetY = centerY + radius * sin(this.angle); 
        this.y = 0; // start from top
        this.isFalling = true;
        this.x = random(0, width); // start from random location
    }

    update() {
        if (this.isFalling) {
            this.y += this.speedY; 
            
            if (this.y >= this.targetY) {
                this.y = this.targetY; 
                this.isFalling = false; 
                console.log(`Circle ${this.index} has stopped at ${this.y}`);
            }
            this.x = lerp(this.x, this.targetX, 0.05);
        }
        //Breath
        this.size = map(sin(frameCount * 0.5), -1, 1, 1, 40);
    }

    display() {
        fill(255, 204, 0); 
        noStroke();
        ellipse(this.x, this.y, this.size); 
    }
}

    class Particle {
        constructor(x, y) {
            this.position = createVector(x, y);
            this.velocity = createVector(random(-1, 1), 0); // random initial speed,only on x
            this.size = random(2, 4);
            this.color = color(random(100, 255));
        }
      
        update() {
            this.position.add(this.velocity);
            
            // make sure particls stay inside of canvas boarder
            if (this.position.x > width || this.position.x < 0) {
                this.velocity.x *= -1;
            }
            if (this.position.y > height || this.position.y < 0) {
                this.velocity.y *= -1;
            }
        }
      
        display() {
            noStroke();
            fill(this.color);
            ellipse(this.position.x, this.position.y, this.size);
        }
    }
    
function drawTaijiSymbol() {
    noStroke();
    strokeWeight(2);
    fill(255);
    ellipse(0, 0, 300, 300);
    
        fill(0);
        arc(0, 0, 300, 300, 90, 270, CHORD);
        fill(255);
        arc(0, 0, 300, 300, -90, 90, CHORD);
    
        noStroke();
        fill(255);
        ellipse(0, 75, 150, 150);
        fill(0);
        ellipse(0, -75, 150, 150);
    
        fill(255);
        ellipse(0, -75, 50, 50);
        fill(0);
        ellipse(0, 75, 50, 50);
    }

function updateAudioParameters() {
    setVolumeFromMinute();
    setPitchFromHour(); 
    setTempoFromSecond();
}

function mousePressed() {
    playNoteForCurrentHour();
    generateCircles();
}

function setVolumeFromMinute() {
    let currentMinute = minute();
    let volume = volumeMap[currentMinute % volumeMap.length];
    sound.setVolume(volume);
    console.log(`Volume set to: ${volume} for minute: ${currentMinute}`);
}

function setPitchFromHour() {
    let currentHour = hour() % 24;
    let audioPitch = pitchMap[currentHour]; // Changed from pitch to audioPitch
    sound.rate(audioPitch / 440);
    console.log(`Pitch set to: ${audioPitch} for hour: ${currentHour}`);
}


function setTempoFromSecond() {
    let currentSecond = second();
    let targetSpeed = map(currentSecond, 0, 59, 0.5, 1.5);
    musicSpeed = lerp(musicSpeed, targetSpeed, 0.1); 
    sound.rate(musicSpeed);
    console.log(`musicSpeed set to: ${musicSpeed} for second: ${currentSecond}`);
}

function playNoteForCurrentHour() {
    stopNote(); 
    let currentHour = hour() % pitchMap.length; 
    let frequency = pitchMap[currentHour];

    if (oscillator) {
        oscillator.stop();
    }

    oscillator = new p5.Oscillator('sine');
    oscillator.freq(frequency); // Corrected from audioPitch to frequency
    oscillator.amp(1, 0.2);
    oscillator.start();
    oscillator.stop(0.8);
    console.log(`Playing note for current hour: ${currentHour} with frequency: ${frequency}`);
}

function stopNote() {
    if (oscillator) {
        oscillator.stop();
        oscillator = null; 
        console.log('Note stopped');
    }
}