export enum Translations {
    STATE = 'State:',
    WATER = 'Water:',
    TIME = 'Time:',
    FERTILIZER = 'Fertilizer:',
    HARVESTABLE = 'Harvestable:',

    NOT_ALLOWED_TO_INTERACT = 'You are not allowed to interact with this plant.',
    PLANT_SUCCESSFULLY_CREATED = 'Successfully created a plant.',

    INTERACTION_PLACESEEDS = 'Place Weedseeds',
    INTERACTION_FERTILIZE = 'Fertilize this plant',
    INTERACTION_WATER = 'Water this plant',
    INTERACTION_HARVEST = 'Harvest this plant'
};

// Settings for the main.ts - file
export const defaultSettings = {
    plantSystemEnabled: true,
    plantUpdateInterval: 5000,
}

export const blipSettings = {
    sprite: 620,
    color: 2,
    scale: 1,
    shortRange: true,
    text: 'Weed-Plant Spot'
}

// Settings for the database.ts - file
export const db_defaultSettings = {
    logsEnabled: true,

    allowEveryoneToInteract: false,
    plantLimit: true,
    maximumAllowedPlants: 2,

    plantBeginningState: 60,
    plantMediumState: 30,
    plantEndState: 15,

    seedPlacingTime: 5000,
    seedPlacingScenario: 'WORLD_HUMAN_GARDENER_PLANT',

    wateringTime: 5000,
    wateringScenario: '',

    fertilizeTime: 5000,
    fertilizeScenario: '',

    harvestTime: 10000,
    harvestScenario: '',

    rangeToSpot: 20,
}

export const db_plantObjects = {
    small: 'bkr_prop_weed_01_small_01a',
    medium: 'bkr_prop_weed_med_01a',
    large: 'bkr_prop_weed_lrg_01a',
};