// Constants section
const VOLTAGES = ["5", "9", "12", "19", "24", "36", "48", "56"];
const CURRENTS = ["0.5", "1.0", "1.5", "2.0", "2.5", "3.0", "3.5", "4.0", "4.5", "5.0"];
const HOURS = ["1", "2", "4", "6", "8", "12", "16", "24"];
const BATTERY_VOLTAGES = ["6", "12", "24", "48"];
const DISCHARGE = 0.8;
const INVERTER_EFFICIENCY = 0.9;
const ROWS_IN_POWER_GRID = 5;

function createSelectOptions(options) {
    return options.map(option => `<option value="${option}">${option}</option>`).join('');
}

const voltageOptions = createSelectOptions(VOLTAGES);
const currentOptions = createSelectOptions(CURRENTS);
const hoursOptions = createSelectOptions(HOURS);
// End constants section

// Power grid section
function createPowerContainer() {
    const powerContainer = document.getElementById('power-container');
  
    const fragment = document.createDocumentFragment();

    fragment.appendChild(createPowerInfo());

    fragment.appendChild(createHeaderRow());
    
    const rowsContainer = document.createElement('div');
    rowsContainer.id = 'rows-container';
    fragment.appendChild(rowsContainer);
    
    fragment.appendChild(createTotalRow());
    
    powerContainer.appendChild(fragment);
}

function createPowerInfo() {
    const powerInfo = document.createElement('div');
    powerInfo.className = 'power-info';
    powerInfo.id = `power-usage-info`;

    powerInfo.innerHTML = `
        <p><span class="info-bold">How to Use the Grid:</span></p>
        <p>1. <span class="info-bold">Select Voltage and Current:</span> 
        Choose the voltage and current ratings of your devices.</p> 
        <p>2. <span class="info-bold">Check Devices for Calculation:</span> 
        Select the devices you want to include in the calculations. 
        Only checked devices will be used to update the Max Voltage and Total Power.</p>
        <p>3. <span class="info-bold">Unchecking Removes from Calculation:</span> 
        Unchecking a device will exclude it 
        from the calculations, even if voltage and current are selected.</p>
        <p>4. <span class="info-bold">Recalculate on Voltage/Current Change:</span> 
        If you change the voltage or current values for checked devices, 
        the Max Voltage and Total Power will be automatically recalculated.</p>
        <p>5. <span class="info-bold">Select Desired Operating Time:</span> 
        Enter the desired operating time (in hours) for your devices. 
        This will update the Desired Energy and Battery Recommendations.</p>
        <p>6. <span class="info-bold">Recalculate on Time Change:</span> 
        Changing the desired operating time will automatically update 
        the Desired Energy and Battery Recommendations.</p>
    `;

    return powerInfo;
}

function createHeaderRow() {
    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = [
        'Devices', 'Voltage (V)', 'Current (A)', 'Power (W)'
    ].map(text => `<div>${text}</div>`).join('');
    return header;
}

function createDevicesRows(numberOfRows) {
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
            updateEnergy(); // Add this line
        }
    });
}

function createRow(rowNumber) {
    const row = document.createElement('div');
    row.className = 'row';
    row.id = `row${rowNumber}`;

    row.innerHTML = `
        <div>Device ${rowNumber} <input type="checkbox" id="device${rowNumber}" class="device-checkbox"></div>
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
        <select id="${type}-select-${rowNumber}" class="${type}-select">
            <option value="">---</option>
            ${options}
        </select> ${type === 'voltage' ? 'V' : 'A'}
    `;
}

function createTotalRow() {
    const totalRow = document.createElement('div');
    totalRow.className = 'row total-row';
    totalRow.innerHTML = `
        <div>Devices in use: <span id="devices-in-use">0</span></div>
        <div>Max voltage: <span id="max-voltage">0</span> V</div>
        <div></div>
        <div>Total power: <span id="total-power">0</span> W</div>
    `;
    return totalRow;
}

function updatePower(rowNumber) {
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

function updateDevicesInUse() {
    const checkboxes = document.querySelectorAll('.device-checkbox');
    const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    document.getElementById('devices-in-use').textContent = checkedCount;
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
    updateBatteryRecommendations(); // Add this line
}
// End Power grid section

// Energy grid section
function createEnergyContainer() {
    const energyContainer = document.getElementById('energy-container');
    const container = document.createElement('div');
    container.className = 'energy-container';
    
    container.innerHTML = `
        <div>
            <label for="desired-time">Desired time to work is </label>
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

    energyContainer.appendChild(container);

    // Add event listener for the select
    document.getElementById('desired-time').addEventListener('change', updateEnergy);
}

function updateEnergy() {
    const desiredTimeSelect = document.getElementById('desired-time');
    const requiredEnergySpan = document.getElementById('required-energy');
    
    const desiredTime = parseFloat(desiredTimeSelect.value) || 0;
    const totalPower = parseFloat(document.getElementById('total-power').textContent) || 0;
    
    if (desiredTime > 0 && totalPower > 0) {
        const requiredEnergy = totalPower * desiredTime;
        requiredEnergySpan.textContent = requiredEnergy.toFixed(2);
        // updateBatteryRecommendations(); // Add this line
    } else {
        requiredEnergySpan.textContent = '0';
    }
    updateBatteryRecommendations(); // Add this line
}
// End Energy grid section

// Battery grid section
function createBatteryContainer() {
    const batteryContainer = document.getElementById('battery-container');
    const container = document.createElement('div');
    container.className = 'battery-container';
    
    container.innerHTML = `
        <div class="battery-header">
            Recommended Battery
            <span class="battery-note">
                (${(DISCHARGE * 100).toFixed(0)}% discharge, Inverter Efficiency ${(INVERTER_EFFICIENCY * 100).toFixed(0)}%)
            </span>
        </div>
        <div id="battery-recommendations"></div>
    `;
    
    batteryContainer.appendChild(container);

    // Initialize battery recommendations
    updateBatteryRecommendations();
}

function updateBatteryRecommendations() {
    const maxVoltage = parseFloat(document.getElementById('max-voltage').textContent);
    const totalPower = parseFloat(document.getElementById('total-power').textContent);
    const requiredEnergy = parseFloat(document.getElementById('required-energy').textContent);
    const batteryRecommendations = document.getElementById('battery-recommendations');

    if (maxVoltage <= 0 || requiredEnergy <= 0 || totalPower <= 0) {
        batteryRecommendations.innerHTML = `
            <span class="battery-warning">
                Please select devices, desired work time, and ensure total power \
                is calculated to get battery recommendations.
            </span>
        `;
        return;
    }

    const { lowerVoltageCapacity, higherVoltageCapacity } = updateBattery(maxVoltage, totalPower, requiredEnergy);

    batteryRecommendations.innerHTML = `
        <div class="battery-grid">
            <!-- <div class="grid-header">Type</div>
            <div class="grid-header">Voltage</div>
            <div class="grid-header">Current</div>
            <div class="grid-header">Capacity</div>
            
            <div class="grid-header">Type</div>
            <div class="grid-header">V</div>
            <div class="grid-header">A</div>
            <div class="grid-header">mAh</div>
            -->
            <div>Up</div>
            ${lowerVoltageCapacity ? `
                <div>${lowerVoltageCapacity.voltage}V</div>
                <div>${lowerVoltageCapacity.current}A</div>
                <div class="battery-capacity">${lowerVoltageCapacity.capacity}mAh</div>
            ` : `
                <div class="span-3">No suitable lower voltage found</div>
            `}

            <div>Down</div>
            ${higherVoltageCapacity ? `
                <div>${higherVoltageCapacity.voltage}V</div>
                <div>${higherVoltageCapacity.current}A</div>
                <div class="battery-capacity">${higherVoltageCapacity.capacity}mAh</div>
            ` : `
                <div class="span-3">No suitable higher voltage found</div>
            `}
        </div>
    `;
}

function updateBattery(maxVoltage, totalPower, requiredEnergy) {
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

    let lowerVoltageCapacity = null;
    let higherVoltageCapacity = null;

    if (closestLowerVoltage !== null) {
        const lowerCapacity = ceilToCell(requiredEnergy, closestLowerVoltage);
        const lowerCurrent = (totalPower / (closestLowerVoltage * INVERTER_EFFICIENCY)).toFixed(2);
        lowerVoltageCapacity = {
            voltage: closestLowerVoltage,
            current: lowerCurrent,
            capacity: lowerCapacity
        };
    }

    if (BATTERY_VOLTAGES.includes(maxVoltage.toString())) {
        const exactCapacity = ceilToCell(requiredEnergy, maxVoltage);
        const exactCurrent = (totalPower / (maxVoltage * INVERTER_EFFICIENCY)).toFixed(2);
        higherVoltageCapacity = {
            voltage: maxVoltage,
            current: exactCurrent,
            capacity: exactCapacity
        };
    } else if (closestHigherVoltage !== null) {
        const higherCapacity = ceilToCell(requiredEnergy, closestHigherVoltage);
        const higherCurrent = (totalPower / (closestHigherVoltage * INVERTER_EFFICIENCY)).toFixed(2);
        higherVoltageCapacity = {
            voltage: closestHigherVoltage,
            current: higherCurrent,
            capacity: higherCapacity
        };
    }

    return { lowerVoltageCapacity, higherVoltageCapacity };
}

/**
 * Calculates the capacity in mAh based on the required energy and battery voltage.
 *
 * @param {number} requiredEnergy - The amount of required energy.
 * @param {number} batteryVoltage - The voltage of the battery.
 * @return {number} The calculated capacity in mAh.
 */
function ceilToCell(requiredEnergy, batteryVoltage) {
    if (typeof requiredEnergy !== 'number' || typeof batteryVoltage !== 'number') {
      return 0;
    }
    const capacity = requiredEnergy / (batteryVoltage * DISCHARGE) * 1000; // Capacity in mAh
    return Math.ceil(capacity / 100) * 100;
}
// End Battery grid section
  
createPowerContainer();
createDevicesRows(ROWS_IN_POWER_GRID);
createEnergyContainer();
createBatteryContainer();
