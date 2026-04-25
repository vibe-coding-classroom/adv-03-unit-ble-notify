/**
 * ADV-03 BLE Notify - Frontend Logic
 * Handles connection and characteristic subscription.
 */

const CONFIG = {
    SERVICE_UUID: '4fafc201-1fb5-459e-8fcc-c5c9c331914b', // Generic Service
    CHARACTERISTIC_UUID: 'beb5483e-36e1-4688-b7f5-ea07361b26a8' // Notify Chara
};

const UI = {
    connectBtn: document.getElementById('connect-btn'),
    status: document.getElementById('status'),
    sensorVal: document.getElementById('sensor-val'),
    packetCount: document.getElementById('packet-count'),
    deviceInfo: document.getElementById('device-info'),
    terminal: document.getElementById('terminal')
};

let bluetoothDevice = null;
let notificationCount = 0;

function log(message, type = 'info') {
    const line = document.createElement('div');
    line.className = `console-line ${type}`;
    line.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
    UI.terminal.appendChild(line);
    UI.terminal.scrollTop = UI.terminal.scrollHeight;
}

async function onConnect() {
    try {
        log('Requesting Bluetooth Device...', 'info');
        bluetoothDevice = await navigator.bluetooth.requestDevice({
            filters: [{ services: [CONFIG.SERVICE_UUID] }]
        });

        log(`Connecting to ${bluetoothDevice.name}...`);
        const server = await bluetoothDevice.gatt.connect();

        log('Getting Service...');
        const service = await server.getPrimaryService(CONFIG.SERVICE_UUID);

        log('Getting Characteristic...');
        const characteristic = await service.getCharacteristic(CONFIG.CHARACTERISTIC_UUID);

        // TODO: Start Notifications
        log('Starting Notifications...');
        await characteristic.startNotifications();

        log('Notifications started successfully!', 'success');
        
        // Setup listener
        characteristic.addEventListener('characteristicvaluechanged', handleNotifications);

        UI.status.textContent = 'Connected';
        UI.status.classList.add('connected');
        UI.connectBtn.textContent = 'Disconnect';
        UI.deviceInfo.textContent = `Connected to: ${bluetoothDevice.name}`;

    } catch (error) {
        log(`Error: ${error}`, 'warning');
        console.error(error);
    }
}

function handleNotifications(event) {
    const value = event.target.value;
    
    // Increment packet counter
    notificationCount++;
    UI.packetCount.textContent = notificationCount;

    // Use BufferManager to handle data (could be fragmented)
    if (window.BufferManager) {
        window.BufferManager.push(value);
    } else {
        // Fallback for simple data
        const uint8 = new Uint8Array(value.buffer);
        const text = new TextDecoder().decode(uint8);
        UI.sensorVal.textContent = text;
        log(`Received: ${text}`, 'info');
    }
}

UI.connectBtn.addEventListener('click', () => {
    if (bluetoothDevice && bluetoothDevice.gatt.connected) {
        bluetoothDevice.gatt.disconnect();
        UI.status.textContent = 'Disconnected';
        UI.status.classList.remove('connected');
        UI.connectBtn.textContent = 'Connect to ESP32';
        log('Disconnected.', 'warning');
    } else {
        onConnect();
    }
});
