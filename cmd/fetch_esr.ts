import axios from "axios";
import type { Station } from "../src/apis/tutu/tutu";
import fs from "node:fs/promises";

const csvResponse = await axios.get<string>("https://osm.sbin.ru/esr/esr.csv");
const csvData = csvResponse.data;

const csvLines = csvData.split("\n").slice(1)
const cols = ["division", "esr", "invalid_esr", "country", "region", "express", "dup_esr", "source",
  "iso3166", "railway", "type", "name"];

let stations: Station[] = [];

csvLines.forEach(row => {
    try {
        let fixedRow = row.replaceAll("&quot;", "").replaceAll("\"", "").replaceAll("\r", "");
        const rowCols = fixedRow.split(';');
        const data = rowCols.map(i => i == "\"\"" ? null : i);
        let d = Object.fromEntries(data.map((i,j) => [cols[j], i]));
        stations.push({
            division: d.division || null,
            esr: parseInt(d.esr || ""),
            invalid_esr: parseInt(d.invalid_esr || ""),
            country: d.country || null,
            region: d.region || null,
            express: parseInt(d.express || ""),
            dup_esr: d.dup_esr || null,
            source: d.source || null,
            iso3166: d.iso3166 || null,
            railway: d.railway || null,
            type: d.type || null,
            name: d.name || null,
        });
    }
    catch(e) {
        console.log(row);
        console.error(e)
    }
});

await fs.writeFile("./data/esr.json", JSON.stringify(stations.filter(i => i.country == "Российская Федерация")), "utf-8");