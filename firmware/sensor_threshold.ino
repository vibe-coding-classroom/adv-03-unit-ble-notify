/**
 * ADV-03 BLE Notify - Adaptive Trigger Lab
 * Goal: Only push data when changes exceed a threshold.
 */

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>
#include <BLE2902.h>

#define SERVICE_UUID        "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHARACTERISTIC_UUID "beb5483e-36e1-4688-b7f5-ea07361b26a8"

BLEServer* pServer = NULL;
BLECharacteristic* pCharacteristic = NULL;
bool deviceConnected = false;
int lastSentVal = 0;
int threshold = 5; // TODO: Experiment with this value

class MyServerCallbacks: public BLEServerCallbacks {
    void onConnect(BLEServer* pServer) {
      deviceConnected = true;
    };

    void onDisconnect(BLEServer* pServer) {
      deviceConnected = false;
    }
};

void setup() {
  Serial.begin(115200);

  // Create the BLE Device
  BLEDevice::init("ESP32-Notify-Lab");

  // Create the BLE Server
  pServer = BLEDevice::createServer();
  pServer->setCallbacks(new MyServerCallbacks());

  // Create the BLE Service
  BLEService *pService = pServer->createService(SERVICE_UUID);

  // Create a BLE Characteristic
  pCharacteristic = pService->createCharacteristic(
                      CHARACTERISTIC_UUID,
                      BLECharacteristic::PROPERTY_READ   |
                      BLECharacteristic::PROPERTY_WRITE  |
                      BLECharacteristic::PROPERTY_NOTIFY |
                      BLECharacteristic::PROPERTY_INDICATE
                    );

  // Add CCCD (Client Characteristic Configuration Descriptor)
  pCharacteristic->addDescriptor(new BLE2902());

  // Start the service
  pService->start();

  // Start advertising
  BLEAdvertising *pAdvertising = BLEDevice::getAdvertising();
  pAdvertising->addServiceUUID(SERVICE_UUID);
  pAdvertising->setScanResponse(false);
  pAdvertising->setMinPreferred(0x06);  // functions that help with iPhone connections issues
  pAdvertising->setMinPreferred(0x12);
  BLEDevice::startAdvertising();
  Serial.println("Waiting a client connection to notify...");
}

void loop() {
    if (deviceConnected) {
        // Simulate a sensor reading (0-100)
        int currentVal = random(0, 100);

        // --- TASK 2: Adaptive Trigger Implementation ---
        // TODO: Only notify when the difference is greater than 'threshold'
        // This reduces radio power consumption and network congestion.
        
        if (abs(currentVal - lastSentVal) > threshold) {
            String jsonPayload = "{\"val\":" + String(currentVal) + "}\n";
            pCharacteristic->setValue(jsonPayload.c_str());
            pCharacteristic->notify();
            
            Serial.print("Notify Sent: ");
            Serial.println(jsonPayload);
            
            lastSentVal = currentVal;
        }

        delay(100); // Fast polling for local logic, but slow radio output
    }
    
    // disconnecting
    if (!deviceConnected && lastSentVal != -1) {
        delay(500); // give the bluetooth stack the chance to get things ready
        pServer->startAdvertising(); // restart advertising
        Serial.println("start advertising");
        lastSentVal = -1;
    }
    
    // connecting
    if (deviceConnected && lastSentVal == -1) {
        // do stuff here on connecting
        lastSentVal = 0;
    }
}
