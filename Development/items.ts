/**************************************************************************
 * The most configurable PlantSystem for the Athena Framework by Stuyk.   *
 * https://github.com/Stuyk/altv-athena                                   *
 * ---------------------------------------------------------------------- *
 * 						Written by Der Lord!                              *
 * ---------------------------------------------------------------------- *
 * Feel free to change whatever you need or dont want.                    *
 * Leave some feedback in the forums if you want to! I'd appreciate it.   *
 * Also feel free to open a PR / issue on my GitHub if you need something *
 * https://github.com/Booster1212/AthenaPlantsystem                       *
 **************************************************************************/
import { ITEM_TYPE } from '../../shared/enums/itemTypes';
import { Item } from '../../shared/interfaces/Item';
import { appendToItemRegistry } from '../../shared/items/itemRegistry';
import { deepCloneObject } from '../../shared/utility/deepCopy';

const weedPotItem: Item = {
	name: 'Weedpot',
	description: 'DEBUG: Change me! :( - I am used to plant a WeedPot.',
	icon: 'crate',
	slot: 0,
	quantity: 15,
	behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_STACK | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.CONSUMABLE,
	data: {
		event: 'PlantSystem:Serverside:PlantPot'
	}
};
const registerWeedPot: Item = deepCloneObject<Item>(weedPotItem);
appendToItemRegistry(registerWeedPot);

const weedSeedsItem: Item = {
	name: 'Weedseeds',
	description: 'DEBUG: Change me! :( - I am used to insert seeds into a Weedpot.',
	icon: 'crate',
	slot: 0,
	quantity: 15,
	behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_STACK | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.CONSUMABLE,
	data: {
		/* */
	}
};
const registerWeedSeeds: Item = deepCloneObject<Item>(weedSeedsItem);
appendToItemRegistry(registerWeedSeeds);

const weedFertilizerItem: Item = {
	name: 'Weedfertilizer',
	description: 'DEBUG: Change me! :( - I am used to fertilize a Weedplant.',
	icon: 'crate',
	slot: 0,
	quantity: 15,
	behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_STACK | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.IS_TOOLBAR,
	data: {
		/* */
	}
};
const registerWeedFertilizer: Item = deepCloneObject<Item>(weedFertilizerItem);
appendToItemRegistry(registerWeedFertilizer);

const plantWaterItem: Item = {
	name: 'Plantwater',
	description: 'DEBUG: Change me! :( - I am used to insert seeds into a Weedpot.',
	icon: 'crate',
	slot: 0,
	quantity: 15,
	behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_STACK | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.IS_TOOLBAR,
	data: {
		waterAmount: 25
	}
};
const registerPlantWater: Item = deepCloneObject<Item>(plantWaterItem);
appendToItemRegistry(registerPlantWater);

const plantWeedBudsItem: Item = {
	name: 'Weedbuds',
	description: 'DEBUG: Change me! :( - I am the outcome of harvesting a plant.',
	icon: 'crate',
	slot: 0,
	quantity: 15,
	behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_STACK | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.IS_TOOLBAR,
	data: {
		amount: 20
	}
};
const registerWeedBuds: Item = deepCloneObject<Item>(plantWeedBudsItem);
appendToItemRegistry(registerWeedBuds);
