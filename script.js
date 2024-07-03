const VOLTAGES = ["5", "9", "12", "19", "24", "36", "48", "56"];
const CURRENTS = ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];
const HOURS = ["1", "2", "4", "6", "8", "12", "16", "24"];
const BATTERY_VOLTAGES = ["6", "12", "24", "48"];
const DISCHARGE = 0.8;
const INVERTOR_EFFICIENCY = 0.9;

function createSelectOptions(options) {
    return options.map(option => `<option value="${option}">${option}</option>`).join('');
}


const voltageOptions = createSelectOptions(VOLTAGES);
const currentOptions = createSelectOptions(CURRENTS);
const hoursOptions = createSelectOptions(HOURS);


function createPowerContainer() {
    const powerContainer = document.getElementById('power-container');
    
    const fragment = document.createDocumentFragment();
    
    fragment.appendChild(createHeader());
    
    const rowsContainer = document.createElement('div');
    rowsContainer.id = 'rows-container';
    fragment.appendChild(rowsContainer);
    
    fragment.appendChild(createTotalRow());
    
    powerContainer.appendChild(fragment);
}

function createHeader() {
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = [
        'Device', 'Use', 'Voltage (V)', 'Current (A)', 'Power (W)'
    ].map(text => `<div>${text}</div>`).join('');
    return header;
}

function createTotalRow() {
    const totalRow = document.createElement('div');
    totalRow.className = 'row total-row';
    totalRow.innerHTML = `
        <div>Total Power</div>
        <div>Devices in use: <span id="devices-in-use">0</span></div>
        <div>Max voltage: <span id="max-voltage">0</span> V</div>
        <div></div>
        <div>Total power: <span id="total-power">0</span> W</div>
    `;
    return totalRow;
}


function updateDevicesInUse() {
    const checkboxes = document.querySelectorAll('.device-checkbox');
    const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    document.getElementById('devices-in-use').textContent = checkedCount;
}


function updateTotalPower() {
    const rows = document.querySelectorAll('.row:not(.total-row)');
    let totalPower = 0;

    rows.forEach(row => {
        const isChecked = row.querySelector('.device-checkbox').checked;
        if (isChecked) {
            const voltage = parseFloat(row.querySelector('.voltage-select').value) || 0;
            const current = parseFloat(row.querySelector('.current-select').value) || 0;
            const power = voltage * current;
            row.querySelector('.power-field').value = power.toFixed(2);
            totalPower += power;
        } else {
            row.querySelector('.power-field').value = '';
        }
    });

    document.getElementById('total-power').textContent = totalPower.toFixed(2);
}


function createRow(rowNumber) {
    const row = document.createElement('div');
    row.className = 'row';
    row.id = `row${rowNumber}`;

    row.innerHTML = `
        <div>Device ${rowNumber}</div>
        <div><input type="checkbox" class="device-checkbox"></div>
        <div>
            ${createSelect('voltage', rowNumber)}
        </div>
        <div>
            ${createSelect('current', rowNumber)}
        </div>
        <div><span class="power-field">0</span> W</div>
    `;

    return row;
}

function createSelect(type, rowNumber) {
    const options = type === 'voltage' ? voltageOptions : currentOptions;
    return `
        <select class="${type}-select">
            <option value="">---</option>
            ${options}
        </select> ${type === 'voltage' ? 'V' : 'A'}
    `;
}

function updateMaxVoltage() {
    const rows = document.querySelectorAll('.row:not(.total-row)');
    const voltages = Array.from(rows)
        .filter(row => row.querySelector('.device-checkbox').checked)
        .map(row => parseFloat(row.querySelector('.voltage-select').value) || 0)
        .filter(voltage => voltage > 0);

    const maxVoltage = voltages.length > 0 ? Math.max(...voltages) : 0;
    document.getElementById('max-voltage').textContent = maxVoltage.toFixed(2);
}


function updateTotalPower() {
    const rows = document.querySelectorAll('.row:not(.total-row)');
    let totalPower = 0;

    rows.forEach(row => {
        const isChecked = row.querySelector('.device-checkbox').checked;
        const powerField = row.querySelector('.power-field');

        if (isChecked) {
            const voltage = parseFloat(row.querySelector('.voltage-select').value) || 0;
            const current = parseFloat(row.querySelector('.current-select').value) || 0;
            const power = voltage * current;
            powerField.textContent = power.toFixed(2);
            totalPower += power;
        } else {
            powerField.textContent = '0';
        }
    });

    document.getElementById('total-power').textContent = totalPower.toFixed(2);
    recommendBattery(); // Add this line
}

function createRows(numberOfRows) {
    const rowsContainer = document.getElementById('rows-container');
    const fragment = document.createDocumentFragment();

    for (let i = 1; i <= numberOfRows; i++) {
        fragment.appendChild(createRow(i));
    }

    rowsContainer.appendChild(fragment);

    // Add event listener to the container for event delegation
    rowsContainer.addEventListener('change', function(event) {
        if (event.target.classList.contains('device-checkbox') ||
            event.target.classList.contains('voltage-select') ||
            event.target.classList.contains('current-select')) {
            updateDevicesInUse();
            updateMaxVoltage();
            updateTotalPower();
            calculateEnergy(); // Add this line
        }
    });
}

function calculatePower(rowNumber) {
    const row = document.getElementById(`row${rowNumber}`);
    const voltageSelect = row.querySelector('.voltage-select');
    const currentSelect = row.querySelector('.current-select');
    const powerField = row.querySelector('.power-field');

    const voltage = parseFloat(voltageSelect.value);
    const current = parseFloat(currentSelect.value);

    if (isNaN(voltage) || isNaN(current)) {
        powerField.value = '';
        updateTotalPower();
        return;
    }

    const power = voltage * current;
    powerField.value = power.toFixed(2);
    updateTotalPower();
}


function createEnergyContainer() {
    const capacityContainer = document.getElementById('energy-container');
    const container = document.createElement('div');
    container.className = 'energy-container';
    
    container.innerHTML = `
        <div>
            <label for="desired-time">Desired time to work</label>
            <select id="desired-time">
                <option value="">---</option>
                ${hoursOptions}
            </select> Hours
        </div>
        <div>
            <span>Required Energy: </span>
            <span id="required-energy">0</span> Wh
        </div>
    `;

    capacityContainer.appendChild(container);

    // Add event listener for the select
    document.getElementById('desired-time').addEventListener('change', calculateEnergy);
}

function calculateEnergy() {
    const desiredTimeSelect = document.getElementById('desired-time');
    const requiredEnergySpan = document.getElementById('required-energy');
    
    const desiredTime = parseFloat(desiredTimeSelect.value) || 0;
    const totalPower = parseFloat(document.getElementById('total-power').textContent) || 0;
    
    if (desiredTime > 0 && totalPower > 0) {
        const requiredEnergy = totalPower * desiredTime;
        requiredEnergySpan.textContent = requiredEnergy.toFixed(2);
        // recommendBattery(); // Add this line
    } else {
        requiredEnergySpan.textContent = '0';
    }
    recommendBattery(); // Add this line
}

// function createBatteryContainer() {
//     const batteryContainer = document.getElementById('battery-container');
//     const container = document.createElement('div');
//     container.classList.add('battery-container');
    
//     const title = document.createElement('div');
//     title.textContent = 'Recommended Battery (80% discharge)';
    
//     const recommendations = document.createElement('div');
//     recommendations.id = 'battery-recommendations';
    
//     container.appendChild(title);
//     container.appendChild(recommendations);
    
//     batteryContainer.appendChild(container);
// }

// function calculatePower(rowNumber) {
//     const row = document.getElementById(`row${rowNumber}`);
//     const voltageSelect = row.querySelector('.voltage-select');
//     const currentSelect = row.querySelector('.current-select');
//     const powerField = row.querySelector('.power-field');

//     const voltage = parseFloat(voltageSelect.value);
//     const current = parseFloat(currentSelect.value);

//     if (isNaN(voltage) || isNaN(current)) {
//         powerField.value = '';
//         updateTotalPower();
//         return;
//     }

//     const power = voltage * current;
//     powerField.value = power.toFixed(2);
//     updateTotalPower();
// }


// function recommendBattery() {
//     const maxVoltage = parseFloat(document.getElementById('max-voltage').value);
//     const totalPower = parseFloat(document.getElementById('total-power').value);
//     const requiredEnergy = parseFloat(document.getElementById('required-energy').value);
//     const batteryRecommendations = document.getElementById('battery-recommendations');

//     if (isNaN(maxVoltage) || isNaN(requiredEnergy)) {
//         batteryRecommendations.innerHTML = '';
//         return;
//     }

//     let closestLowerVoltage = null;
//     let closestHigherVoltage = null;

//     for (const voltage of BATTERY_VOLTAGES) {
//         const v = parseFloat(voltage);
//         if (v < maxVoltage) {
//             // Find the closest voltage less than maxVoltage
//             closestLowerVoltage = v;
//         } else if (v > maxVoltage && (closestHigherVoltage === null || v < closestHigherVoltage)) {
//             // Find the next closest voltage greater than maxVoltage
//             closestHigherVoltage = v;
//         }
//     }

//     const recommendedCapacities = [];
//     if (closestLowerVoltage === null) {
//         recommendedCapacities.push('StepUp Invertor: No suitable lower voltage found');
//     } else {
//         const lowerCapacity = ceilToCell(requiredEnergy, closestLowerVoltage);
//         const lowerCurrent = ((totalPower / closestLowerVoltage) / INVERTOR_EFFICIENCY).toFixed(2);
//         recommendedCapacities.push(`StepUp Invertor: Battery ${closestLowerVoltage}V - ${lowerCurrent}A: ${lowerCapacity} mAh`);
//     }

//     // Check if maxVoltage itself exists in BATTERY_VOLTAGES
//     if (BATTERY_VOLTAGES.includes(maxVoltage.toString())) {
//         const exactCapacity = ceilToCell(requiredEnergy, maxVoltage);
//         const exactCurrent = ((totalPower / maxVoltage) / INVERTOR_EFFICIENCY).toFixed(2);
//         recommendedCapacities.push(`StepDown Invertor: Battery ${maxVoltage}V - ${exactCurrent}A: ${exactCapacity} mAh`);
//     } else if (closestHigherVoltage !== null) {
//         const higherCapacity = ceilToCell(requiredEnergy, closestHigherVoltage);
//         const higherCurrent = ((totalPower / closestHigherVoltage) / INVERTOR_EFFICIENCY).toFixed(2);
//         recommendedCapacities.push(`StepDown Invertor: Battery ${closestHigherVoltage}V - ${higherCurrent}A: ${higherCapacity} mAh`);
//     } else {
//         recommendedCapacities.push('StepDown Invertor: No suitable higher voltage found');
//     }

//     batteryRecommendations.innerHTML = recommendedCapacities.join('<br>');
// }

// function ceilToCell(requiredEnergy, voltage) {
//     if (isNaN(voltage) || isNaN(requiredEnergy)) {
//         return 0;
//     }
//     // const capacity = (requiredEnergy / voltage) * 1.25 * 1000;
//     const capacity = (requiredEnergy / voltage) / DISCHARGE * 1000;
//     return Math.ceil(capacity / 100) * 100;
// }
  
function createBatteryContainer() {
    const batteryContainer = document.getElementById('battery-container');
    const container = document.createElement('div');
    container.className = 'battery-container';
    
    container.innerHTML = `
        <div>Recommended Battery (${(DISCHARGE * 100).toFixed(0)}% discharge)</div>
        <div id="battery-recommendations"></div>
    `;
    
    batteryContainer.appendChild(container);

    // Initialize battery recommendations
    recommendBattery();
}

function recommendBattery() {
    const maxVoltage = parseFloat(document.getElementById('max-voltage').textContent);
    const totalPower = parseFloat(document.getElementById('total-power').textContent);
    const requiredEnergy = parseFloat(document.getElementById('required-energy').textContent);
    const batteryRecommendations = document.getElementById('battery-recommendations');

    if (maxVoltage <= 0 || requiredEnergy <= 0 || totalPower <= 0) {
        batteryRecommendations.innerHTML = 'Please select devices, desired work time, and ensure power is calculated to get battery recommendations.';
        return;
    }

    let closestLowerVoltage = null;
    let closestHigherVoltage = null;

    for (const voltage of BATTERY_VOLTAGES) {
        const v = parseFloat(voltage);
        if (v < maxVoltage) {
            closestLowerVoltage = v;
        } else if (v > maxVoltage && (closestHigherVoltage === null || v < closestHigherVoltage)) {
            closestHigherVoltage = v;
        }
    }

    const recommendedCapacities = [];
    if (closestLowerVoltage === null) {
        recommendedCapacities.push('StepUp Invertor: No suitable lower voltage found');
    } else {
        const lowerCapacity = ceilToCell(requiredEnergy, closestLowerVoltage);
        const lowerCurrent = ((totalPower / closestLowerVoltage) / INVERTOR_EFFICIENCY).toFixed(2);
        recommendedCapacities.push(`StepUp Invertor: Battery ${closestLowerVoltage}V - ${lowerCurrent}A: ${lowerCapacity} mAh`);
    }

    if (BATTERY_VOLTAGES.includes(maxVoltage.toString())) {
        const exactCapacity = ceilToCell(requiredEnergy, maxVoltage);
        const exactCurrent = ((totalPower / maxVoltage) / INVERTOR_EFFICIENCY).toFixed(2);
        recommendedCapacities.push(`StepDown Invertor: Battery ${maxVoltage}V - ${exactCurrent}A: ${exactCapacity} mAh`);
    } else if (closestHigherVoltage !== null) {
        const higherCapacity = ceilToCell(requiredEnergy, closestHigherVoltage);
        const higherCurrent = ((totalPower / closestHigherVoltage) / INVERTOR_EFFICIENCY).toFixed(2);
        recommendedCapacities.push(`StepDown Invertor: Battery ${closestHigherVoltage}V - ${higherCurrent}A: ${higherCapacity} mAh`);
    } else {
        recommendedCapacities.push('StepDown Invertor: No suitable higher voltage found');
    }

    batteryRecommendations.innerHTML = recommendedCapacities.join('<br>');
}

function ceilToCell(requiredEnergy, voltage) {
    if (isNaN(voltage) || isNaN(requiredEnergy)) {
        return 0;
    }
    const capacity = (requiredEnergy / voltage) / DISCHARGE * 1000;
    return Math.ceil(capacity / 100) * 100;
}



createPowerContainer();
createRows(4);
createEnergyContainer();
createBatteryContainer();
