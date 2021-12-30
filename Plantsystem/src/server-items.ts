import * as alt from 'alt-server';
import { ItemFactory } from '../../../server/systems/item';
import { sha256 } from '../../../server/utility/encryption';
import { ITEM_TYPE } from '../../../shared/enums/ItemTypes';
import { Item } from '../../../shared/interfaces/item';

const ITEM_SETTINGS = {
    fertilizerItemName: 'Fertilizer', // Change me before booting if you need to.
	seedsItemName: 'Seeds', // Change me before booting if you need to.
	waterItemName: 'Plantwater', // Change me before booting if you need to.
	potItemName: 'Plant Pot', // Change me before booting if you need to.
	budItemName: 'Buds', // Change me before booting if you need to.
}
const potItem: Item = {
    name: ITEM_SETTINGS.potItemName,
    uuid: sha256(ITEM_SETTINGS.potItemName),
    description: 'Powerful Database Description',
    icon: 'crate',
    quantity: 1,
    behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE,
    model: 'bkr_prop_jailer_keys_01a',
    data: {
        event: 'PlantSystem:Server:CreatePot'
    },
    rarity: 3,
    dbName: ITEM_SETTINGS.potItemName
};

await ItemFactory.add(potItem);
