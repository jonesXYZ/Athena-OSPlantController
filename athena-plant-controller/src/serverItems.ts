import { ItemFactory } from '../../../server/systems/item';
import { ITEM_TYPE } from '../../../shared/enums/itemTypes';
import { Item } from '../../../shared/interfaces/item';


export const plantItems: Array<Item> = [
    {
        name: 'Plant Pot',
        description: `PlantController - Some Description to show for debugging purposes.`,
        icon: 'crate',
        quantity: 1,
        behavior:
            ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CONSUMABLE | ITEM_TYPE.CAN_STACK,
        data: {
            event: 'PlantController:Server:CreatePot', // Server Event
        },
        rarity: 0,
        dbName: `PlantController-Plant-Pot`,
        version: 1,
    },
    {
        name: 'Fertilizer',
        description: `PlantController - Some Description to show for debugging purposes.`,
        icon: 'crate',
        quantity: 1,
        behavior:
        ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CONSUMABLE | ITEM_TYPE.CAN_STACK,
        data: {
            event: 'PlantController:Server:FertilizePot'
        },
        rarity: 0,
        dbName: `PlantController-Fertilizer`,
        version: 1,
    },
    {
        name: 'Plantwater',
        description: `PlantController - Some Description to show for debugging purposes.`,
        icon: 'crate',
        quantity: 1,
        behavior:
        ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CONSUMABLE | ITEM_TYPE.CAN_STACK,
        data: {
            event: 'PlantController:Server:WaterPot',
            amount: 25,
        },
        rarity: 0,
        dbName: `PlantController-Plantwater`,
        version: 1,
    }
];

export const seeds: Array<Item> = [
    {
        name: 'Lemon Haze Seeds',
        description: `PlantController - Some Description to show for debugging purposes.`,
        icon: 'crate',
        quantity: 1,
        behavior:
        ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CONSUMABLE | ITEM_TYPE.CAN_STACK,
        data: {
            event: 'PlantController:Server:SeedPot',
            time: 60,
            type: 'Sativa',
            variety: 'Lemon Haze'
        },
        rarity: 0,
        dbName: `PlantController-Lemon-Haze-Seeds`,
        version: 1,
    }
]

export const buds: Array<Item> = [
    {
        name: 'Lemon Haze Buds',
        description: `PlantController - Some Description to show for debugging purposes.`,
        icon: 'crate',
        quantity: 1,
        behavior:
        ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CONSUMABLE | ITEM_TYPE.CAN_STACK,
        data: {
            type: 'Sativa',
            variety: 'Lemon Haze',
        },
        rarity: 0,
        dbName: `PlantController-Lemon-Haze-Buds`,
        version: 1,
    }
]

for(let x = 0; x < plantItems.length; x++) {
    await ItemFactory.add(plantItems[x]);
}

for(let x = 0; x < seeds.length; x++) {
    await ItemFactory.add(seeds[x]);
}

for(let x = 0; x < buds.length; x++) {
    await ItemFactory.add(buds[x]);
}