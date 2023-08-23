import Character from "./character.js";
import { compoundList, player, randChanceForCompSpawn, vhToPx, vmaxToPx, vwToPx, winGame, window_height, window_width, wonGame } from "./script.js";
import jsonCompoundList from "./common compounds.json" assert { type: "json"}
import Compound from "./compound.js";

export default class Dragon extends Character {
    constructor() {
        super(vmaxToPx(38), 50, 24, 18, "./images/used images/Chemical Dragon.png");

        this.summonCooldown = false;
        this.initialHealth = 150;
        this.health = this.initialHealth;
        this.healthbar = document.createElement("div");
        this.healthbar.style.position = "absolute";
        this.healthbar.style.left = "5vmax";
        this.healthbar.style.top = "1vmax";
        this.healthbar.style.width = "90vmax";
        this.healthbar.style.height = "0.75in";
        this.healthbar.style.backgroundColor = "red";
        this.healthbar.style.zIndex = -5;
        this.healthbarLabel = document.createElement("p");
        this.healthbarLabel.innerHTML = "dragon healthbar";
        this.healthbarLabel.style.color = "black";
        this.healthbarLabel.style.fontWeight = "500";
        this.healthbarLabel.style.fontSize = "3vmax";
        this.healthbarLabel.style.whiteSpace = "nowrap";
        this.healthbar.appendChild(this.healthbarLabel);
        this.healthbarLabel.style.position = "absolute";
        this.healthbarLabel.style.left = "35vmax";

        document.body.appendChild(this.healthbar);
    }

    summonRandomCompound(x = 0, y = 0) {
        let randTypeNum = Math.floor(Math.random() * 2);
        let randCompoundList = undefined;
        let randType = (randTypeNum == 0) ? "ionic" : "covalent";

        if (randTypeNum == 0) { //ionic compounds
            randCompoundList = jsonCompoundList.ionic;
        }
        else if (randTypeNum == 1) { //covalent compounds
            randCompoundList = jsonCompoundList.covalent;
        }

        let randCompoundNum = Math.floor(Math.random() * Object.keys(randCompoundList).length);

        let randCompound = new Compound(x, y, randType, Object.keys(randCompoundList)[randCompoundNum], Object.values(randCompoundList)[randCompoundNum]);
    }

    damageDragon(damage = 1) {
        if (player.powerUpSlots[3]) damage *= 2
        this.health -= damage;

        if (!wonGame && this.health <= 0) {
            this.healthbar.remove();
            winGame();
        }
        else this.healthbar.style.width = 90 - ((this.initialHealth - this.health) * (90 / this.initialHealth)) + "vmax";

        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                let randVelX = Math.floor(Math.random() * 10) - 5;
                let randVelY = Math.floor(Math.random() * 10) - 5;

                this.applyVelocity(randVelX, randVelY, 10);
            }, 100 * i);
        }

        setTimeout(() => {
            this.setPos(vmaxToPx(38), 50);
        }, 500);
    }

    windowResizeFunction() {
        this.heightPx = vmaxToPx(this.heightVMAX);
        this.widthPx = vmaxToPx(this.widthVMAX);

        this.setPos(vmaxToPx(38), 50);
    }

    tickFunctions() {
        if (!this.summonCooldown && compoundList.length < 5) {
            let randChance = Math.floor((Math.random() * randChanceForCompSpawn) + 1);

            if (randChance == 1) {
                this.summonRandomCompound(this.x + this.widthPx / 2, this.y + this.heightPx / 2);
                this.summonCooldown = true;
                setTimeout(() => {
                    this.summonCooldown = false;
                }, 3000);
            }

            
        }
    }
}
