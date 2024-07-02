const VOLTAGES = ["5", "9", "12"];
const CURRENTS = ["0.5", "1.0", "1.5"];
const HOURS = ["4", "6", "8", "12", "16", "24"];

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
}

// Create rows and capacity container dynamically
createRows(4); // You can change the number of rows here
createCapacityContainer(); // Create the capacity container
