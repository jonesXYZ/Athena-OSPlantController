import { Vector3 } from "alt-server";

export default interface iPlant {
    _id?: string;
    owner: string;
    plants: Array<iPlantData>;
}

export interface iPlantData  {
    _id?: string;
    object: string;
    isSeeds: boolean;
    isFertilized: boolean;
    water: number;
    isHarvestable: boolean;
    dimension: number;
    interior: string;
    position: Vector3;
}