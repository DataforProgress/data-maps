export const sheetsBaseUrl = "https://spreadsheets.google.com/v4/spreadsheets";
export const excludedKeys = [
  "id",
  "fips",
  "type",
  "properties",
  "geometry",
  "label",
  "scale",
  "legendLabel",
  "scaleType"
];
export const prefix = "dfp-map__";
export const rootURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:1234/"
    : "https://dataforprogress.github.io/data-maps/";
export const legendWidth = 320;
export const legendHeight = 40;
export const nonFilters = [
  "label",
  "fips",
  "state",
  "content",
  "currentdescription",
  "proposeddescription",
  "bill",
  "link",
  "scaleType"
];

export const nonFilterPrefix = "na_";

export const QUALITATIVE_SCALE = "qualitative";
export const RED_SCALE = "red";
export const BLUE_SCALE = "blue";
export const INVERTED_RED_SCALE = "red-inverted";
export const INVERTED_BLUE_SCALE = "blue-inverted";
export const DIVERGENT_SCALE = "red-to-blue";
export const INVERTED_SCALE = "blue-to-red";
export const DYNAMIC_SCALE = "dynamic";
export const INVERTED_DYNAMIC_SCALE = "dynamic-inverted";
export const DEFAULT_SCALE = DIVERGENT_SCALE;
export const DEFAULT_BUCKETS = 7;

export const qualKeys = [
  "no",
  "yes_low",
  "yes_high",
  "proposed_low",
  "proposed_high",
  "no-no",
  "no-yes_low",
  "no-yes_high",
  "yes_low-no",
  "yes_low-yes_low",
  "yes_low-yes_high",
  "yes_high-no",
  "yes-high_yes-low",
  "yes-high_yes-high"
];

export const stateLabels = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  DC: "District of Columbia",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming"
};
