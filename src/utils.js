import { sheetsBaseUrl, rootURL, stateLabels, API_KEY } from "./constants";

import { csvParse } from "d3"


export const parseArr = (data) => {
  let parsed = csvParse(data.values.map(a => a.join(',')).join('\n'))
  return parsed.map(row => relabelKeys(row))
}


export const getSheetNames = (sheetsID) => {
  return fetch(`${sheetsBaseUrl}/${sheetsID}?key=${API_KEY}&fields=sheets.properties.title`)
      .then(resp => resp.json())
      .then(resp => resp.sheets)
}

export const buildSheetsURL = (tab, sheetsID) =>
  process.env.LOCAL_DATA === "true"
    ? `${rootURL}/sheets/${sheetsID}/${tab}.json`
    : `${sheetsBaseUrl}/${sheetsID}/values/${tab}?key=${API_KEY}`;

export const buildMapURL = map => `${rootURL}${map}.json`;

export const parseRow = row => {
  // Takes a string and converts it into an object with keys for each column
  let last;
  return row.split(/, /).reduce((obj, el) => {
    const [label, ...values] = el.split(": ");
    if (values.length > 0) {
      obj[label] = values.join(": ").trim();
      last = label;
    } else {
      obj[last] += `, ${el}`;
    }
    return obj;
  }, {});
};

export const formatAsPercentage = value => {
  if (isNaN(value)) {
    return value;
  }
  let percentage = value <= 1 ? value * 100 : value;

  if(!percentage.toFixed) {
    return percentage
  }
  return `${percentage.toFixed(0)}%`;
};

export const parseStats = data => {
  const cleanStats = [];
  data.forEach(d => {
    const row = d
    row.label = row["Label"]
    row.fips = fipsOrString(d.Code); // Need to add the first column manually
    // delete row["Code"]
    // delete row["Label"]
    cleanStats.push(row);
  });
  return cleanStats;
};

export const floatOrNull = num => (isNaN(parseFloat(num)) ? null : parseFloat(num));
export const fipsOrString = fips => (isNaN(Number(fips)) ? fips : Number(fips));

export const makeLabel = text => {
  let formatted = text.replace(/-/g, " ");
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  return formatted;
};

export const formatQualitativeScale = (key, kind) => {
  const longLabels = {
    no: "No policy",
    yes_low: "Yes, but insufficient",
    yes_high: "Yes, and sufficient"
  };

  const shortLabels = {
    no: "No policy",
    yes_low: "Insufficient",
    yes_high: "Sufficient",
    proposed_low: "Insufficient",
    proposed_high: "Sufficient"
  };
  return kind === "short" ? shortLabels[key] : longLabels[key];
};

export const notNA = value => ["NA", "N/A"].indexOf(value) === -1;

export const getFullLabel = value => {
  if (value.search("_") > -1) {
    const parts = value.split("_");
    const state = stateLabels[parts[0]];
    const district = Number(parts[1]);
    return `${state} District ${district}`;
  }

  return stateLabels[value] || value;
};

export const getMapConfig = (datasets, { startKey, startMap, startFilter, startFeature }) => {
  const datasetKeys = Object.keys(datasets);

  const [hashKey, hashMap, hashFilter, hashFeature] = window.location.hash
    ? window.location.hash.split("#")[1].split(":")
    : [];

  const firstFeature = hashFeature || startFeature;

  if (datasetKeys.includes(hashKey)) {
    // If the hash matches a dataset and contains a map - return the map
    // If the hash matches a dataset without a map - return the defaults

    const hashedDataSet = datasets[hashKey];
    const hashedViewSet = datasets[hashKey][hashMap];

    return {
      datasetKeys,
      firstKey: hashKey,
      firstDataset: hashedDataSet,
      firstMap: hashedViewSet ? hashMap : hashedDataSet.defaultMap,
      firstTab: hashedViewSet ? hashedViewSet.tab : hashedDataSet.defaultTab,
      firstFilter: hashFilter,
      firstFeature
    };
  }

  const defaultKey = datasetKeys[0];
  const defaultDataSet = datasets[defaultKey];

  if (datasetKeys.includes(startKey) || defaultDataSet[startMap]) {
    // If the data attr matches a dataset and contains a map - return the map
    // If the data attr matches a dataset without a map - return the defaults

    const startDataSet = datasets[startKey] || defaultDataSet;
    const startViewSet = startDataSet[startMap];

    return {
      datasetKeys,
      firstKey: startKey,
      firstDataset: startDataSet,
      firstMap: startViewSet ? startMap : startDataSet.defaultMap,
      firstTab: startViewSet ? startViewSet.tab : startDataSet.defaultTab,
      firstFilter: startFilter,
      firstFeature
    };
  }

  return {
    datasetKeys,
    firstKey: defaultKey,
    firstDataset: defaultDataSet,
    firstMap: defaultDataSet.defaultMap,
    firstTab: defaultDataSet.defaultTab,
    firstFeature
  };
};

export const buildShareURL = shareState =>
  [
    document.location.toString().split("#")[0],
    [shareState.key, shareState.map, shareState.filter, shareState.feature].filter(e => e).join(":")
  ].join("#");

export const buildEmbedCode = shareState => {
  const embedDiv = document.createElement('div');
  embedDiv.className = "data-progress-maps"

  embedDiv.setAttribute('data-spreadsheet-key', shareState.sheetKey)
  if( shareState.key ) embedDiv.setAttribute('data-start-key', shareState.key)
  if( shareState.map ) embedDiv.setAttribute('data-start-map', shareState.map)
  if( shareState.filter ) embedDiv.setAttribute('data-start-filter', shareState.filter)
  if( shareState.feature ) embedDiv.setAttribute('data-start-feature', shareState.feature)

  const embedScript = [
    '<script>!function(d,w){if(!w.dfpMap){w.dfpMap="init";',
    'var i=d.createElement("script"),s=d.createElement("link");',
    'i.setAttribute("src","https://dataforprogress.github.io',
    '/data-maps/src/index.js"),s.setAttribute("href",',
    '"https://dataforprogress.github.io/data-maps/styles/style.css"),',
    's.setAttribute("rel","stylesheet"), s.setAttribute("type","text/css")',
    ',d.head.appendChild(i),d.head.appendChild(s)}}(document,window);</script>'
  ].join('')


  return `${embedDiv.outerHTML}${embedScript}`
}


const RENAMED_KEYS = {
  "Buckets": "buckets",
  "Dataset": "dataset",
  "Issue": "issue",
  "Issue label": "issuelabel",
  "Legend label": "legendLabel",
  "Max": "max",
  "Min": "min",
  "Neutral Midpoint": "neutralMidpoint",
  "Scale": "scale",
  "Tab": "tab",
  "Title": "title",
  "buckets": "buckets",
  "issueKey": "issuekey",
  "scaleType": "scaleType",
  "Content": "content"
}
export const relabelKeys = (obj) => {
  return Object.keys(obj).reduce((new_obj, key) => {
    return { 
      ...new_obj,
      [RENAMED_KEYS[key] ? RENAMED_KEYS[key] : key]: obj[key],
    }
  }, {})
}