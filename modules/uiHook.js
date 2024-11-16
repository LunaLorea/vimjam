


const health_bar1 = document.getElementById("health-bar");
const health_bar2 = document.getElementById("health-bar2");
const health_value = document.getElementById("health-value");

const maxWidth = getComputedStyle(health_bar1).getPropertyValue("--block-width");

export function setHealth(currentHealth, maxHealth) {
    const newWidth = currentHealth / maxHealth * 100;

    console.log(newWidth);

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

    wave_value.innerText= `${currentWaveProgress}/${waveReached}`;
}
