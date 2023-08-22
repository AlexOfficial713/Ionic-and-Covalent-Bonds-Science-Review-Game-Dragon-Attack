import { boxCollisionDetection } from "./character.js";
import { player, powerUpList, vmaxToPx } from "./script.js";

export default class PowerUp {
    /**
     * 
     * @param {Function} collectedFunction this is the function that will be executed when the powerup is collected, if none, leave undefined, else slotIndex and duration can be set as 0
     */
    constructor(labelImageSrc, x, y, slotIndex, duration = 10000, collectedFunction = undefined) {
        if (collectedFunction == undefined || collectedFunction == null) {
            this.slotIndex = slotIndex;
            this.duration = duration;
        }

        this.collectedFunction = collectedFunction;

        this.div = document.createElement("div");
        this.div.style.position = "absolute";
        this.div.style.left = x + "px";
        this.div.style.top = y + "px";
        this.x = x;
        this.y = y;
        this.div.style.width = "6vmax";
        this.div.style.height = "6vmax";
        this.div.style.backgroundColor = "red";

        this.imgElem = document.createElement("img");
        this.imgElem.src = labelImageSrc;
        this.imgElem.style.width = "inherit";
        this.imgElem.style.height = "inherit";
        this.div.appendChild(this.imgElem);
        
        document.body.appendChild(this.div);
        powerUpList.push(this);
    }

    destroyPowerUp() {
        this.div.remove();
        powerUpList.splice(powerUpList.indexOf(this), 1);
    }

    tickFunctions() {
        if (boxCollisionDetection(this.x, this.y, vmaxToPx(6), vmaxToPx(6), player.x, player.y, player.widthPx, player.heightPx)) {
            powerUpList.splice(powerUpList.indexOf(this), 1);
            this.div.remove();
            if (this.collectedFunction == undefined || this.collectedFunction == null) {
                player.addPowerUp(this);
            }
            else this.collectedFunction();
        }
    }
}