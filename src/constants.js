export const sheetsBaseUrl = "https://spreadsheets.google.com/feeds/list";
export const excludedKeys = ["id", "fips", "type", "properties", "geometry", "label"];
export const defaultFilter = "overall";
export const labelMap = {
  clintonvoters: "Clinton voters",
  trumpvoters: "Trump voters",
  independentvoters: "Independent voters",
  nonvoters: "Non-voters",
  overall: "Overall",
  label: "Location",
  state: "State",
  house: "House district"
};
export const prefix = "dfp-map__";
export const rootURL =
  process.env.NODE_ENV === "development"
    ? "http://localhost:1234/"
    : "https://noahmanger.github.io/data-maps/";
