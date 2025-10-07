import {Graphics} from "pixi.js";
import type {Record, SpiralElement, SpiralElementBase, SpiralRecord, TwoToneColor} from "$lib/types";
import {TwoTonePseudoColoring} from "$lib/classes/TwoTonePseudoColoring";
import * as d3 from "d3-scale-chromatic"
import {computeMinMax} from "$lib/helper/util";
import {selected_spiral_element} from "$lib/stores";

export class Spiral {
    public readonly size: number;
    public readonly period: number;
    public readonly cutout: number;
    public sectors: SpiralElement[] = [];
    public selected_coloring: TwoTonePseudoColoring;
    public unselected_coloring: TwoTonePseudoColoring;

    public readonly angleStep = 0.1; // controls smoothness
    public readonly spacing;     // distance between rings
    public readonly rotationOffset = -Math.PI / 2; // 90° counterclockwise
    public readonly ringWidth;

    constructor(size: number, period: number, data: SpiralRecord[], zeroCenteredColoring: boolean = false, cutout: number = 0, ringWidthMultiplier: number = 1) {
        this.size = size;
        this.period = period;
        this.cutout = cutout;
        this.initSpiralSectors(data);

        const values = data.map(d => d.value);
        const [min, max] = computeMinMax(values);
        this.selected_coloring = new TwoTonePseudoColoring(min, max, 10, d3.interpolateRdYlBu, true, zeroCenteredColoring)
        this.unselected_coloring = new TwoTonePseudoColoring(min, max, 10, d3.interpolateGreys, false, zeroCenteredColoring)

        // Compute the optimal spacing s to fit inside the box
        const t = Math.ceil(data.length / period) + 1;
        this.spacing = (size / 2) / (2 * Math.PI * t) * 0.9 * (1 - cutout);

        const first_turn = this.getSpiralCoordinates(0, 2 * Math.PI);
        const last_coordinate = first_turn[first_turn.length - 1];
        this.ringWidth = Math.abs(last_coordinate[1] - this.size / 2) * ringWidthMultiplier;
    }

    addHoverEffectToGraphics(sector: SpiralElement) {
        sector.graphics.interactive = true;
        sector.graphics.on("pointerenter", () => {
            sector.graphics.tint = "#304ffe";
            selected_spiral_element.set(sector);
        })
        sector.graphics.on("pointerleave", () => {
            sector.graphics.tint = "#FFFFFF";
            selected_spiral_element.set(null);
        })
    }

    initSpiralSectors(data: SpiralRecord[]) {
        let current_angle = 0;
        const angle_step = 2 * Math.PI / this.period;
        for (let i = 0; i < data.length; i++) {
            const s: SpiralElement = {
                graphics: new Graphics(),
                selected: true,
                period: i % this.period,
                index: i,
                ring: Math.floor(i / this.period),
                value: data[i].value,
                timestamp: data[i].timestamp,
                spiralStart: current_angle,
                spiralEnd: current_angle + angle_step
            }
            this.sectors.push(s);
            current_angle += angle_step;
        }
    }

    getSpiralCoordinates(minAngle: number, maxAngle: number, radius_offset: number = 0):  number[][] {
        const computeCoordinate = (angle: number) => {
            const center = this.size / 2;
            const a = angle + this.rotationOffset;
            const x = center + this.spacing * angle * Math.cos(a) + radius_offset * Math.cos(a);
            const y = center + this.spacing * angle * Math.sin(a) + radius_offset * Math.sin(a);
            return [x, y];
        }

        const spiral_coordinates: number[][] = [];
        for (let angle = minAngle; angle <= maxAngle; angle += this.angleStep) {
            spiral_coordinates.push(computeCoordinate(angle));
        }
        spiral_coordinates.push(computeCoordinate(maxAngle));
        return spiral_coordinates;
    }

    visualizeSpiralSector(sector: SpiralElement, color: TwoToneColor) {
        const inner_radius = this.size / 2 * this.cutout;
        const inner_spiral = this.getSpiralCoordinates(sector.spiralStart, sector.spiralEnd, inner_radius);
        const middle_spiral = this.getSpiralCoordinates(sector.spiralStart, sector.spiralEnd, this.ringWidth * color.ratio + inner_radius);
        const outer_spiral = this.getSpiralCoordinates(sector.spiralStart, sector.spiralEnd, this.ringWidth + inner_radius);

        const graphics = sector.graphics;
        graphics.clear();
        const colorAPath: number[] = [];
        const colorBPath: number[] = [];
        for (let i = 0; i < inner_spiral.length; i++) {
            colorAPath.push(inner_spiral[i][0])
            colorAPath.push(inner_spiral[i][1])
            colorBPath.push(inner_spiral[i][0])
            colorBPath.push(inner_spiral[i][1])
        }
        for (let i = outer_spiral.length - 1; i >= 0; i--) {
            colorAPath.push(outer_spiral[i][0])
            colorAPath.push(outer_spiral[i][1])
            colorBPath.push(middle_spiral[i][0])
            colorBPath.push(middle_spiral[i][1])
        }
        graphics.poly(colorAPath);
        graphics.fill(color.colorA);
        graphics.poly(colorBPath);
        graphics.fill(color.colorB);
    }

    visualizeSectors(sectors: SpiralElement[], hoverEffect: boolean = true) {
        for (const sector of sectors) {
            const color = sector.selected ? this.selected_coloring.getColor(sector.value) : this.unselected_coloring.getColor(sector.value);
            this.visualizeSpiralSector(sector, color);
            if (hoverEffect) this.addHoverEffectToGraphics(sector);
        }
    }

}