import * as d3 from "d3";
import * as topojson from "topojson";

import { parseStats, makeLabel } from "../utils";
import createTable from "../table";
import { defaultFilter, prefix } from "../constants";
import { addTooltip } from "./tooltip";
import buildLegend from "./legend";

let filterContainer;
let svg;

let geoPathGenerator;

const addPattern = svg => {
  svg
    .append("defs")
    .append("pattern")
    .attr("id", "hoverPattern")
    .attr("patternUnits", "userSpaceOnUse")
    .attr("width", 10)
    .attr("height", 10)
    .append("image")
    .attr(
      "xlink:href",
      "data:image/svg+xml;base64,PHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPScxMCcgaGVpZ2h0PScxMCc+CiAgPHJlY3Qgd2lkdGg9JzEwJyBoZWlnaHQ9JzEwJyBmaWxsPSd3aGl0ZScvPgogIDxwYXRoIGQ9J00tMSwxIGwyLC0yCiAgICAgICAgICAgTTAsMTAgbDEwLC0xMAogICAgICAgICAgIE05LDExIGwyLC0yJyBzdHJva2U9J2JsYWNrJyBzdHJva2Utd2lkdGg9JzInLz4KPC9zdmc+"
    )
    .attr("width", 10)
    .attr("height", 10);
  svg
    .append("mask")
    .attr("id", "hoverMask")
    .append("rect")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("fill", "url(#hoverPattern)");
};

export const initMap = container => {
  filterContainer = d3.select(container).select(`.${prefix}filters`);
  svg = d3.select(container).select("svg");

  const svgWidth = +svg.attr("viewBox").split(" ")[2];
  const svgHeight = +svg.attr("viewBox").split(" ")[3];
  const projection = d3.geoAlbersUsa().translate([svgWidth / 2, svgHeight / 2]);

  geoPathGenerator = d3.geoPath().projection(projection);
  addPattern(svg);
  svg.call(
    d3
      .zoom()
      .scaleExtent([1, 20])
      .on("zoom", () => svg.selectAll("path").attr("transform", d3.event.transform))
  );
};

const addStatsToFeatures = (features, stats) => {
  const combinedData = [];

  features.forEach(feature => {
    const data = stats.find(d => d.fips === feature.id);
    const richDistrict = { ...feature, ...data };
    combinedData.push(richDistrict);
  });

  return combinedData;
};

const drawStatesWithData = data =>
  svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "state")
    .on("click", addTooltip);

const drawDistricts = data =>
  svg
    .selectAll("path")
    .data(data)
    .enter()
    .append("path")
    .attr("d", geoPathGenerator)
    .attr("class", "district")
    .on("click", addTooltip);

const updatePaths = (paths, filter, { max: setMax, min: setMin }) => {
  const data = paths
    .data()
    .map(d => d[filter])
    .filter(p => p);
  const max = Math.max.apply(null, data);
  const min = Math.min.apply(null, data);
  const domain = [];

  if (setMin) {
    domain.push(setMin);
  } else {
    domain.push(
      min < 0
        ? min < -1
          ? -100
          : -1 // Assume equal distribution around zero
        : 0 // Assume floor is zero
    );
  }
  if (setMax) {
    domain.push(setMax);
  } else {
    domain.push(max > 1 ? 100 : 1);
  }

  const colorScale = d3.scaleSequential(d3.interpolateRdBu).domain(domain);
  paths.transition().style("fill", d => colorScale(d[filter]));
  buildLegend(colorScale, domain);
};

const addFilters = (paths, filters, dataSetConfig) => {
  // Add some filters
  filterContainer.selectAll("*").remove();
  filterContainer
    .append("label")
    .attr("for", "filter")
    .text("Group");
  const filter = filterContainer
    .append("select")
    .attr("name", "filter")
    .on("change", () => {
      updatePaths(paths, filter.property("value"), dataSetConfig);
    });

  filter
    .selectAll("options")
    .data(filters)
    .enter()
    .append("option")
    .text(makeLabel)
    .attr("value", d => d);
};

// Draw the map
export const drawMap = (stats, { states, districts }, dataSetConfig) => {
  const statesGeo = topojson.feature(states, states.objects.states);
  const districtsGeo = topojson.feature(districts, districts.objects.districts);
  const cleanStats = parseStats(stats);

  // Clear the map out
  svg.selectAll("paths").remove();

  const filters = Object.keys(cleanStats[0]).filter(
    key => ["label", "fips", "state"].indexOf(key) === -1
  );

  // If the first row's FIPS code is over 100 we know it's district data
  if (cleanStats[0].fips > 100) {
    const districtsWithStats = addStatsToFeatures(districtsGeo.features, cleanStats);
    const districtPaths = drawDistricts(districtsWithStats);
    addFilters(districtPaths, filters, dataSetConfig);
    updatePaths(districtPaths, filters[0], dataSetConfig);
  } else {
    // Otherwise we know it's states
    const statesWithStats = addStatsToFeatures(statesGeo.features, cleanStats);
    const statePaths = drawStatesWithData(statesWithStats);
    addFilters(statePaths, filters, dataSetConfig);
    updatePaths(statePaths, filters[0], dataSetConfig);
  }

  createTable(cleanStats);
};
