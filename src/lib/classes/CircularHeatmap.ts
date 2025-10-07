import {type Application, Graphics} from "pixi.js";
import {annularSectorPath, donutPaths} from "$lib/helper/heatmapHelper";
import {coordinateToSector} from "$lib/helper/sectorSelectionHelper";
import {mod} from "$lib/helper/util";


const TAU = Math.PI * 2;

class DonutElement {
    public path: number[];
    public graphics: Graphics;

    constructor(path: number[], graphics: Graphics) {
        this.path = path
        this.graphics = graphics
    }

    updateGraphics(color: string) {
        this.graphics.clear();
        this.graphics.poly(this.path);
        this.graphics.fill(color);
    }
}

class DonutRing {
    public ringIdx: number;
    public elements: DonutElement[] = [];

    constructor(ringIdx: number, initialElements: DonutElement[]) {
        this.ringIdx = ringIdx;
        this.elements = initialElements;
    }
}



export class CircularHeatmap {
    public readonly pixel_size: number;
    public readonly rings: number;
    public readonly period: number;
    public readonly pixiApp: Application;
    public readonly center: number;
    public readonly donut_inner_radius: number;
    public readonly donut_outer_radius: number;
    public readonly sectors_per_ring: number[];
    public donutRings: DonutRing[] = [];
    public mouseGraphics: Graphics;
    public selectedGraphics: Graphics;


    constructor(pixiApp: Application, pixel_size: number, period: number, rings: number) {
        this.pixel_size = pixel_size;
        this.period = period;
        this.rings = rings;
        this.pixiApp = pixiApp;
        this.center = pixel_size / 2;
        this.donut_inner_radius = 15;
        this.donut_outer_radius = pixel_size / 2 - 5;
        this.sectors_per_ring = [];
        for (let i = 0; i < rings; i++) {
            const ring = i / (rings - 1);
            const sectors = Math.floor(1 + ring * (this.period - 1));
            this.sectors_per_ring.push(sectors)
        }
        this.clearHeatmap()
        this.initHeatmap()
        this.mouseGraphics = new Graphics();
        this.selectedGraphics = new Graphics();
        this.pixiApp.stage.addChild(this.mouseGraphics)
        this.pixiApp.stage.addChild(this.selectedGraphics)
    }

    clearHeatmap() {
        if (!this.pixiApp) return;
        this.pixiApp.stage.removeChildren().forEach(child => child.destroy());
    }

    initHeatmap() {
        const paths = donutPaths(this.donut_inner_radius, this.donut_outer_radius, this.rings, this.sectors_per_ring, this.center);
        let currentRingIdx = 0;
        for (const ring of paths) {
            const donutRing: DonutElement[] = []
            for (const sector of ring) {
                const graphics = new Graphics();
                const donutElement = new DonutElement(sector, graphics)
                this.pixiApp.stage.addChild(graphics)
                donutRing.push(donutElement);
            }
            this.donutRings.push(new DonutRing(currentRingIdx, donutRing));
            currentRingIdx++;
        }
    }


    renderMouseHover(mouse_x: number, mouse_y: number) {
        const radius_norm = (radius: number): number => {
            return (radius - this.donut_inner_radius) / (this.donut_outer_radius - this.donut_inner_radius)
        }
        this.mouseGraphics.clear()
        const radius = Math.sqrt(Math.pow(mouse_x - this.center, 2) + Math.pow(mouse_y - this.center, 2));
        const radius_normalized = radius_norm(radius);
        if (radius_normalized > 1 || radius_normalized < 0) return null
        const width = Math.floor(this.period * (1 - radius_normalized));
        const offset = Math.floor(width / 2);
        const sector_start = mod(coordinateToSector(mouse_x, mouse_y, this.center, this.period) - offset, this.period);
        const sector_end = (sector_start + width) % this.period;

        const selected_sector = annularSectorPath(
            (sector_start / this.period) * TAU,
            ((sector_end + 1) / this.period) * TAU,
            Math.floor(radius_normalized * this.period) / this.period * Math.abs(this.donut_inner_radius - this.donut_outer_radius) + this.donut_inner_radius,
            Math.ceil(radius_normalized * this.period) / this.period * Math.abs(this.donut_inner_radius - this.donut_outer_radius) + this.donut_inner_radius,
            this.center
        )
        this.mouseGraphics.poly(selected_sector).fill(0xc5cae9).stroke({color: 0xc5cae9, width: 2});
        return [sector_start, sector_end];
    }

    clearMouseHover() {
        this.mouseGraphics.clear()
    }

    renderCurrentSelection(start: number, end: number) {
        this.selectedGraphics.clear()
        const sector_width = mod(end - start, this.period);
        const normalized_sector_width_upper = 1 - sector_width / this.period;
        const normalized_sector_width_lower = 1 - (sector_width + 1) / this.period;

        const selected_sector = annularSectorPath(
            (start / this.period) * TAU,
            ((end + 1) / this.period) * TAU,
            normalized_sector_width_lower * Math.abs(this.donut_inner_radius - this.donut_outer_radius) + this.donut_inner_radius,
            normalized_sector_width_upper * Math.abs(this.donut_inner_radius - this.donut_outer_radius) + this.donut_inner_radius,
            this.center
        )
        this.selectedGraphics.poly(selected_sector).fill(0x304ffe).stroke({color: 0x304ffe, width: 2});
    }

    renderDonut(data: string[][]) {
        for (let ring_idx = 0; ring_idx < this.rings; ring_idx++) {
            const sectors = this.sectors_per_ring[ring_idx]
            for (let sector_idx = 0; sector_idx < sectors; sector_idx++) {
                const color = ring_idx < data.length && sector_idx < data[ring_idx].length ? data[ring_idx][sector_idx] : "#e0e0e0";
                this.donutRings[ring_idx].elements[sector_idx].updateGraphics(color);
            }
        }
    }

}