import {sectorToDonutPosition} from "$lib/classes/QualityMeasureDataManager";

type Sector = {
    start: number;
    end: number;
    width: number;
}

export class Sampler {
    public readonly period: number;
    public readonly rings: number;
    public readonly sectors_per_ring: number[];
    public readonly minimum_sector_size: number;
    public donut_grid: Sector[][][] = [];
    public current_ring: number;
    public current_donut_sector: number;
    public completed_round_trips: number = 0;

    constructor(period: number, rings: number, minimum_sector_size: number = 1) {
        this.period = period;
        this.rings = rings;
        this.current_ring = this.rings - 1;
        this.current_donut_sector = 0;
        this.minimum_sector_size = minimum_sector_size;

        this.sectors_per_ring = [];
        for (let i = 0; i < rings; i++) {
            const ring = i / (rings - 1);
            const sectors = Math.floor(1 + ring * (this.period - 1));
            this.sectors_per_ring.push(sectors)
        }
        this.initDonutElements()
    }


    initDonutElements() {
        for (let r = 0; r < this.rings; r++) {
            const sectors = this.sectors_per_ring[r];
            const ring = [];
            for (let i = 0; i < sectors; i++) {
                ring.push([])
            }
            this.donut_grid.push(ring);
        }

        for (let sector_start = 0; sector_start < this.period; sector_start++) {
            for (let sector_size = 0; sector_size < this.period; sector_size++) {
                const sector_end = (sector_start + sector_size) % this.period;
                const [donut_ring, donut_sector, width] = sectorToDonutPosition(sector_start, sector_end, this.period, this.rings, this.sectors_per_ring);
                if (width < this.minimum_sector_size) continue;
                this.donut_grid[donut_ring][donut_sector].push({start: sector_start, end: sector_end, width: width})
            }
        }

        for (let donut_ring = 0; donut_ring < this.rings; donut_ring++) {
            const sectors = this.sectors_per_ring[donut_ring];
            for (let donut_sector = 0; donut_sector < sectors; donut_sector++) {
                this.donut_grid[donut_ring][donut_sector].sort((a, b) => a.width - b.width);
            }
        }
    }

    getSector(): Sector | null {
        if (this.isFinished()) return null;
        while (this.donut_grid[this.current_ring][this.current_donut_sector].length == 0) {
            this.stepDonut();
        }
        // const sector = this.donut_grid[this.current_ring][this.current_donut_sector].pop();
        const sector = this.donut_grid[this.current_ring][this.current_donut_sector].shift();
        this.stepDonut();
        if (!sector) return null;
        else return sector;
    }

    stepDonut() {
        this.current_donut_sector++;
        if (this.current_donut_sector >= this.sectors_per_ring[this.current_ring]) {
            this.current_ring--;
            if (this.current_ring < 0) {
                this.current_ring = this.rings - 1;
                this.completed_round_trips++;
            }
            this.current_donut_sector = 0;
        }
    }

    isFinished() {
        for (let r = 0; r < this.rings; r++) {
            for (let s = 0; s < this.sectors_per_ring[r]; s++) {
                if (this.donut_grid[r][s].length > 0) return false;
            }
        }
        return true;
    }

}