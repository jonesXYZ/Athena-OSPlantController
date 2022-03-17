import { Vector3 } from 'alt-server';

export default interface iPlant {
    _id?: string;
    owner: string;
    plants: Array<iPlantData>;
}

export interface iPlantData {
    _id?: string;
    model: string;
    data: {
        water: number;
        type: string;
        variety: string;
        time: number;
    }
    general: {
        dimension: number;
        interior: string;
        faction?: number | string | null;
    };
    states: {
        isSeeds: boolean;
        isFertilized: boolean;
        isHarvestable: boolean;
    };
    position: Vector3;
}
