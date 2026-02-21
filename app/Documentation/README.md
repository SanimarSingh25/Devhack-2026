# Pothole Detector

> The pothole detector tells you where potholes are on the road using 

```mermaid
flowchart
    subgraph FRONT END

        MAP[MAP
        Heat Maps]
        REPORTS[REPORTS]
    end

    subgraph BACK END
        PROCESSING
    end

    MAP --> PROCESSING
    REPORTS --> PROCESSING
```