export default interface Plants {
    _id?: string,
    owner?: string,
    ownerId?: string,
    position: {
        x: number,
        y: number,
        z: number,
    }
    data: {
        object?: string,
        state?: string,
        time?: number,
        water?: number,
        hasSeeds?: boolean,
        hasFertilizer?: boolean,
        isHarvestable?: boolean
    }
};

/*
export default interface UpdateParams {
    id?: string;
    state?: string,
    object?: string,
    time?: number,
    water?: number,
    hasSeeds?: boolean, 
    hasFertilizer?: boolean,
    isHarvestable?: boolean
} */