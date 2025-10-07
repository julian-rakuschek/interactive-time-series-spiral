import {norm} from "$lib/helper/util";
import type {SpiralElementBase} from "$lib/types";

export function coordinateToCircle(x: number, y: number, target_radius: number, center: number) {
    const v_norm = norm([x - center, y - center]);
    return [center + v_norm[0] * target_radius, center + v_norm[1] * target_radius];
}

export function coordinateAngle(x: number, y: number, center: number) {
    const v_norm = norm([x - center, y - center]);
    return Math.abs(Math.atan2(v_norm[0], v_norm[1]) - Math.PI);
}

export function angleToCoordinate(angle: number, radius: number, center: number) {
    const rawAngle = Math.PI - angle;
    const vx = Math.sin(rawAngle);
    const vy = Math.cos(rawAngle);
    return [
        center + radius * vx,
        center + radius * vy
    ];
}

export function coordinateToSector(x: number, y: number, center: number, period: number) {
    const angle = coordinateAngle(x, y, center);
    return Math.floor(angle / (Math.PI * 2) * period);
}


export function getSectorData(spiral_data: SpiralElementBase[], start_sector: number, end_sector: number, period: number) {
    let sector_time_series: number[][] = []
    let sector_time_series_indices: number[][] = []
    let current_sector = 0;
    let active = start_sector > end_sector;
    let temp_ts: number[] = [];
    let temp_ts_indices: number[] = [];
    for (let i = 0; i < spiral_data.length; i++) {
        if (current_sector === start_sector) {
            active = true;
            temp_ts = [];
            temp_ts_indices = [];
        }
        if (active) {
            temp_ts.push(spiral_data[i].value);
            temp_ts_indices.push(i);
        }
        if (current_sector === end_sector) {
            active = false;
            sector_time_series.push(temp_ts);
            sector_time_series_indices.push(temp_ts_indices);
            temp_ts = [];
            temp_ts_indices = [];
        }
        current_sector = (current_sector + 1) % period;
    }
    if (temp_ts.length > 0) {
        sector_time_series.push(temp_ts);
        sector_time_series_indices.push(temp_ts_indices);
    }
    return {ts: sector_time_series, indices: sector_time_series_indices};
}