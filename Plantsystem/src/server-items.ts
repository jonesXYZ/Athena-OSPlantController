import * as alt from 'alt-server';
import { ItemFactory } from '../../../server/systems/item';
import { sha256 } from '../../../server/utility/encryption';
import { ITEM_TYPE } from '../../../shared/enums/itemTypes';
import { Item } from '../../../shared/interfaces/item';

const PLANTCONTROLLER_ITEMS = {
    fertilizerItemName: 'Fertilizer', // Change me before booting if you need to.
	seedsItemName: 'Seeds', // Change me before booting if you need to.
	waterItemName: 'Plantwater', // Change me before booting if you need to.
	potItemName: 'Plant Pot', // Change me before booting if you need to.
	budItemName: 'Buds', // Change me before booting if you need to.
}

const potItem: Item = {
    name: PLANTCONTROLLER_ITEMS.potItemName,
    uuid: sha256(PLANTCONTROLLER_ITEMS.potItemName),
    description: 'Powerful Database Description',
    icon: 'crate',
    quantity: 1,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
    model: 'bkr_prop_jailer_keys_01a',
    data: {
        event: 'PlantSystem:Server:CreatePot'
    },
    rarity: 3,
    dbName: PLANTCONTROLLER_ITEMS.potItemName
};

await ItemFactory.add(potItem);
