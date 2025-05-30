import { select, json } from "d3";

import { prefix, DEFAULT_SCALE, DEFAULT_BUCKETS } from "./constants";
import { getMapConfig, buildMapURL, buildSheetsURL, parseArr, floatOrNull, getSheetNames } from "./utils";
import { getContent, showContent, initDom, toggleLoading } from "./content";
import { removeDetails, initDetails } from "./map/details";
import { initTooltip, removeTooltip } from "./map/tooltip";
import { drawMap, initMap } from "./map";
import { initTable } from "./table";

let currentDataset;
let mapSelectorContainer;
let title;
let sheetKey;
let sheetNames = {};

const datasets = {};
const sheets = {};
const maps = {};
const mapKeys = {};

const fetchMap = map => json(buildMapURL(map)).then(geojson => (maps[map] = geojson));

const build = (tab, options, attempts) => {
  options = options || {};
  options.mapKey = mapKeys[tab];
  options.sheetKey = sheetKey;
  toggleLoading(true);
  if (!sheets[tab])
    return fetch(buildSheetsURL(sheetNames[tab - 1].properties.title, sheetKey))
      .then(resp => resp.json())
      // .then(resp => csv(resp.values.join("\n")))
      .then(response => {
        let data = parseArr(response)
        sheets[tab] = data;
        build(tab, options);
      });

  const map = maps[mapKeys[tab]];

  if (!map) {
    const attempt = attempts || 0;

    if (attempt < 2) {
      return setTimeout(() => build(tab, options, attempt + 1), 500);
    }
    console.error(
      `Map ${mapKeys[tab]} never loaded - are you sure this row is configured correctly?`
    );
    return;
  }

  toggleLoading(false);
  drawMap(sheets[tab], map, currentDataset, options);

  title.text(currentDataset.title);

  removeDetails();
  removeTooltip();
};

const updateClickInstructions = value => {
  select(`.${prefix}click-instructions`).text(
    `Click a ${value === "state" ? "state" : "district"} for details`
  );
};
const addStateAndDistrictToggle = (container, dataset, selected) => {
  const toggleContainer = select(container).select(`.${prefix}toggle`);
  toggleContainer.selectAll("*").remove();

  if (dataset.maps.length > 1) {
    toggleContainer
      .append("label")
      .attr("for", "toggle")
      .text("View by");

    const toggle = toggleContainer
      .append("select")
      .attr("name", "toggle")
      .on("change", () => {
        const selected = dataset[toggle.property("value")];
        currentDataset = selected;
        updateClickInstructions(toggle.property("value"));
        build(selected.tab);
      });

    // some datsets specify a year or session of congress, such as house-118. Let's simply show 'house'
    const splitDatasetName = x => x.split("-")[0];
    toggle
      .selectAll("option")
      .data(dataset.maps)
      .enter()
      .append("option")
      .attr("value", d => d.toLowerCase())
      .text(d => splitDatasetName(dataset[d].dataset));

    if (selected) toggle.property("value", selected);
  }
};

const addMapSelector = (container, data, firstKey) => {
  mapSelectorContainer = select(container).select(`.${prefix}selector`);

  mapSelectorContainer
    .append("label")
    .attr("for", "map-selector")
    .text("Issue");

  const mapSelector = mapSelectorContainer
    .append("select")
    .attr("name", "map-selector")
    .on("change", () => {
      const value = mapSelector.property("value");
      const selected = datasets[value];
      window.location.hash = value;
      currentDataset = selected;
      build(selected.defaultTab);
      addStateAndDistrictToggle(container, selected);
      showContent(selected.issuekey);
    });

  mapSelector
    .selectAll("option")
    .data(data)
    .enter()
    .append("option")
    .attr("value", d => d)
    .text(d => datasets[d].label);

  mapSelector.select(`option[value="${firstKey}]"`).attr("selected", true);
};


const initDataMap = (container) => {
  initDom(container);
  initMap(container);
  initTable(container);
  initDetails(container);
  initTooltip(container);

  title = select(container).select(`.${prefix}header`);

  const startMap = container.getAttribute("data-start-map") || "state";

  // Load the first map
  fetchMap(startMap);
  const loadedMaps = { [startMap]: true };

  // Get the Settings tab which lists all the datasets (other tabs) we'll later get
  fetch(buildSheetsURL(sheetNames[0].properties.title, sheetKey))
    .then(resp => resp.json())
    // .then(resp => csv(resp.values.join("\n")))
    .then(response => {
      let data = parseArr(response);
      data.forEach(dataset => {
        try {
          const key = dataset.title;
          let mapKey = dataset.dataset.replace(/\s/g, "-").toLowerCase();
          // const mapKeySuffix = dataset.suffix.repl.replace(/\s/g, "-").toLowerCase();
          // if (mapKeySuffix) {
          //   mapKey = mapKey + `-${mapKeySuffix}`
          // }

          if (!loadedMaps[mapKey]) {
            fetchMap(mapKey);
            loadedMaps[mapKey] = true;
          }

          dataset.scaleType = dataset.scale || DEFAULT_SCALE;
          dataset.buckets = Number(dataset.buckets) || DEFAULT_BUCKETS;
          dataset.issuekey = key

          if (!Object.prototype.hasOwnProperty.call(datasets, key)) {
            datasets[key] = {};
            datasets[key].label = dataset.label || dataset.issuelabel;
            datasets[key].title = dataset.title || `Support for ${datasets[key].label}`;
            datasets[key].defaultTab = dataset.tab;
            datasets[key].scaleType = dataset.scaleType;
            datasets[key].legendLabel = dataset.legendLabel || "Issue support";
            datasets[key].defaultMap = mapKey;
            datasets[key].issuekey = key;
            datasets[key].maps = [];
            datasets[key].tabs = [];
            datasets[key].buckets = Number(dataset.buckets) || DEFAULT_BUCKETS;
            if (dataset.max) datasets[key].max = floatOrNull(dataset.max);
            if (dataset.min) datasets[key].min = floatOrNull(dataset.min);
          }
          datasets[key][mapKey] = dataset;
          datasets[key].maps.push(mapKey);
          datasets[key].tabs.push(dataset.tab);
          mapKeys[dataset.tab] = mapKey;
        } catch (error) {
          console.error(
            `Could not import settings row ${dataset.title} ${dataset.content}, error:`
          );
          console.error(error);
        }
      });

      const {
        datasetKeys,
        firstKey,
        firstDataset,
        firstTab,
        firstMap,
        firstFilter,
        firstFeature
      } = getMapConfig(datasets, {
        startMap,
        startKey: container.getAttribute("data-start-key"),
        startFilter: container.getAttribute("data-start-filter"),
        startFeature: container.getAttribute("data-start-feature")
      });

      currentDataset = firstDataset;

      if (datasetKeys.length > 1) {
        addMapSelector(container, datasetKeys, firstKey);
      }
      if (Object.values(mapKeys).length > 1) {
        addStateAndDistrictToggle(container, firstDataset, firstMap);
      }

      build(firstTab, { firstFilter, firstFeature });
      updateClickInstructions(firstMap);
      getContent(currentDataset.issuekey, sheetKey, sheetNames);
    });
};


const init = (container) => {
  sheetKey = container ? container.getAttribute("data-spreadsheet-key") : null;

  var url = new URL(window.location);
  var searchParams = new URLSearchParams(url.search);
  let querySheetId = searchParams.get('sheet-id')

  // allow user to specify sheet in url params
  if (querySheetId) {
    let oldSheetKey = sheetKey
    sheetKey = querySheetId
    container.setAttribute("data-spreadsheet-key", querySheetId)
    setTimeout(() => {
      let textarea = document.getElementsByTagName('textarea')
      if (textarea[0]) {
        textarea[0].innerHTML = textarea[0].innerHTML.replace(oldSheetKey, sheetKey)
      }
    }, 100)
  }

  if (!sheetKey) {
    console.error("Cannot init maps without a key - set the data-spreadsheet-key attribute");
    return;
  }

  getSheetNames(sheetKey).then(results => {
    sheetNames = results;
    initDataMap(container)
  })
}


init(document.querySelector(".data-progress-maps"));
