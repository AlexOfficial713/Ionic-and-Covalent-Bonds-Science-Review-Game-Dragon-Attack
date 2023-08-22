import Character, { boxCollisionDetection } from "./character.js";
import { compoundList, player, vmaxToPx, pxToVmax, window_width, window_height, dragon } from "./script.js";

export default class Compound {
    constructor(x, y, type, compoundSymbol, totalMass) {
        //console.log("molecule info: \n" + "type " + type + ";\n" + "compound symbol " + compoundSymbol + ";\n" + "total mass " + totalMass);

        this.x = x;
        this.y = y;
        this.type = type;
        this.compoundSymbol = compoundSymbol;
        this.totalMass = totalMass;
        this.elementList = compoundSymbol.split(/(?=[A-Z])/);
        this.compoundHealth = 100;

        for (let i = 0; i < this.elementList.length; i++) {
            let curr = this.elementList[i];
            if (/\d/.test(curr)) {
                for (let j = 0; j < curr.length; j++) {
                    if (!isNaN(curr[j])) {
                        this.elementList[i] = curr.substring(0, j) + " * " + curr.substring(j);
                        break;
                    }
                }
            }
        }

        this.div = document.createElement("div");
        let hue = 240 - (0.4819470661472348 * this.totalMass - 0.9735330736174144);
        this.elementDivList = [];

        this.highestRandY = 0;

        this.elementList.forEach((element, index) => {
            let elemDiv = document.createElement("div");
            let elemLabel = document.createElement("p");
            elemLabel.innerHTML = element;
            this.elementDivList.push(elemDiv);
            this.div.appendChild(elemDiv);
            elemDiv.style.position = "absolute";
            elemDiv.style.backgroundColor = "hsl(" + hue + ", 100%, 50%)";
            elemDiv.style.border = "0.5vmax solid black";
            elemDiv.style.width = "4.5vmax";
            elemDiv.style.height = "4.5vmax";
            elemLabel.style.position = "absolute";
            elemLabel.style.left = "0.3vmax";
            elemLabel.style.top = "0.3vmax";
            elemLabel.style.fontSize = "1.4vmax";
            elemLabel.style.color = "black";
            elemLabel.style.fontWeight = 900;
            elemDiv.appendChild(elemLabel);

            elemDiv.style.left = 5 * index + "vmax";
            let randYValue = Math.random() * 3;
            elemDiv.style.top = randYValue + "vmax";
            if (randYValue > this.highestRandY) this.highestRandY = randYValue;

        });

        this.div.style.position = "absolute";
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
        this.div.style.width = 5 * this.elementList.length + "vmax";
        this.div.style.height = 5 + this.highestRandY + "vmax";
        this.widthPx = vmaxToPx(5 * this.elementList.length);
        this.heightPx = vmaxToPx(5 + this.highestRandY);
        // this.div.style.border = "0.5vmax solid red";
        this.div.style.zIndex = -1;
        document.body.appendChild(this.div);

        compoundList.push(this);
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
    }
    
    updatePos(x, y) {
        if (this.x + x < 0) {
            this.setPos(0, this.y);
            x = 0;
        }
        if (this.y + y < 0) {
            this.setPos(this.x, 0);
            y = 0;
        }
        if (this.x + this.widthPx + x > window_width) {
            this.setPos(window_width - this.widthPx, this.y);
            x = 0;
        }
        if (this.y + this.heightPx + y > window_height) {
            this.setPos(this.x, window_height - this.heightPx);
            y = 0;
        }

        if (x == 0 && y == 0) return 1;

        this.x += x;
        this.y += y;
        
        this.div.style.left = this.x + "px";
        this.div.style.top = this.y + "px";
    }

    applyVelocity(x, y, iterations) {
        let XVel = x / iterations;
        let YVel = y / iterations;

        let updateFrame = () => {
            this.updatePos(XVel, YVel);
            iterations--;
            if (iterations > 0) requestAnimationFrame(updateFrame);
        }

        updateFrame();
    }

    chasePlayer() {
        let x1 = pxToVmax(this.x + (this.widthPx / 2));
        let y1 = pxToVmax(this.y + (this.heightPx / 2));
        
        let x2 = pxToVmax(player.x + (player.widthPx / 2));
        let y2 = pxToVmax(player.y + (player.heightPx / 2));

        let distance = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        let MULTIPLIER = 2; //0.7 least negativity -> 1; 4.0 most negativity -> 5.2
        let k = MULTIPLIER * distance;
        let acceleration = k / Math.pow(distance, 2);
        if (acceleration > 0.2) acceleration = 0.2;
        let vx = acceleration * (x2 - x1) / distance;
        let vy = acceleration * (y2 - y1) / distance;

        let appliedVx = (player.powerUpSlots[2]) ? vx / 4 : vx
        let appliedVy = (player.powerUpSlots[2]) ? vy / 4 : vy

        this.applyVelocity(vmaxToPx(appliedVx), vmaxToPx(appliedVy), 1);
    }

    damageCompound(damagePoints) {
        if (this.compoundHealth - damagePoints <= 0) this.destroyCompound();
        else {
            this.compoundHealth -= damagePoints;
            this.div.style.opacity = this.compoundHealth + "%";
        }
    }

    destroyCompound() {
        this.div.remove();
        compoundList.splice(compoundList.indexOf(this), 1);

        for (let i = 0; i < this.elementList.length * 3; i++) {
            let randX = Math.floor(Math.random() * this.widthPx) + this.x;
            let randY = Math.floor(Math.random() * this.heightPx) + this.y;
            let damageOrb = new Character(randX, randY, 2, 2, "./images/used images/Electron.png", true);

            // Calculate the vector from the square's position to the target point
            const vectorX = dragon.x + (dragon.widthPx / 2) - damageOrb.x + (damageOrb.widthPx / 2);
            const vectorY = dragon.y + (dragon.heightPx / 2) - damageOrb.y + (damageOrb.heightPx / 2);

            let frameTime = (player.powerUpSlots[2]) ? 400 : 100;

            damageOrb.applyVelocity(vectorX, vectorY, frameTime, () => {
                damageOrb.divElem.remove();
                dragon.damageDragon();
            });
        }
    }

    windowResizeFunction() {
        this.widthPx = vmaxToPx(5 * this.elementList.length);
        this.heightPx = vmaxToPx(5 + this.highestRandY);
    }

    tickFunctions() {
        this.chasePlayer();

        if (boxCollisionDetection(this.x, this.y, this.widthPx, this.heightPx, player.x, player.y, player.widthPx, player.heightPx)) player.damagePlayer();
    }
}