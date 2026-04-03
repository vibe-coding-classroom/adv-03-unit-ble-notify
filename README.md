Viewed adv-03-unit-ble-notify.html:1-387

針對 **`adv-03-unit-ble-notify` (BLE Notify 機制深論：「拉」到「推」)** 單元，這是一個從「主動詢問」進化到「事件驅動 (Event-Driven)」的關鍵課程，對於開發低延遲、省電的 IoT 系統至關重要。

以下是在 **GitHub Classroom** 部署其作業 (Assignments) 的具體建議：

### 1. 範本倉庫 (Template Repo) 配置建議
Notify 的開發需要「訂閱」與「監聽」的精準配合，建議範本包含：
*   **📂 `src/notify-listener.js`**：前端 JS 檔案，提供 Web Bluetooth 的連線骨架，重點留下 `characteristic.startNotifications()` 與事件監聽器的 `TODO` 區塊。
*   **📂 `firmware/sensor-notify.ino`**：ESP32 韌體程式碼，預置模擬感測器讀取邏輯，並預留 `notify()` 觸發條件的實作空間。
*   **📂 `docs/performance_stats.csv`**：效能紀錄表。學員需填入在不同閾值 (Threshold) 設定下，一分鐘內產生的封包總數，這能讓學員直觀感受「流量優化」的效果。
*   **📂 `tests/event_check.test.js`**：單元測試腳本。模擬 BLENotify 事件，驗證前端是否能正確解析 `DataView`（例如：位元組偏移量是否計算正確）。

---

### 2. 作業任務部署細節

#### 任務 1：心跳偵測系統 (Heartbeat Notify Lab)
*   **目標**：成功建立 CCCD 訂閱機制，掌握事件觸發流程。
*   **Classroom 部署建議**：
    *   **驗證方式**：學員需實作網頁端的異步訂閱邏輯。導師應檢查代碼中是否包含了正確的事件移除處理（防止記憶體洩漏）。
    *   **Autograding**：透過自動化測試檢測網頁是否發出了 `startNotifications` 請求。

#### 任務 2：變動觸發優化 (Adaptive Trigger Lab)
*   **目標**：利用數學規律降低通訊開銷，落實「數據即資源」的環保通訊思維。
*   **Classroom 部署建議**：
    *   **核心代碼檢核**：
        ```cpp
        // 學生需實作：僅在數值位移超過 5 的時候才調用 Notify
        if (abs(currentVal - lastSentVal) > 5) {
            characteristic->setValue(currentVal);
            characteristic->notify();
            lastSentVal = currentVal;
        }
        ```
    *   **數據提交**：學員需在 `performance_stats.csv` 中提交對比數據，證明在靜止狀態下，優化後的封包量比定時 Read 降低了 80% 以上。

#### 任務 3：大數據分段與流控 (MTU Fragmentation Lab)
*   **目標**：突破物理載體限制，實現原子化的 JSON 推送。
*   **Classroom 部署建議**：
    *   **重組邏輯檢核**：學員需在前端 JS 實作 Buffer 緩衝區。導師點評重點在於「終止符處理」：當收到含有 `\n` 的片段時，是否能正確觸發 `JSON.parse`？
    *   **魯棒性驗證**：要求學員實作一個 **Try-Catch** 機制，當接收到「不完整或錯誤」的推送數據時，系統應能自動清空 Buffer 重新等待，而不是直接讓網頁當機。

---

### 3. 事件驅動導師點評標準 (Event-Driven Benchmarks)
此單元的價值在於 **「對通訊效率與系統魯棒性的權衡」**：
*   [ ] **非對稱更新處理**：前端 UI 是否能流暢反應突發的高頻通知（如：馬達全速轉動時的編碼器回傳）而不產生渲染卡頓？
*   [ ] **訂閱握手嚴謹度**：代碼中是否判斷了 `characteristic.properties.notify` 屬性？（這展現了專業庫的開發思維）。
*   [ ] **邊界安全檢查**：對於超過 MTU 的 JSON 片段，重組邏輯是否考慮了連線突然中斷後 Buffer 的自動清除機制？

### 📁 推薦範本結構 (GitHub Classroom Template)：
```text
.
├── src/
│   ├── ble_app.js          # 前端：訂閱與 characteristicvaluechanged 監聽
│   └── buffer_manager.js   # 核心：處理長數據分段重組
├── firmware/
│   └── sensor_threshold.ino # 韌體：實作變動觸發邏輯
├── docs/
│   └── traffic_results.md  # 報告：不同閾值下的封包負載分析
└── README.md               # 專案心得：從 Poll 到 Push，我學到了什麼
```

透過這種部署方式，學生能體驗到 **「從被動到主動」** 的開發邏輯轉變。這對於開發穿戴式裝置、無人機即時反饋系統等高效能物聯網應用是不可或缺的頂層技術能力。_
