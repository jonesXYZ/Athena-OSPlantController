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
        hasFertilizer?: boolean,
        isHarvestable?: boolean
    }
};