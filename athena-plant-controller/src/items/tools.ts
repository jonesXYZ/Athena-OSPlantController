import { ITEM_TYPE } from '../../../../shared/enums/itemTypes';
import { Item } from '../../../../shared/interfaces/item';

// Event Exports.
export enum PLANT_EVENTS {
    GROW_PLANT = 'PC:Server:GrowPlant',
    SEED_PLANT = 'PC:Server:SeedPlant',
    FERTILIZE_PLANT = 'PC:Server:FertilizePlant',
    WATER_PLANT = 'PC:Server:WaterPlant',
}

export const plantTools: Array<Item> = [
    {
        name: 'Plant Pot',
        icon: 'crate',
        description: 'Used to grow some plants.',
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CONSUMABLE | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.CAN_STACK,
        data: {
            event: PLANT_EVENTS.GROW_PLANT,
            // faction: 'YourFaction'
        },
        quantity: 1,
        dbName: 'PlantController-Pot',
        version: 1,
    },
    {
        name: 'Fertilizer',
        icon: 'crate',
        description: 'Used to fertilize plants.',
        behavior: ITEM_TYPE.CAN_DROP,
        data: {
            event: PLANT_EVENTS.FERTILIZE_PLANT,
        },
        quantity: 1,
        dbName: 'PlantController-Fertilizer',
        version: 1,
    },
    {
        name: 'Plantwater',
        icon: 'crate',
        description: 'Used to water plants.',
        behavior: ITEM_TYPE.CAN_DROP,
        data: {
            event: PLANT_EVENTS.WATER_PLANT,
        },
        quantity: 1,
        dbName: 'PlantController-Plantwater',
        version: 1,
    },
];