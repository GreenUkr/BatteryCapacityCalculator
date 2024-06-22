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

    rows.forEach(row => {
        if (!row.classList.contains('total-row')) {
            const checkbox = row.querySelector('.device-checkbox');
            const powerField = row.querySelector('.power-field');
            const power = parseFloat(powerField.value);

            if (checkbox.checked && !isNaN(power)) {
                totalPower += power;
            }
        }
    });

    document.getElementById('total-power').value = totalPower.toFixed(2);
}
