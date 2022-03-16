import * as alt from 'alt-server';

import { ITEM_TYPE } from '../../../shared/enums/itemTypes';
import { Item } from '../../../shared/interfaces/item';
import { ItemFactory } from '../../../server/systems/item';

// Event Exports.
export enum PLANT_EVENTS {
    GROW_PLANT = 'PC:Server:GrowPlant',
    SEED_PLANT = 'PC:Server:SeedPlant',
    FERTILIZE_PLANT = 'PC:Server:FertilizePlant',
    WATER_PLANT = 'PC:Server:WaterPlant'
}

const plantItems: Array<Item> = [
    {
        name: 'Plant Pot',
        icon: 'crate',
        description: 'Used to grow some plants.',
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CONSUMABLE,
        data: {
            event: PLANT_EVENTS.GROW_PLANT,
        },
        quantity: 1,
        dbName: 'PlantController-Pot',
        version: 1
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
        version: 1
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
        version: 1
    },
];

for (let x in plantItems) {
    const itemExist = await ItemFactory.getByName(plantItems[x].name);
    if (!itemExist) {
        const addedItem = await ItemFactory.add(plantItems[x]);
        alt.logWarning(`PlantController => Successfully added ${addedItem.name} to the ItemFactory Database.`);
    } else {
        alt.logWarning(`PlantController => Skipped some Items during Bootup Enable Entry, because they already exist.`);
    }
}
