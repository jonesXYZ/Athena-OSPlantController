import { ItemFactory } from '../../../server/systems/item';
import { sha256 } from '../../../server/utility/encryption';
import { ITEM_TYPE } from '../../../shared/enums/itemTypes';
import { Item } from '../../../shared/interfaces/item';

export const PLANTCONTROLLER_ITEMS = {
    fertilizerItemName: 'Fertilizer', // Change me before booting if you need to.
	seedsItemName: 'Seeds', // Change me before booting if you need to.
	waterItemName: 'Plantwater', // Change me before booting if you need to.
	potItemName: 'Plant Pot', // Change me before booting if you need to.
	budItemName: 'Buds', // Change me before booting if you need to.
}

const potItem: Item = {
    name: PLANTCONTROLLER_ITEMS.potItemName,
    uuid: sha256(PLANTCONTROLLER_ITEMS.potItemName),
    description: `PlantController - Some Description to show for debugging purposes.`,
    icon: 'crate',
    quantity: 100,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.CONSUMABLE | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CAN_STACK,
    data: {
        event: 'PlantController:Server:CreatePot', // Server Event
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.potItemName
};
export const seeds = [
    { name: 'Northern Haze Seedsy', description: 'Casual seeds for the casual grower.', type: 'Indica', variety: 'Northern Haze', time: 10 },
    { name: 'OG Kush Seeds', description: 'Casual seeds for the casual grower.', type: 'Indica', variety: 'OG Kush', time: 10 },
    { name: 'Purple Haze Seeds', description: 'Casual seeds for the casual grower.', type: 'Indica', variety: 'Purple Haze', time: 10 },
    { name: 'Lemon Haze Seeds', description: 'Casual seeds for the casual grower.', type: 'Sativa', variety: 'Lemon Haze', time: 10, },
    { name: 'Mango Kush Seeds', description: 'Casual seeds for the casual grower.', type: 'Ruderalis', variety: 'Mango Kush', time: 10 }
]
seeds.forEach(async (seed, i) => {
    const seedsItem: Item = {
        name: seed.name,
        uuid: sha256(seed.name),
        description: seed.description,
        icon: 'crate',
        quantity: 100,
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CAN_STACK | ITEM_TYPE.IS_TOOLBAR,
        data: {
            type: seed.type, // Type of Outcome (=> Lemon Haze, Sativa)
            variety: seed.variety, // This Pot will just return "Lemon-Haze Buds",
            time: seed.time
        },
        rarity: 3,
        dbName: seed.name
    };
    await ItemFactory.add(seedsItem);
});

const fertilizerItem: Item = {
    name: PLANTCONTROLLER_ITEMS.fertilizerItemName,
    uuid: sha256(PLANTCONTROLLER_ITEMS.fertilizerItemName),
    description: 'Powerful Database Description',
    icon: 'crate',
    quantity: 100,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CAN_STACK,
    data: {
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.fertilizerItemName
};

const waterItem: Item = {
    name: PLANTCONTROLLER_ITEMS.waterItemName,
    uuid: sha256(PLANTCONTROLLER_ITEMS.waterItemName),
    description: 'Powerful Database Description',
    icon: 'crate',
    quantity: 100,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CAN_STACK,
    data: {
        amount: 100,
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.waterItemName
};

export const buds = [
    { name: 'Northern Haze Buds', description: 'Result of harvesting Northern Haze seeds.', type: 'Indica', variety: 'Northern Haze', amount: 100 },
    { name: 'OG Kush Buds', description: 'Result of harvesting OG Kush seeds.', type: 'Indica', variety: 'OG Kush', amount: 50 },
    { name: 'Purple Haze Buds', description: 'Result of harvesting Purple Haze seeds.', type: 'Indica', variety: 'Purple Haze', amount: 100 },
    { name: 'Lemon Haze Buds', description: 'Result of harvesting Lemon Haze seeds.', type: 'Sativa', variety: 'Lemon Haze', amount: 100 },
    { name: 'Mango Kush Buds', description: 'Result of harvesting Mango Kush seeds.', type: 'Ruderalis', variety: 'Mango Kush', amount: 100 }
]
buds.forEach(async (bud, i) => {
    const budsItem: Item = {
        name: bud.name,
        uuid: sha256(bud.name),
        description: bud.description,
        icon: 'crate',
        quantity: 1,
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CAN_STACK,
        data: {
            type: bud.type,
            variety: bud.variety,
            amount: bud.amount,
        },
        rarity: 6,
        dbName: bud.name
    };
    await ItemFactory.add(budsItem);
});
await ItemFactory.add(potItem);
await ItemFactory.add(fertilizerItem);
await ItemFactory.add(waterItem);
