// board
let board;
let context;
let boardWidth;
let boardHeight;
if (window.innerHeight > 576 && window.innerWidth > 360) {
    boardWidth = 360;
    boardHeight = 576;
} else {
    boardWidth = window.innerWidth;
    boardHeight = window.innerHeight;
}


const GameOverSound = new AudioContext();























// kurosh
let kuroshWidth = 46;
let kuroshHeight = 46;
let kuroshX = boardWidth/2 - kuroshWidth/2;
let kuroshY = boardHeight*7/8 - kuroshHeight;
let kuroshRightImage;
let kuroshLeftImage;
let kurosh = {
    img: null,
    x: kuroshX,
    y: kuroshY,
    width: kuroshWidth,
    height: kuroshHeight
};

// Platform
let platformArray = [];
let platformWidth = 60;
let platformHeight = 18;
let platformImg;

// Game Physics
let velocityX = 0;
let velocityY = 0;
let initialVelocityY = -8;
let gravity = 0.4;

// Scores 
let score = 0;
let maxScore = 0;
let gameOver = false;


window.onload = () => {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d");

    // draw kurosh
    //context.fillStyle = "green";
    //context.fillRect(kurosh.x, kurosh.y, kurosh.width, kurosh.height);

    // load images
    kuroshLeftImage = new Image();
    kuroshLeftImage.src = "../assets/images/kurosh_left.png";
    kurosh.img = kuroshLeftImage;
    kuroshRightImage = new Image();
    kuroshRightImage.src = "../assets/images/kurosh_right.png";
    platformImg = new Image();
    platformImg.src = "../assets/images/base.png";
    kuroshLeftImage .onload = () => {
        context.drawImage(kurosh.img, kurosh.x, kurosh.y, kurosh.width, kurosh.height);
    };

    velocityY = initialVelocityY;

    placePlatforms();

    requestAnimationFrame(update);

    document.addEventListener("keydown", moveKurosh);

    // Touch Position

    let initialX = 0;

    board.addEventListener('touchend', touchReset);

    board.addEventListener("touchmove", moveKurosh);
};

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    };
    context.clearRect(0, 0, board.width, board.height);

    // kurosh
    kurosh.x += velocityX;
    if (kurosh.x > boardWidth) {
        kurosh.x = 0;
    } else if (kurosh.x + kurosh.width < 0) {
        kurosh.x = boardWidth;
    };



    velocityY += gravity;
    kurosh.y += velocityY;
    if (kurosh.y > boardHeight) {
        gameOver = true;
    };
    context.drawImage(kurosh.img, kurosh.x, kurosh.y, kurosh.width, kurosh.height);

    // Platforms
    for (let i = 0; i < platformArray.length; i++) {
        let platform = platformArray[i];
        if (velocityY < 0 && kurosh.y < boardHeight*3/4) {
            platform.y -= initialVelocityY;
        };
        if (detectCollision(kurosh, platform) && velocityY >= 0) {
            velocityX = 0;
            velocityY = initialVelocityY;
        };
        context.drawImage(platform.img, platform.x, platform.y, platform.width, platform.height);
    };

    // clear platforms and add new Platforms
    while (platformArray.length > 0 && platformArray[0].y >= boardHeight) {
        platformArray.shift();
        newPlatform()
    };

    // update Score
    updateScore();
    context.fillStyle = "black";
    context.font = "16px sans-serif"
    context.fillText(score, 5, 20);

    if(gameOver) {
        context.fillText('Game Over: Press Space or tap to Start!', boardWidth/11, boardHeight*7/8);
        fetch('../assets/sounds/gameover.wav')
          .then(responce => responce.arrayBuffer())
          .then(arrayBuffer => GameOverSound.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            const source = GameOverSound.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(GameOverSound.destination);
            source.start();
          })
    };
};

function moveKurosh(e) {
    const touch = e.touches[0];
    if (e.code == "ArrowRight" || e.code == "KeyD" || touch.clientX > board.offsetWidth/2) {
        velocityX = 4;
        kurosh.img = kuroshRightImage;
    } else if (e.code == "ArrowLeft" || e.code == "KeyA" || touch.clientX < board.offsetWidth/2) {
        velocityX = -4;
        kurosh.img = kuroshLeftImage;
    } else if (e.code == "Space" && gameOver) {
        // reset
        let kurosh = {
            img: kuroshRightImage,
            x: kuroshX,
            y: kuroshY,
            width: kuroshWidth,
            height: kuroshHeight
        };

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    };
};

let isSingleTap = true;

function touchReset(e) {
    if (isSingleTap && gameOver) {
        // reset
        let kurosh = {
            img: kuroshRightImage,
            x: kuroshX,
            y: kuroshY,
            width: kuroshWidth,
            height: kuroshHeight
        };

        velocityX = 0;
        velocityY = initialVelocityY;
        score = 0;
        maxScore = 0;
        gameOver = false;
        placePlatforms();
    };
}

function placePlatforms() {
    platformArray = [];

    // starting platforms
    let platform = {
        img: platformImg,
        width: platformWidth,
        height: platformHeight,
        x: boardWidth/2,
        y: boardHeight - 50
    };
    platformArray.push(platform);

    for (let i =0; i < 6; i++) {
        let randomX = Math.floor(Math.random() * boardWidth*3/4);
        let platform = {
            img: platformImg,
            width: platformWidth,
            height: platformHeight,
            x: randomX,
            y: boardHeight - 75*i - 150,
        };
        platformArray.push(platform);
    };
};

function newPlatform() {
    let randomX = Math.floor(Math.random() * boardWidth*3/4);
    let platform = {
        img: platformImg,
        width: platformWidth,
        height: platformHeight,
        x: randomX,
        y: -platformHeight,
    };
    platformArray.push(platform);
};

function detectCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height >b.y
};

function updateScore() {
    let points = Math.floor(50*Math.random());
    if (velocityY < 0) {
        maxScore += points;
        if (score < maxScore) {
            score = maxScore;
        } else if (velocityY >= 0) {
            maxScore -= points;
        };
    };
};