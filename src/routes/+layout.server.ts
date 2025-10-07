import path from 'path';
import {existsSync} from "node:fs";
import type {Datasets} from "$lib/types";
import {text_to_csv} from "$lib/helper/datasetHelper";
import {promises as fs} from "fs";
import { fileURLToPath } from "url";

export async function load({params}) {
    let datasets: Datasets = {};
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    const dataDir = path.resolve(__dirname, "../../data");
    console.log(dataDir)
    if (!existsSync(dataDir)) return {};
    const files = await fs.readdir(dataDir);
    for (const file of files) {
        if (!file.toLowerCase().endsWith(".csv")) continue;
        const filePath = path.join(dataDir, file);
        const csv = await fs.readFile(filePath, "utf-8");
        const key = path.basename(file, ".csv");
        datasets[key] = text_to_csv(csv);
    }
    return datasets;
}
