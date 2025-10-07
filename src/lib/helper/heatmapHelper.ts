import {angleToCoordinate} from "$lib/helper/sectorSelectionHelper";

const TAU = Math.PI * 2;

export function annularSectorPath(start_angle: number, end_angle: number, inner_radius: number, outer_radius: number, center: number): number[] {
    let inner_path = [];
    let outer_path = [];

    let intervalA: number[] = [];
    let intervalB: number[] | null = [];
    if (end_angle > start_angle) {
        intervalA = [start_angle, end_angle];
        intervalB = null;
    } else if (end_angle == start_angle) {
        intervalA = [0, TAU];
        intervalB = null;
    } else {
        intervalA = [start_angle, TAU]
        intervalB = [0, end_angle];
    }


    let current_angle = intervalA[0];
    while (current_angle < intervalA[1]) {
        inner_path.push(angleToCoordinate(current_angle, inner_radius, center))
        outer_path.push(angleToCoordinate(current_angle, outer_radius, center))
        current_angle += 0.01
    }
    inner_path.push(angleToCoordinate(intervalA[1], inner_radius, center))
    outer_path.push(angleToCoordinate(intervalA[1], outer_radius, center))

    if (intervalB !== null) {
        current_angle = intervalB[0];
        while (current_angle < intervalB[1]) {
            inner_path.push(angleToCoordinate(current_angle, inner_radius, center))
            outer_path.push(angleToCoordinate(current_angle, outer_radius, center))
            current_angle += 0.01
        }
        inner_path.push(angleToCoordinate(intervalB[1], inner_radius, center))
        outer_path.push(angleToCoordinate(intervalB[1], outer_radius, center))
    }

    let path: number[] = [];
    for (let i = 0; i < inner_path.length; i++) {
        path.push(inner_path[i][0])
        path.push(inner_path[i][1])
    }
    for (let i = outer_path.length - 1; i >= 0; i--) {
        path.push(outer_path[i][0])
        path.push(outer_path[i][1])
    }
    return path;
}

export function annulusPaths(inner_radius: number, outer_radius: number, n: number, center: number): number[][] {
    const paths = [];
    for (let i = 0; i < n; i++) {
        const start_angle = (i / n) * TAU;
        const end_angle = ((i + 1) / n) * TAU;
        const annularSector = annularSectorPath(start_angle, end_angle, inner_radius, outer_radius, center);
        paths.push(annularSector);
    }
    return paths;
}

export function donutPaths(inner_radius: number, outer_radius: number, rings: number, sectors_per_ring: number[], center: number): number[][][] {
    const paths = [];
    const radius_span = Math.abs(inner_radius - outer_radius);
    for (let i = 0; i < rings; i++) {
        const start_radius = (i / rings) * radius_span + inner_radius;
        const end_radius = ((i + 1) / rings) * radius_span + inner_radius;
        paths.push(annulusPaths(start_radius, end_radius, sectors_per_ring[i], center))
    }
    return paths;
}