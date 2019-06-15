# Akan SVC experiment
For LING245B Spring 2019 class

To use it locally, without forgetting to initialize git submodule for
`videojs-markers` plugin:
```
git clone --recursive  https://github.com/Temigo/akan_svc.git
```

Uses VideoJS library to play the videos.

### Experiment materials
The materials are in `data/` folder. The list of sentences and descriptions,
as well as filler questions, are at the end of `js/index.js`.

The anonymized data that was collected is in `data.RData` and the analysis
script is in `analysis.R`.

### Backend
The backend code uses Flask and is in `twi.cgi` and `twi.py`.

### Debug mode
To run in "debug" mode (without recording results in the backend) change the value
of `exp.record` to `false` in `js/index.js`.

### Reference
Cole, Douglas James. "Lao serial verb constructions and their event representations." (2016).
