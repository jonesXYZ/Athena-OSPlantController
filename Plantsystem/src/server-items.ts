import * as alt from 'alt-server';
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
        type: 'Sativa', // Type of Outcome (=> Lemon Haze, Sativa)
        variety: 'Lemon Haze', // This Pot will just return "Lemon-Haze Buds",
        remaining: 60, // This Pot will need 60 minutes to grow.
        water: 0 // This pot will start with zero water.
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.potItemName
};

const seedsItem: Item = {
    name: PLANTCONTROLLER_ITEMS.seedsItemName,
    uuid: sha256(PLANTCONTROLLER_ITEMS.seedsItemName),
    description: 'Powerful Database Description',
    icon: 'crate',
    quantity: 1,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE,
    model: 'bkr_prop_jailer_keys_01a',
    data: {
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.seedsItemName
};

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
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.waterItemName
};

await ItemFactory.add(potItem);
await ItemFactory.add(seedsItem);
await ItemFactory.add(fertilizerItem);
await ItemFactory.add(waterItem);
