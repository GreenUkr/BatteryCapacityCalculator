const VOLTAGES = ["5", "9", "12"];
const CURRENTS = ["0.5", "1.0", "1.5"];
const HOURS = ["4", "6", "8", "12", "16", "24"];
const BATTERY_VOLTAGES = ["6", "12", "24", "48"];

function createSelectOptions(options) {
    return options.map(option => `<option value="${option}">${option}</option>`).join('');
}

const voltageOptions = createSelectOptions(VOLTAGES);
const currentOptions = createSelectOptions(CURRENTS);
const hoursOptions = createSelectOptions(HOURS);

function createRows(numberOfRows) {
    const rowsContainer = document.getElementById('rows-container');
    for (let i = 1; i <= numberOfRows; i++) {
        const row = document.createElement('div');
        row.classList.add('row');
        row.id = `row${i}`;

        row.innerHTML = `
            <div>Device ${i}</div>
            <div><input type="checkbox" class="device-checkbox" onchange="updateTotalPower()"></div>
            <div>
                <select class="voltage-select">
                    <option value="">---</option>
                    ${voltageOptions}
                </select> V
            </div>
            <div>
                <select class="current-select">
                    <option value="">---</option>
                    ${currentOptions}
                </select> A
            </div>
            <div><button onclick="calculatePower(${i})">Calculate</button></div>
            <div><input type="text" class="power-field" readonly> W</div>
        `;

        rowsContainer.appendChild(row);
    }
}

function createCapacityContainer() {
    const capacityContainer = document.getElementById('capacity-container');
    const container = document.createElement('div');
    container.classList.add('capacity-container');
    
    container.innerHTML = `
        <div>Desired time to work</div>
        <div>
            <select id="desired-time" onchange="calculateCapacity()">
                <option value="">---</option>
                ${hoursOptions}
            </select> Hours
        </div>
        <div>Need Capacity</div>
        <div><input type="text" id="required-capacity" readonly> Wh</div>
    `;

    capacityContainer.appendChild(container);
}

function createBatteryContainer() {
    const batteryContainer = document.getElementById('battery-container');
    const container = document.createElement('div');
    container.classList.add('battery-container');
    
    container.innerHTML = `
        <div>Recommended Battery</div>
        <div id="battery-recommendations"></div>
    `;

    batteryContainer.appendChild(container);
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

function updateTotalPower() {
    const rows = document.querySelectorAll('.row');
    let totalPower = 0;
    let maxVoltage = 0;

    rows.forEach(row => {
        if (!row.classList.contains('total-row')) {
            const checkbox = row.querySelector('.device-checkbox');
            const voltageSelect = row.querySelector('.voltage-select');
            const powerField = row.querySelector('.power-field');
            const power = parseFloat(powerField.value);
            const voltage = parseFloat(voltageSelect.value);

            if (checkbox.checked) {
                if (!isNaN(power)) {
                    totalPower += power;
                }
                if (!isNaN(voltage) && voltage > maxVoltage) {
                    maxVoltage = voltage;
                }
            }
        }
    });

    document.getElementById('total-power').value = totalPower.toFixed(2);
    document.getElementById('max-voltage').value = maxVoltage ? `${maxVoltage} V` : '';
    calculateCapacity(); // Update capacity whenever total power is updated
    recommendBattery(); // Update battery recommendation whenever total power is updated
}

function calculateCapacity() {
    const totalPower = parseFloat(document.getElementById('total-power').value);
    const desiredTimeSelect = document.getElementById('desired-time');
    const desiredTime = parseFloat(desiredTimeSelect.value);

    const requiredCapacityField = document.getElementById('required-capacity');

    if (isNaN(totalPower) || isNaN(desiredTime)) {
        requiredCapacityField.value = '';
        return;
    }

    const requiredCapacity = totalPower * desiredTime;
    requiredCapacityField.value = requiredCapacity.toFixed(2);
    recommendBattery(); // Update battery recommendation whenever capacity is calculated
}

function recommendBattery() {
    const maxVoltage = parseFloat(document.getElementById('max-voltage').value);
    const requiredCapacity = parseFloat(document.getElementById('required-capacity').value);
    const batteryRecommendations = document.getElementById('battery-recommendations');

    if (isNaN(maxVoltage) || isNaN(requiredCapacity)) {
        batteryRecommendations.innerHTML = '';
        return;
    }

    let lowerVoltage = null;
    let higherVoltage = null;

    for (const voltage of BATTERY_VOLTAGES) {
        const v = parseFloat(voltage);
        if (v <= maxVoltage) {
            lowerVoltage = v;
        }
        if (v > maxVoltage && higherVoltage === null) {
            higherVoltage = v;
        }
    }

    const recommendedCapacities = [];
    if (lowerVoltage !== null) {
        const lowerCapacity = Math.ceil((requiredCapacity / lowerVoltage) * 1.25 * 1000);
        recommendedCapacities.push(`Battery ${lowerVoltage}V: ${lowerCapacity} mAh`);
    }
    if (higherVoltage !== null) {
        const higherCapacity = Math.ceil((requiredCapacity / higherVoltage) * 1.25 * 1000);
        recommendedCapacities.push(`Battery ${higherVoltage}V: ${higherCapacity} mAh`);
    }

    batteryRecommendations.innerHTML = recommendedCapacities.join('<br>');
}

// Create rows, capacity container, and battery container dynamically
createRows(4); // You can change the number of rows here
createCapacityContainer(); // Create the capacity container
createBatteryContainer(); // Create the battery container
