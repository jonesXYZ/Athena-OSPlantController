import { Vector3 } from 'alt-server';

export default interface iPlant {
    _id?: string;
    owner: string;
    plants: Array<iPlantData>;
}

export interface iPlantData {
    _id?: string;
    owner: string,
    data: {
        water: number;
        type: string;
        time: number;
    };
    general: {
        dimension: number;
        interior: string;
        faction?: number | string | null;
    };
    object: {
        model: string;
    };
    textLabel: {
        data: string;
        position: Vector3;
    };
    states: {
        isSeeds: boolean;
        isFertilized: boolean;
        isHarvestable: boolean;
    };
    position: Vector3;
}
