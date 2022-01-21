import * as alt from 'alt-server';

export default interface IPlants {
    _id?: string;
    owner: string;

    data: {
        shaIdentifier: string;
        objectModel: string;
        state: string;
        interior: string;

        isSeeds: boolean;
        isFertilized: boolean;
        isHarvestable: boolean;

        water: number;
        required: number;
        remaining: number;
        dimension: number;
    }

    types: {
        type: string;
        variety: string;
    }

    position: alt.Vector3;
}
