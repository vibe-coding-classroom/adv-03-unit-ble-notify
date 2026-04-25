/**
 * ADV-03 Buffer Manager
 * Handles reassembly of fragmented JSON payloads sent via BLE Notify.
 */

window.BufferManager = {
    buffer: "",
    maxBufferSize: 1024,
    
    UI: {
        bar: document.getElementById('buffer-bar'),
        status: document.getElementById('buffer-status'),
        mtu: document.getElementById('mtu-usage'),
        json: document.getElementById('last-json'),
        sensor: document.getElementById('sensor-val')
    },

    push(dataView) {
        const decoder = new TextDecoder();
        const chunk = decoder.decode(dataView);
        
        // Append to buffer
        this.buffer += chunk;
        
        // Update UI
        this.updateUI();

        // Check for terminator (e.g., newline or closing brace if we expect single JSON)
        // In this lab, we assume '\n' marks the end of a full JSON packet
        if (this.buffer.includes('\n')) {
            this.process();
        }

        // Safety: Prevent memory leak if buffer grows too large without terminator
        if (this.buffer.length > this.maxBufferSize) {
            console.warn("Buffer overflow, clearing...");
            this.clear();
        }
    },

    process() {
        const parts = this.buffer.split('\n');
        
        // The last part might be incomplete, keep it in the buffer
        this.buffer = parts.pop();

        for (const part of parts) {
            if (part.trim() === "") continue;
            
            try {
                const data = JSON.parse(part);
                this.handleParsedData(data);
            } catch (e) {
                console.error("Failed to parse JSON segment:", part);
                this.UI.status.textContent = "Parse Error";
                this.UI.status.style.color = "var(--warning)";
            }
        }
        
        this.updateUI();
    },

    handleParsedData(data) {
        // Update UI with parsed data
        if (data.val !== undefined) {
            this.UI.sensor.textContent = data.val;
        }
        
        this.UI.json.textContent = JSON.stringify(data);
        this.UI.status.textContent = "Packet Reassembled";
        this.UI.status.style.color = "var(--success)";
    },

    updateUI() {
        const percentage = Math.min((this.buffer.length / this.maxBufferSize) * 100, 100);
        this.UI.bar.style.width = `${percentage}%`;
        this.UI.mtu.textContent = `${this.buffer.length} / ${this.maxBufferSize} bytes`;
    },

    clear() {
        this.buffer = "";
        this.updateUI();
    }
};
