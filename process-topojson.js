const fs = require('fs');

var state_to_fips = {
  "AK": "02",
  "AL": "01",
  "AR": "05",
  "AS": "60",
  "AZ": "04",
  "CA": "06",
  "CO": "08",
  "CT": "09",
  "DC": "11",
  "DE": "10",
  "FL": "12",
  "GA": "13",
  "GU": "66",
  "HI": "15",
  "IA": "19",
  "ID": "16",
  "IL": "17",
  "IN": "18",
  "KS": "20",
  "KY": "21",
  "LA": "22",
  "MA": "25",
  "MD": "24",
  "ME": "23",
  "MI": "26",
  "MN": "27",
  "MO": "29",
  "MS": "28",
  "MT": "30",
  "NC": "37",
  "ND": "38",
  "NE": "31",
  "NH": "33",
  "NJ": "34",
  "NM": "35",
  "NV": "32",
  "NY": "36",
  "OH": "39",
  "OK": "40",
  "OR": "41",
  "PA": "42",
  "PR": "72",
  "RI": "44",
  "SC": "45",
  "SD": "46",
  "TN": "47",
  "TX": "48",
  "UT": "49",
  "VA": "51",
  "VI": "78",
  "VT": "50",
  "WA": "53",
  "WI": "55",
  "WV": "54",
  "WY": "56"
}
var state_full_to_fips = {
  "Alabama": "01",
  "Alaska": "02",
  "Arizona": "04",
  "Arkansas": "05",
  "California": "06",
  "Colorado": "08",
  "Connecticut": "09",
  "Delaware": "10",
  "District of Columbia": "11",
  "Florida": "12",
  "Geogia": "13",
  "Hawaii": "15",
  "Idaho": "16",
  "Illinois": "17",
  "Indiana": "18",
  "Iowa": "19",
  "Kansas": "20",
  "Kentucky": "21",
  "Louisiana": "22",
  "Maine": "23",
  "Maryland": "24",
  "Massachusetts": "25",
  "Michigan": "26",
  "Minnesota": "27",
  "Mississippi": "28",
  "Missouri": "29",
  "Montana": "30",
  "Nebraska": "31",
  "Nevada": "32",
  "New Hampshire": "33",
  "New Jersey": "34",
  "New Mexico": "35",
  "New York": "36",
  "North Carolina": "37",
  "North Dakota": "38",
  "Ohio": "39",
  "Oklahoma": "40",
  "Oregon": "41",
  "Pennsylvania": "42",
  "Rhode Island": "44",
  "South Carolina": "45",
  "South Dakota": "46",
  "Tennessee": "47",
  "Texas": "48",
  "Utah": "49",
  "Vermont": "50",
  "Virginia": "51",
  "Washington": "53",
  "West Virginia": "54",
  "Wisconsin": "55",
  "Wyoming": "56"
}
const f = obj => Object.fromEntries(Object.entries(obj).map(a => a.reverse()))

var fips_to_state = f(state_to_fips)
var fips_to_state_full = f(state_full_to_fips)

const nth = (d) => {
  if (d == "AL") return "At-Large"
  if (d > 3 && d < 21) return d + 'th';
  switch (d % 10) {
    case 1: return d + "st";
    case 2: return d + "nd";
    case 3: return d + "rd";
    default: return d + "th";
  }
};

const recodeID = id => {
  const stateCode = id.substr(0,2);
  let districtID = id.substr(2);
  districtID = districtID == "00" ? "01" : districtID
  return [`${state_to_fips[stateCode]}${districtID}`, stateCode, districtID];
};

let house2020 = fs.readFileSync('/Users/erinthomas/dfp/data-maps/public/congress.json')
house2020 = JSON.parse(house2020)
console.log(house2020)
let house2020Geos = house2020.objects.features.geometries.map(geo => {

  const [id, stateCode, districtID] = recodeID(geo.properties.id)
  let isAtLarge = geo.properties["CD115FP"] === "00"
  let cd = !isAtLarge ? geo.properties["CD115FP"] : "AL"

  geo.id = Number(id)
  geo.properties["Code"] = stateCode + "-" + districtID
  geo.properties["District"] = fips_to_state_full[state_to_fips[stateCode]] + " " + nth(districtID)
  console.log(geo)
  return geo
})
house2020.objects.features.geometries = house2020Geos

const data = JSON.stringify(house2020);
fs.writeFileSync('house-119th.json', data);
