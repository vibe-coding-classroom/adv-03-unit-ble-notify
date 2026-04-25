# Performance Analysis: BLE Notify Efficiency

This report tracks the efficiency gains from switching to an event-driven "Push" (Notify) model with adaptive thresholds.

## 1. Baseline: Polling (Read)
*Expected packet rate if we polled at 100ms: 600 packets/min.*

## 2. Experiment: Adaptive Trigger (Notify)
Measure the number of notifications sent over 60 seconds with different thresholds.

| Threshold | Notifications (per min) | Traffic Reduction (%) | Notes |
|-----------|-------------------------|-----------------------|-------|
| 0 (Push All)|                       | 0%                    | Maximum responsiveness |
| 5         |                         |                       | Recommended balance |
| 10        |                         |                       | High efficiency |
| 20        |                         |                       | Low power mode |

## 3. MTU Fragmentation Observations
*Observe the Buffer Manager in the dashboard.*

- **MTU Size Used**: ___ bytes
- **Fragmentation Triggered?**: [Yes / No]
- **Robustness Check**: What happens if you disconnect mid-packet?
  - *Observation*: 

## 4. Conclusion
*Summarize the relationship between threshold and battery life/bandwidth.*
