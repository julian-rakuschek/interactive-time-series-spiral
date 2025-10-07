import type {Record} from "$lib/types";

export function text_to_csv(csv: string): Record[] {
    const lines = csv.split(/\r?\n/).filter(line => line.trim() !== "");
    if (lines.length < 2) return [];
    
    const seperator = lines[0].includes(";") ? ";" : ","
    const columns = lines[0].split(seperator).map(c => c.toLowerCase());
    const possible_date_columns = ["timestamp", "date", "datetime", "time"]
    const records: Record[] = [];
    for (const line of lines.slice(1)) {
        const record: Record = {
            values: {}
        }
        const values = line.split(seperator);
        for (let i = 0; i < values.length; i++) {
            if (possible_date_columns.includes(columns[i])) {
                record.timestamp = new Date(values[i]);
            }
            else {
                record.values[columns[i]] = Number.parseFloat(values[i]);
            }
        }
        records.push(record);
    }
    return records;
}

