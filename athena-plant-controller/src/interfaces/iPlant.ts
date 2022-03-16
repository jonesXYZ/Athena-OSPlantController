import { Vector3 } from "alt-server";

export default interface iPlant {
    _id?: string;
    owner: string;
    plants: Array<iPlantData>;
}

export interface iPlantData  {
    object: string;
    isSeeds: boolean;
    isFertilized: boolean;
    water: number;
    isHarvestable: boolean;
    position: Vector3;
}