import { characterList, vmaxToPx, window_height, window_width } from "./script.js";

/**
     * 
     * @param {*} x1 left x-coord of first box
     * @param {*} y1 upper y-coord of first box
     * @param {*} w1 width in pixels of first box
     * @param {*} h1 height in pixels of first box
     * @param {*} x2 left x-coord of second box
     * @param {*} y2 upper y-coord of second box
     * @param {*} w2 width in pixels of second box
     * @param {*} h2 height in pixels of second box
     */
export function boxCollisionDetection(x1, y1, w1, h1, x2, y2, w2, h2) {
    if (
        x1 + w1 >= x2 &&
        x1 <= x2 + w2 &&
        y1 + h1 >= y2 &&
        y1 <= y2 + h2
    ) return true;
    else return false;
}

export default class Character {
    constructor(x, y, width, height, imageSrc, nonCollidable = false) {
        
        this.x = x;
        this.y = y;
        this.nonCollidable = nonCollidable;
        
        this.divElem = document.createElement("div");
        
        let divStyle = this.divElem.style;
        document.body.appendChild(this.divElem);
        this.divElem.classList.add("character");
        this.divElem.style.position = "absolute";
        this.divElem.style.left = x + "px";
        this.divElem.style.top = y + "px";

        this.image = document.createElement("img");
        this.divElem.appendChild(this.image);
        this.image.src = imageSrc;
        this.image.style.width = "inherit";
        this.image.style.height = "inherit";
        
        divStyle.setProperty("--characterHeight", height + "vmax");
        divStyle.setProperty("--characterWidth", width + "vmax");
        this.widthVMAX = width;
        this.heightVMAX = height;
        this.propHeight = divStyle.getPropertyValue("--characterHeight");
        this.propWidth = divStyle.getPropertyValue("--characterWidth");
        this.heightPx = vmaxToPx(this.propHeight.replace("vmax", ""));
        this.widthPx = vmaxToPx(this.propWidth.replace("vmax", ""));

        characterList.push(this)
    }

    setPos(x, y) {
        this.x = x;
        this.y = y;
        this.divElem.style.left = this.x + "px";
        this.divElem.style.top = this.y + "px";
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
            this.setPos(this.x, window_height - this.heightPx)
            y = 0
        }
        
        characterList.forEach(character => {
            if (!this.nonCollidable && !character.nonCollidable && character != this && 
                boxCollisionDetection(this.x + x, this.y + y, this.widthPx, this.heightPx,
                character.x, character.y, character.widthPx, character.heightPx)) {x = 0; y = 0};
        });

        if (x == 0 && y == 0) return 1;


        this.x += x;
        this.y += y;
        
        this.divElem.style.left = this.x + "px";
        this.divElem.style.top = this.y + "px";
    }

    applyVelocity(x, y, iterations, callBackFunction = undefined) {
        let XVel = x / iterations;
        let YVel = y / iterations;

        let updateFrame = () => {
            this.updatePos(XVel, YVel);
            iterations--;
            if (iterations > 0) requestAnimationFrame(updateFrame);
            else {
                if (callBackFunction != undefined) callBackFunction();
            }
        }

        updateFrame();
    }

    destroy() {
        this.divElem.remove();
    }

    windowResizeFunction() {
        this.heightPx = vmaxToPx(this.heightVMAX);
        this.widthPx = vmaxToPx(this.widthVMAX);
    }
}