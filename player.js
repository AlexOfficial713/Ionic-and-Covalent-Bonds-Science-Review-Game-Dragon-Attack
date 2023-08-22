import Character from "./character.js";
import { vmaxToPx, window_height, window_width, characterList, compoundList, gamePaused, looseGame } from "./script.js";
import { boxCollisionDetection } from "./character.js";

export default class Player extends Character {
    constructor(x, y, speed = 1) {
        super(x, y, 4, 4, "./images/used images/Hydrogen.png");
        this.divElem.style.zIndex = -2;

        //[one hit compounds, speed, slow time down, double damage to dragon, ]
        this.powerUpSlots = [0, 0, 0, 0];

        this.characterController = new characterController(this, speed);
        this.characterController.startController();

        this.initialHealth = 1000;
        this.health = this.initialHealth;
        this.healthbar = document.createElement("div");
        this.healthbar.style.position = "absolute";
        this.healthbar.style.left = "1vmax";
        this.healthbar.style.top = "90%";
        this.healthbar.style.width = "20vmax";
        this.healthbar.style.height = "2.5vmax";
        this.healthbar.style.backgroundColor = "red";
        this.healthbar.style.zIndex = -5;
        this.healthbarLabel = document.createElement("p");
        this.healthbarLabel.innerHTML = "player healthbar";
        this.healthbarLabel.style.color = "black";
        this.healthbarLabel.style.fontWeight = "500";
        this.healthbarLabel.style.fontSize = "1vmax";
        this.healthbarLabel.style.whiteSpace = "nowrap";
        this.healthbar.appendChild(this.healthbarLabel);
        this.healthbarLabel.style.position = "absolute";
        this.healthbarLabel.style.left = "7vmax";
        this.healthbarLabel.style.top = "0.5vmax";

        document.body.appendChild(this.healthbar);
    }

    addPowerUp(powerUp) {
        this.powerUpSlots[powerUp.slotIndex] = 1;

        setTimeout(() => {
            this.powerUpSlots[powerUp.slotIndex] = 0;
        }, powerUp.duration);
    }

    damagePlayer(damage = 1) {
        this.health -= damage;

        if (this.health <= 0) {
            this.healthbar.remove();
            looseGame();
        }
        else this.healthbar.style.width = 20 - ((this.initialHealth - this.health) * (20 / this.initialHealth)) + "vmax";
    }

    healPlayer(healPoints = 1) {
        if (this.health == this.initialHealth) return;
        else if (this.health + healPoints > this.initialHealth) {
            this.health = this.initialHealth;
            this.healthbar.style.width = "20vmax";
        }
        else {
            this.health += healPoints;
            this.healthbar.style.width = 20 - ((this.initialHealth - this.health) * (20 / this.initialHealth)) + "vmax";
        }
    }
}

export class characterController {
    constructor(player, moveamount = 1) {
        this.player = player;
        this.moveamount = moveamount / 5;
        this.pDiv = this.player.divElem;

        this.swordImg = document.createElement("img");
        this.swordImg.src = "./images/used images/lava sword.png"
        this.currentSwordType = "lava";
        this.swordDiv = document.createElement("div");
        this.swordDiv.classList.add("sword");
        this.swordDiv.appendChild(this.swordImg);
        this.swordImg.style.width = "inherit";
        this.swordImg.style.height = "inherit";

        this.swordWidthVmax = 1.5;
        this.swordHeightVmax = 6.5;

        this.swordWidthPx = vmaxToPx(this.swordWidthVmax);
        this.swordHeightPx = vmaxToPx(this.swordHeightVmax);
    }

    startController() {
        let moveLeft = false;
        let moveRight = false;
        let moveDown = false;
        let moveUp = false;
        let moving = false;
        let attacking = false;
        let swordRotation = 0;
        let swordWasDisabled = false;
        document.body.addEventListener("keydown", (event) => {
            if (!gamePaused) {
                let ec = event.code;

                if (ec == "KeyA") {
                    moveLeft = true;
                    if (!moving) {
                        controlHandler()
                        moving = true;
                    }
                    determineSwordPos();
                }
                if (ec == "KeyD") {
                    moveRight = true;
                    if (!moving) {
                        controlHandler()
                        moving = true;
                    }
                    determineSwordPos();
                }
                if (ec == "KeyW") {
                    moveUp = true;
                    if (!moving) {
                        controlHandler()
                        moving = true;
                    }
                    determineSwordPos();
                }
                if (ec == "KeyS") {
                    moveDown = true;
                    if (!moving) {
                        controlHandler()
                        moving = true;
                    }
                    determineSwordPos();
                }
                if (ec == "Space") {
                    if (swordWasDisabled) swordWasDisabled = false;

                    determineSwordPos();
                    this.player.divElem.appendChild(this.swordDiv);
                    attacking = true;
                    attackHandler();
                }
                if (ec == "KeyF") {
                    switchSwords();
                }
            }
        })
        
        document.body.addEventListener("keyup", (event) => {
            let ec = event.code;
            
            if (ec == "KeyA") {
                moveLeft = false;
                determineSwordPos();
            }
            if (ec == "KeyD") {
                moveRight = false;
                determineSwordPos();
            }
            if (ec == "KeyW") {
                moveUp = false;
                determineSwordPos();
            }
            if (ec == "KeyS") {
                moveDown = false;
                determineSwordPos();
            }
            if (ec == "Space") {
                if (swordWasDisabled) swordWasDisabled = false;

                if (this.player.divElem.contains(this.swordDiv)) this.player.divElem.removeChild(this.swordDiv);
                attacking = false;
            }
            
        })
        
        let controlHandler = () => {
            let moveValue = (this.player.powerUpSlots[1]) ? this.moveamount * 1.5 : this.moveamount;
            if (moveLeft) this.player.applyVelocity(-vmaxToPx(moveValue), 0, 1);
            if (moveRight) this.player.applyVelocity(vmaxToPx(moveValue), 0, 1);
            if (moveUp) this.player.applyVelocity(0, -vmaxToPx(moveValue), 1);
            if (moveDown) this.player.applyVelocity(0, vmaxToPx(moveValue), 1);

            if (moveDown || moveLeft || moveRight || moveUp) requestAnimationFrame(controlHandler);
            else moving = false;
        }

        let attackHandler = () => {
            compoundList.forEach(compound => {
                if ((compound.type == "ionic" && this.currentSwordType == "water") || (compound.type == "covalent" && this.currentSwordType == "lava")) {
                    if (swordRotation == 0) {
                        if (boxCollisionDetection(vmaxToPx(this.player.widthVMAX / 2.0 - (this.swordWidthVmax / 2)) + this.player.x, -vmaxToPx(5) + this.player.y, this.swordWidthPx, this.swordHeightPx, 
                        compound.x, compound.y, compound.widthPx, compound.heightPx)) {
                            if (!this.player.powerUpSlots[0]) compound.damageCompound(34);
                            else compound.damageCompound(100);
                            pushPlayerAwayFromCoord(compound.x + (compound.widthPx / 2), compound.y + (compound.heightPx / 2));
                            disableSword();
                        }
                    }
                    else if (swordRotation == 90) {
                        if (boxCollisionDetection(vmaxToPx(5.5) + this.player.x, vmaxToPx(this.player.heightVMAX / 2.0 - (this.swordHeightVmax / 2)) + this.player.y, this.swordHeightPx, this.swordWidthPx, 
                        compound.x, compound.y, compound.widthPx, compound.heightPx)) {
                            if (!this.player.powerUpSlots[0]) compound.damageCompound(34);
                            else compound.damageCompound(100);
                            pushPlayerAwayFromCoord(compound.x + (compound.widthPx / 2), compound.y + (compound.heightPx / 2));
                            disableSword();
                        }
                    }
                    else if (swordRotation == 180) {
                        if (boxCollisionDetection(vmaxToPx(this.player.widthVMAX / 2.0 - (this.swordWidthVmax / 2)) + this.player.x, vmaxToPx(this.player.heightVMAX) + this.player.y, this.swordWidthPx, this.swordHeightPx, 
                        compound.x, compound.y, compound.widthPx, compound.heightPx)) {
                            if (!this.player.powerUpSlots[0]) compound.damageCompound(34);
                            else compound.damageCompound(100);
                            pushPlayerAwayFromCoord(compound.x + (compound.widthPx / 2), compound.y + (compound.heightPx / 2));
                            disableSword();
                        }
                    }
                    else if (swordRotation == 270) {
                        if (boxCollisionDetection(-vmaxToPx(3.49) + this.player.x, vmaxToPx(this.player.heightVMAX / 2.0 - (this.swordHeightVmax / 2)) + this.player.y, this.swordHeightPx, this.swordWidthPx, 
                        compound.x, compound.y, compound.widthPx, compound.heightPx)) {
                            if (!this.player.powerUpSlots[0]) compound.damageCompound(34);
                            else compound.damageCompound(100);
                            pushPlayerAwayFromCoord(compound.x + (compound.widthPx / 2), compound.y + (compound.heightPx / 2));
                            disableSword();
                        }
                    }
                }
            });

            if (attacking) requestAnimationFrame(attackHandler);
        }

        let determineSwordPos = () => {
            if (moveDown) {
                this.swordDiv.style.setProperty("--swordRotation", "180deg");
                this.swordDiv.style.left = this.player.widthVMAX / 2.0 - (this.swordWidthVmax / 2) + "vmax";
                this.swordDiv.style.top = this.player.heightVMAX + "vmax";
                swordRotation = 180;
            }
            else if (moveLeft) {
                this.swordDiv.style.setProperty("--swordRotation", "270deg");
                this.swordDiv.style.left = -3.98 + "vmax";
                this.swordDiv.style.top = this.player.heightVMAX / 2.0 - (this.swordHeightVmax / 2) + "vmax";
                swordRotation = 270;
            }
            else if (moveRight) {
                this.swordDiv.style.setProperty("--swordRotation", "90deg");
                this.swordDiv.style.left = 6.3 + "vmax";
                this.swordDiv.style.top = this.player.heightVMAX / 2.0 - (this.swordHeightVmax / 2) + "vmax";
                swordRotation = 90;
            }
            else if (moveUp) {
                this.swordDiv.style.setProperty("--swordRotation", "0deg");
                this.swordDiv.style.left = this.player.widthVMAX / 2.0 - (this.swordWidthVmax / 2) + "vmax";
                this.swordDiv.style.top = -6.2 + "vmax";
                swordRotation = 0;
            }
        }

        let pushPlayerAwayFromCoord = (x, y) => {
            // Chosen speed or rate
            const speed = 25; // Adjust this value as needed

            // Calculate the vector from the square's position to the target point
            const vectorX = x - this.player.x + (this.player.widthPx / 2);
            const vectorY = y - this.player.y + (this.player.heightPx / 2);

            // Calculate the length of the vector (distance between square and target)
            const distance = Math.sqrt(vectorX * vectorX + vectorY * vectorY);

            // Normalize the vector to get a unit vector (length of 1)
            const normalizedVectorX = vectorX / distance;
            const normalizedVectorY = vectorY / distance;

            // Calculate the movement vector by multiplying the normalized vector by the speed
            const movementVectorX = normalizedVectorX * speed;
            const movementVectorY = normalizedVectorY * speed;

            this.player.applyVelocity(-vmaxToPx(movementVectorX), -vmaxToPx(movementVectorY), 30);
        }

        let disableSword = () => {
            if (this.player.divElem.contains(this.swordDiv)) this.player.divElem.removeChild(this.swordDiv);
            attacking = false;
            swordWasDisabled = true;

            setTimeout(() => {
                if (swordWasDisabled) {
                    determineSwordPos();
                    this.player.divElem.appendChild(this.swordDiv);
                    attacking = true;
                    attackHandler();

                    swordWasDisabled = false;
                }
            }, 200);
        } 

        let switchSwords = () => {
            if (this.currentSwordType == "lava") {
                this.currentSwordType = "water";
                this.swordImg.src = "./images/used images/water sword.png";
            }
            else { //sword type is water
                this.currentSwordType = "lava";
                this.swordImg.src = "./images/used images/lava sword.png";
            }
        }
    }


    windowResizeFunction() {
        this.swordWidthPx = vmaxToPx(this.swordWidthVmax);
        this.swordHeightPx = vmaxToPx(this.swordHeightVmax);
    }
}