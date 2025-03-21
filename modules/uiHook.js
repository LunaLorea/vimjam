
// here's an example for stats
/*
    import { setHealth, setWealth, setWaveProgress } from "./modules/uiHook.js";
document.addEventListener('click', () => {
  const randomValue = Math.round(Math.random()*100)/100;
  setHealth(randomValue, 1);
  setWealth(randomValue*10000, 10000);
  setWaveProgress(randomValue, 13);
  console.log("changed stats");
});
*/

// example to set loading screen (you can choose between 3 animations by setting the inner divs id to one of loading1, loading2, loading3)
/*
import {setLoading} from "./modules/uiHook.js";
setLoading(true);
// init
setLoading(false);
*/

// set the images of the queue
/*
import {setQueue} from "./modules/uiHook.js";
setQueue("straight", 1);
*/

// add a shopItem (there is a corresponding dictionary in this file, named tileNameDesc, but it only contains a placeholder for now)
/*
import {addShopItem} from "./modules/uiHook.js";
addShopItem("straight", 7000, 1);
*/

const tileNameDesc = {
    "tire":["Tire Tirade", "This Tower uses the weapon of cars against them. Launching tires at nearby cars to take them out!"],
    "toll":["Toll Booth", "Have capitalism on your side. Line your pockets with every car, that escapes!"],
    "spikes":["Spike Strike", "An automated spike strip deployer. So that no car can escape your ra(n)ge!"],
    "empty":["Flat Tile", "This is prime real estate, for your hard earned money you can hold back the void another day."],
    "audience":["Tribune","With the power of friendship, we will go green!"],
    "sniper":["Sniper Shot","This tire pile has the high ground to snipe all cars into early reTIREment!"]
};

export function initWaveButton(triggerFunction) {
    document.getElementById("wave-button").onclick=triggerFunction;
}
export function initRestartButton(triggerFunction) {
    document.getElementById("restart-button").onclick=triggerFunction;
}

const health_bar1 = document.getElementById("health-bar");
const health_bar2 = document.getElementById("health-bar2");
const health_value = document.getElementById("health-value");

const maxWidth = getComputedStyle(health_bar1).getPropertyValue("--block-width");

export function setHealth(currentHealth, maxHealth) {
    const newWidth = currentHealth / maxHealth * 100;

    health_bar1.style.width = `${newWidth}%`; 
    health_bar2.style.width = `${newWidth}%`; 

    health_value.innerText= `${currentHealth}/${maxHealth}`;
}

const wealth_bar1 = document.getElementById("wealth-bar");
const wealth_bar2 = document.getElementById("wealth-bar2");
const wealth_value = document.getElementById("wealth-value");


export function setWealth(currentWealth, maxWealth) {
    const newWidth = currentWealth / maxWealth * 100;

    wealth_bar1.style.width = `${newWidth}%`; 
    wealth_bar2.style.width = `${newWidth}%`; 

    wealth_value.innerText= `${currentWealth}/${maxWealth}`;
}

const wave_bar1 = document.getElementById("wave-bar");
const wave_bar2 = document.getElementById("wave-bar2");
const wave_value = document.getElementById("wave-value");


export function setWaveProgress(currentWaveProgress, waveReached) {
    const newWidth = currentWaveProgress * 100;

    wave_bar1.style.width = `${newWidth}%`; 
    wave_bar2.style.width = `${newWidth}%`; 

    wave_value.innerText= `${Math.round(currentWaveProgress*100)}%/${waveReached}`;
}


export function setLoading(state) {
    const loadingElement = document.getElementById("loading");
    loadingElement.style.display = state ? "block" : "none";
}

const queueList = document.getElementById('tile-queue');

export function queueAppend(tile) {
    let listItem = document.createElement('li');
    let image = document.createElement('img');
    image.src=`../UI/images/${tile}.png`;
    image.width="128";
    image.height="128";
    
    queueList.appendChild(listItem.appendChild(image));
}

export function queueActiveLength(num) {
    setTileCount(num);
    const len = queueList.children.length;
    for (let i = 0; i < len; i++) {
        let unreachableBool = i >= num;
        queueList.children[i].classList.toggle("unreachable", unreachableBool);
    }
}
function setTileCount(amount) {
    document.getElementById("tile-count").innerHTML=amount;
}

/*export function queuePush(tile) {
    let listItem = document.createElement('li');
    let image = document.createElement('img');
    image.src=`/UI/images/${tile}.png`;
    image.width="128";
    image.height="128";

    queueList.insertBefore(listItem.appendChild(image), listItem.firstChild);
}*/

export function queuePop() {
    queueList.removeChild(queueList.firstChild);
}

const shop1 = document.getElementById("shop-category-1");
const shop2 = document.getElementById("shop-category-2");

export function addShopItem(tile, price, category, buyingFunc) {

    let shop;
    switch (category) { // i hate that a case statement is drop through
        case 1:
            shop = shop1;
            break;
        case 2:
            shop = shop2;
            break;
        default:
            console.log("invalid category");
            return;
    }

    // error handling
    if (!(tile in tileNameDesc)) {
        console.log(tile);
        console.assert(tile in tileNameDesc);
        return;
    }

    const [name, desc] = tileNameDesc[tile];


    //chat gpt constructing the html element:
    /*
    <div class="shop-item">
        <img class="shop-item-img" src="/UI/images/tires.png">
        <button class="shop-item-buy">Buy!</button>
        <h1 class="shop-item-title">road</h1>
        <p class="shop-item-description">a road worth buying</p>
    </div>
    */

    // Create the main container div
    const shopItem = document.createElement('div');
    shopItem.classList.add('shop-item');

    // Create the img element
    const img = document.createElement('img');
    img.classList.add('shop-item-img');
    img.src = `/UI/images/${tile}.png`;  // Set the image source

    // Create the button element
    const button = document.createElement('button');
    button.classList.add('shop-item-buy');
    button.onclick = () => {buyingFunc()} // HERE YOU CAN INSERT THE BUY FUNCTION
    button.textContent = `${price}`;  // Set the text content of the button

    // Create the h1 element
    const title = document.createElement('p');
    title.classList.add('shop-item-title');
    title.textContent = `${name}`;  // Set the title text

    // Create the p element
    const p = document.createElement('p');
    p.classList.add('shop-item-description');
    p.textContent = `${desc}`;  // Set the description text

    // Append the elements to the div
    shopItem.appendChild(img);
    shopItem.appendChild(button);
    shopItem.appendChild(title);
    shopItem.appendChild(p);

    shop.appendChild(shopItem);
    console.log("shop item added");
}

export function toggleGameOverlay(boolean){
    const overlay = document.getElementById("game-over-lay");
    overlay.style.display = boolean ? "block" : "none";
    overlay.classList.toggle("active", boolean);
}

const infobox = document.getElementById("info-screen");

function setInfo(info, hotCorner) {
    console.log("setInfo");
    infobox.firstChild.innerText = hotCorner;
    document.getElementById("info").innerText = info;
    infobox.classList.toggle("active", true);
}

function removeInfo() {
    console.log("delInfo");
    infobox.classList.toggle("active", false);
}

export function sendMsg(info, icon, delay) {
    setInfo(info, icon);
    setTimeout(() => removeInfo(), 1000+delay); // 1s is animation time
}
