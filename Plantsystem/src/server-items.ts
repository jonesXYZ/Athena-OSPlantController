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
    quantity: 1,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.CONSUMABLE,
    model: 'bkr_prop_jailer_keys_01a',
    data: {
        event: 'PlantController:Server:CreatePot', // Server Event
        remaining: 720, // This Pot will need 720 minutes to grow. Usefull for "smaller, bigger"-pots.
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.potItemName
};
export const seeds = [
    { name: 'LORDOG Seeds', description: 'Look how funny i am.', type: 'Indica', variety: 'LORDOG' }
]
seeds.forEach(async (seed, i) => {
    const seedsItem: Item = {
        name: seed.name,
        uuid: sha256(seed.name),
        description: seed.description,
        icon: 'crate',
        quantity: 1,
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE,
        model: 'bkr_prop_jailer_keys_01a',
        data: {
            type: seed.type, // Type of Outcome (=> Lemon Haze, Sativa)
            variety: seed.variety, // This Pot will just return "Lemon-Haze Buds",
        },
        rarity: 3,
        dbName: seed.name
    };
    await ItemFactory.add(seedsItem);
})


const fertilizerItem: Item = {
    name: PLANTCONTROLLER_ITEMS.fertilizerItemName,
    uuid: sha256(PLANTCONTROLLER_ITEMS.fertilizerItemName),
    description: 'Powerful Database Description',
    icon: 'crate',
    quantity: 1,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE,
    model: 'bkr_prop_jailer_keys_01a',
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
    quantity: 1,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE,
    model: 'bkr_prop_jailer_keys_01a',
    data: {
        amount: 10,
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.waterItemName
};

const buds = [
    { name: 'Lemon Haze Buds', description: 'Result of harvesting Lemon Haze seeds.', type: 'Sativa', variety: 'Lemon Haze', amount: 100 },
]
buds.forEach(async (bud, i) => {
    const budsItem: Item = {
        name: bud.name,
        uuid: sha256(bud.name),
        description: bud.description,
        icon: 'crate',
        quantity: 1,
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE,
        model: 'bkr_prop_jailer_keys_01a',
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
