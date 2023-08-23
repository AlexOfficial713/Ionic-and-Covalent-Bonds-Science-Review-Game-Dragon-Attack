import Character, { boxCollisionDetection } from "./character.js";
import Dragon from "./dragon.js";
import Player from "./player.js";
import PowerUp from "./powerUp.js";
export const powerUpLabelList = ["images/used images/PowerUps/Strength.png", "images/used images/PowerUps/Speed.png", "images/used images/PowerUps/Slow Time.png", "images/used images/PowerUps/Extra Dragon Damage.png", "images/used images/PowerUps/Free Damage.png", "images/used images/PowerUps/Destroy Every Compound.png", "images/used images/PowerUps/Health.png"];

export function pxToVh(px) {
    return (px / window_height) * 100;
}
export function pxToVw(px) {
    return (px / window_width) * 100;
}
export function vhToPx(vh) {
    return (vh / 100) * window_height;
}
export function vwToPx(vw) {
    return (vw / 100) * window_width;
}

export function pxToVmax(px) {
    if (window_height >= window_width) {
        return pxToVh(px);
    }
    else return pxToVw(px);
}

export function pxToVmin(px) {
    if (window_height <= window_width) {
        return pxToVh(px);
    }
    else return pxToVw(px);
}

export function vmaxToPx(vmax) {
    if (window_height >= window_width) {
        return vhToPx(vmax);
    }
    else return vwToPx(vmax);
}

export function vminToPx(vmin) {
    if (window_height <= window_width) {
        return vhToPx(vmin);
    }
    else return vwToPx(vmin);
}

export let window_height;
export let window_width;
export let characterList;
export let compoundList;
export let powerUpList;
export let gamePaused;
export let wonGame;
export let player;
export let dragon;
export let winGame;
export let looseGame;
export let pauseGame;
export let resumeGame;
export let restartGame;
export let randChanceForCompSpawn;


document.body.style.backgroundColor = "black";
let beginningText = document.createElement("p");
beginningText.classList.add("centered");
beginningText.innerHTML = "Welcome to the ionic and covalent compound review game!<br/>In this game you are a lone hydrogen atom<br/>and you will fight your way to defeat a chemical dragon that terrorizes all atoms<br/>as we know it.<br/>Lets begin your journey by giving you a quick tutorial.<br/>Once you complete the tutorial you will be on your way to becoming a dragon killer!<br/><br/><br/>Press any button to begin tutorial";
beginningText.style.textAlign = "center"
beginningText.style.color = "white";
beginningText.style.fontSize = "1.5vmax";
document.body.appendChild(beginningText);

let tutorialPart2 = function() {
    window.removeEventListener("keypress", ()=>{});
    document.body.removeChild(beginningText);

    let tutorialText = document.createElement("p");
    tutorialText.classList.add("centered");
    tutorialText.innerHTML = "The controls are simple.<br/> Use w, a, s, and d to move in each direction.<br/>You are given a magic sword that can switch between lava and water.<br/>Press f to change between lava and water.<br/>There is a dragon at the top of the screen which will launch chemicals at you.<br/>Being hit by the chemicals will cause damage to you.<br/>So press space to attack with your sword.<br/>Since ionic compounds break in water use the blue water sword to destroy ionic compounds (hint: ionic compounds always start with a metal).<br/>And since covalent compounds have low heat tolarance, use the red fire sword to destroy them. Finally you can collect powerups throughout the arena to get a boost for your character for a little while.<br/>Press esc at any time to pause game, restart, or unglitch character. Have fun!<br/><br/><br/>Press any button to start game";
    tutorialText.style.textAlign = "center"
    tutorialText.style.color = "white";
    tutorialText.style.fontSize = "1.5vmax";
    document.body.appendChild(tutorialText);

    document.body.addEventListener("keypress", ()=>{
        let newBody = document.body.cloneNode(false);
        document.body.parentNode.replaceChild(newBody, document.body);
        beginGame();
    });
}

document.body.addEventListener("keypress", ()=>{tutorialPart2()});


function beginGame() {
    randChanceForCompSpawn = 1000;
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    characterList = [];
    compoundList = [];
    powerUpList = [];
    gamePaused = false;
    wonGame = false;
    document.body.style.backgroundColor = "grey";

    let moreChanceForCompSpawn = function() {
        if (randChanceForCompSpawn >= 300) {
            randChanceForCompSpawn -= 50;
            setTimeout(()=>{moreChanceForCompSpawn()}, 5000);
        }
        if (randChanceForCompSpawn < 300) {randChanceForCompSpawn = 299};
    }
    moreChanceForCompSpawn();

    function findCoordsOnClick(event) {
        console.log("x" + event.x + " -> px");
        console.log("y" + event.y + " -> px");
        console.log("x: " + pxToVw(event.x) + " -> vw");
        console.log("y: " + pxToVh(event.y) + " -> vh");
        window.removeEventListener("click", findCoordsOnClick);
    }

    window.addEventListener("resize", windowResizeManager());

    function windowResizeManager() {
        window_height = window.innerHeight;
        window_width = window.innerWidth;
        
        characterList.forEach(character => {
            character.windowResizeFunction();

            if (character instanceof Player) {
                character.characterController.windowResizeFunction();
            }
        });

        compoundList.forEach(compound => {
            compound.windowResizeFunction();
        });

        powerUpList.forEach(powerUp => {
            if (powerUp.x > window_width) powerUp.destroyPowerUp();
            else if (powerUp.y > window_height) powerUp.destroyPowerUp();
        }) 
    }

    player = new Player(0, 0, 2);
    player.setPos(window_width / 2 - (vmaxToPx(4) / 2), window_height - vmaxToPx(6));
    // player = new Player(window_width / 2 - (vmaxToPx(4) / 2), window_height - vmaxToPx(6), 2); glitches when you reload screen for some reason
    dragon = new Dragon();

    let spawnRandomPowerUp = function() {
        let powerUpWidth = 6;
        let powerUpHeight = 6;

        let randX = Math.floor(Math.random() * (window_width - vmaxToPx(powerUpWidth)));
        let randY = Math.floor(Math.random() * (window_height - vmaxToPx(powerUpHeight) - dragon.x)) + dragon.x;

        let collidingOtherPowerUps = false;
        powerUpList.forEach(powerUp => {
            if (boxCollisionDetection(randX, randY, vmaxToPx(powerUpWidth), vmaxToPx(powerUpHeight), 
            powerUp.x, powerUp.y, vmaxToPx(powerUpWidth), vmaxToPx(powerUpHeight))) collidingOtherPowerUps = true;
        });

        if (!collidingOtherPowerUps && !boxCollisionDetection(randX, randY, vmaxToPx(powerUpWidth), vmaxToPx(powerUpHeight), dragon.x, dragon.y, dragon.widthPx, dragon.heightPx) &&
        !boxCollisionDetection(randX, randY, vmaxToPx(powerUpWidth), vmaxToPx(powerUpHeight), player.x, player.y, player.widthPx, player.heightPx)) {
            let randPowerUpType = Math.floor(Math.random() * 7);
            if (randPowerUpType <= 3) {
                let powerUp = new PowerUp(powerUpLabelList[randPowerUpType], randX, randY, randPowerUpType);
            }
            else {
                if (randPowerUpType == 4) {
                    let posX = randX;
                    let posY = randY;
                    let randAmount = Math.floor(Math.random() * 20) + 10;
                    let damageDragon = new PowerUp(powerUpLabelList[randPowerUpType], posX, posY, 0, 0, () => {
                        for (let i = 0; i < randAmount; i++) {
                            let timeout = (i == 0) ? 0 : Math.floor(Math.random() * 1500);
                            setTimeout(() => {
                                let randX = Math.floor(Math.random() * 10) + posX;
                                let randY = Math.floor(Math.random() * 10) + posY;
                                let randMultiplier = Math.floor(Math.random() * 4) + 1;
                                let damageOrb = new Character(randX, randY, randMultiplier, randMultiplier, "./images/used images/Electron.png", true);

                                // Calculate the vector from the square's position to the target point
                                const vectorX = dragon.x + (dragon.widthPx / 2) - damageOrb.x + (damageOrb.widthPx / 2);
                                const vectorY = dragon.y + (dragon.heightPx / 2) - damageOrb.y + (damageOrb.heightPx / 2);

                                damageOrb.applyVelocity(vectorX, vectorY, 100, () => {
                                    damageOrb.divElem.remove();
                                    dragon.damageDragon(randMultiplier);
                                });
                            }, timeout);
                        }
                    }); 
                    // sends random amount of damage orbs to the dragon
                }
                else if (randPowerUpType == 5) {
                    let destroyAllCompounds = new PowerUp(powerUpLabelList[randPowerUpType], randX, randY, 0, 0, () => {
                        compoundList.forEach(compound => {
                            compound.destroyCompound();
                        });
                    }); 
                    // does not destroy all compounds for some reason
                }
                else if (randPowerUpType == 6) {
                    let healAmount = Math.floor(Math.random() * (Math.floor(player.initialHealth / 3) - 10)) + 10;
                    let healthPowerUp = new PowerUp(powerUpLabelList[randPowerUpType], randX, randY, 0, 0, () => {
                        player.healPlayer(healAmount);
                    });
                }
            }
        }
        else spawnRandomPowerUp();
    }

    let tick = () => {
        if (!gamePaused) {
            dragon.tickFunctions();

            compoundList.forEach(compound => {
                compound.tickFunctions();
            });

            powerUpList.forEach(powerUp => {
                powerUp.tickFunctions();
            })

            if (powerUpList.length < 5) {
                let randChanceForPowerUp = Math.floor(Math.random() * 1501); //chance for random powerup to spawn
                if (randChanceForPowerUp == 0) spawnRandomPowerUp();
            }

            if (!wonGame) requestAnimationFrame(tick);
        }
    }
        
    tick()

    // document.body.addEventListener("keypress", (event) => {
    //     if (event.code == "KeyC") {
    //         window.addEventListener("click", findCoordsOnClick);
    //     }
    //     if (event.code == "KeyG") {
    //         console.log("Debug Key Pressed");
    //         dragon.damageDragon(100000);

    //         // if (gamePaused) resumeGame();
    //         // else pauseGame();
    //     } 
    // });
    document.body.addEventListener("keydown", event => {
        if (event.code == "Escape") {
            if (gamePaused) resumeGame();
            else pauseGame();
        }
    })

    winGame = function() {
        wonGame = true;
        compoundList.forEach(compound => {
            compound.destroyCompound();
        });

        pauseGame(false);
        while (document.body.firstChild) {
            document.body.firstChild.remove();
        }

        let endGamePhoto = document.createElement("img");
        endGamePhoto.src = "./images/used images/End game banner.png";
        endGamePhoto.style.width = window_width + "px";
        endGamePhoto.style.height = window_height + "px";
        endGamePhoto.style.zIndex = -6;
        document.body.appendChild(endGamePhoto);
    }

    looseGame = function() {
        pauseGame(false);

        for (const child of document.body.children) {
            if (child.tagName == "DIV") {
                child.style.opacity = 0.1
            }
        }

        let playerDiedMenu = document.createElement("div");
        playerDiedMenu.style.backgroundColor = "black";
        playerDiedMenu.style.width = "75%";
        playerDiedMenu.style.height = "75%";
        playerDiedMenu.classList.add("centered")
        let playerDiedLable = document.createElement("p");
        playerDiedMenu.appendChild(playerDiedLable);
        playerDiedLable.style.position = "absolute";
        playerDiedLable.style.left = "50%";
        playerDiedLable.style.top = "50%";
        playerDiedLable.style.transform = "translate(-50%, -50%)";
        playerDiedLable.style.fontSize = "5vmax";
        playerDiedLable.style.color = "red";
        playerDiedLable.innerHTML = "You Died";
        document.body.appendChild(playerDiedMenu);
        let skeletonDragonImg = document.createElement("img");
        playerDiedMenu.appendChild(skeletonDragonImg);
        skeletonDragonImg.style.width = "27%";
        skeletonDragonImg.style.height = "36%";
        skeletonDragonImg.style.position = "absolute";
        skeletonDragonImg.style.left = "50%";
        skeletonDragonImg.style.top = "5%";
        skeletonDragonImg.style.transform = "translate(-50%, -5%)";
        skeletonDragonImg.src = "./images/used images/Skeleton Dragon.png";
        let restartButton = document.createElement("div");
        playerDiedMenu.appendChild(restartButton);
        restartButton.classList.add("pauseMenuButtom");
        restartButton.style.top = "80%";
        restartButton.style.transform = "translate(-50%, -80%)"
        let restartButtonLabel = document.createElement("div");
        restartButtonLabel.innerHTML = "Retry";
        restartButtonLabel.style.fontSize = "150%";
        restartButtonLabel.style.color = "red";
        restartButtonLabel.classList.add("centered");
        restartButton.appendChild(restartButtonLabel);
        restartButton.addEventListener("click", () => {restartGame()});
    }

    //seperator

    let pauseMenu = document.createElement("div");
    pauseMenu.style.backgroundColor = "black";
    pauseMenu.style.width = "75%";
    pauseMenu.style.height = "75%";
    pauseMenu.classList.add("centered")
    pauseMenu.classList.add("pauseMenu")
    let pausedLable = document.createElement("p");
    pauseMenu.appendChild(pausedLable);
    pausedLable.style.position = "absolute";
    pausedLable.style.left = "50%";
    pausedLable.style.top = "10%";
    pausedLable.style.transform = "translate(-50%, -10%)";
    pausedLable.style.fontSize = "10vmax";
    pausedLable.style.color = "white";
    pausedLable.innerHTML = "Paused";

    let resumeButton = document.createElement("div");
    pauseMenu.appendChild(resumeButton);
    resumeButton.classList.add("pauseMenuButtom");
    resumeButton.style.top = "50%";
    resumeButton.style.transform = "translate(-50%, -50%)"
    let resumeButtonLabel = document.createElement("div");
    resumeButtonLabel.innerHTML = "Resume";
    resumeButtonLabel.style.fontSize = "150%";
    resumeButtonLabel.style.color = "red";
    resumeButtonLabel.classList.add("centered");
    resumeButton.appendChild(resumeButtonLabel);
    resumeButton.addEventListener("click", () => {resumeGame()});

    let restartButton = document.createElement("div");
    pauseMenu.appendChild(restartButton);
    restartButton.classList.add("pauseMenuButtom");
    restartButton.style.top = "80%";
    restartButton.style.transform = "translate(-50%, -80%)"
    let restartButtonLabel = document.createElement("div");
    restartButtonLabel.innerHTML = "Restart";
    restartButtonLabel.style.fontSize = "150%";
    restartButtonLabel.style.color = "red";
    restartButtonLabel.classList.add("centered");
    restartButton.appendChild(restartButtonLabel);
    restartButton.addEventListener("click", () => {restartGame()});

    let unGlitchText = document.createElement("p");
    pauseMenu.appendChild(unGlitchText);
    unGlitchText.classList.add("pauseMenuUnglitchText");
    unGlitchText.innerText = "Click me if character is glitched and cannot move";
    unGlitchText.addEventListener("click", () => {player.setPos(window_width / 2 - (vmaxToPx(4) / 2), window_height - vmaxToPx(6)); resumeGame()});

    pauseGame = function(withMenu = true) {
        gamePaused = true;

        if (withMenu) {
            for (const child of document.body.children) {
                if (child.tagName == "DIV") child.style.opacity = 0.2;
            }
            document.body.appendChild(pauseMenu);
        }
    }

    resumeGame = function() {
        gamePaused = false;
        document.body.removeChild(pauseMenu);
        for (const child of document.body.children) {
            if (child.tagName == "DIV") child.style.opacity = 1;
        }
        
        tick();
    }

    //seperator

    restartGame = function() {
        window.removeEventListener("resize", windowResizeManager());
        let newBody = document.body.cloneNode(false);
        document.body.parentNode.replaceChild(newBody, document.body);

        player = null;
        dragon = null;

        compoundList.forEach(compound => {
            compound = null;
        });
        compoundList = [];

        powerUpList.forEach(powerUp => {
            powerUp = null;
        });
        powerUpList = [];

        window_height = null;
        window_width = null;
        characterList = null;
        compoundList = null;
        powerUpList = null;
        gamePaused = null;
        wonGame = null;
        player = null;
        dragon = null;
        winGame = null;
        looseGame = null;
        pauseGame = null;
        resumeGame = null;
        restartGame = null;
        tick = null;

        beginGame();
    }
}
