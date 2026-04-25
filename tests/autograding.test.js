/**
 * @jest-environment jsdom
 */

// Mock UI elements needed by buffer_manager.js
document.body.innerHTML = `
    <div id="buffer-bar"></div>
    <div id="buffer-status"></div>
    <div id="mtu-usage"></div>
    <div id="last-json"></div>
    <div id="sensor-val"></div>
`;

// Mock TextDecoder since it might not be in JSDOM
global.TextDecoder = class {
    decode(view) {
        return String.fromCharCode.apply(null, new Uint8Array(view.buffer || view));
    }
};

// Require the logic to test
require('../src/buffer_manager.js');

describe('BLE Notify Autograding', () => {
    
    test('BufferManager should correctly reassemble fragmented JSON', () => {
        const manager = window.BufferManager;
        const chunk1 = new TextEncoder().encode('{"val":4').buffer;
        const chunk2 = new TextEncoder().encode('2}\n').buffer;

        manager.push(chunk1);
        expect(manager.buffer).toBe('{"val":4');
        
        manager.push(chunk2);
        
        // After chunk2, the buffer should have been processed (split by \n)
        // and parts of it moved to handleParsedData. 
        // Based on implementation, buffer will hold the remainder after split.
        expect(manager.UI.sensor.textContent).toBe('42');
        expect(manager.UI.status.textContent).toBe('Packet Reassembled');
    });

    test('BufferManager should handle multiple packets in one push', () => {
        const manager = window.BufferManager;
        manager.clear();
        
        const multiPacket = new TextEncoder().encode('{"val":10}\n{"val":20}\n').buffer;
        manager.push(multiPacket);
        
        expect(manager.UI.sensor.textContent).toBe('20');
        expect(JSON.parse(manager.UI.json.textContent).val).toBe(20);
    });

    test('BufferManager should clear on overflow', () => {
        const manager = window.BufferManager;
        manager.clear();
        manager.maxBufferSize = 10;
        
        const longData = new TextEncoder().encode('12345678901').buffer;
        manager.push(longData);
        
        expect(manager.buffer).toBe("");
    });
});
