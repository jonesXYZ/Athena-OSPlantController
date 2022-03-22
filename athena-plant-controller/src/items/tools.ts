import { ITEM_TYPE } from '../../../../shared/enums/itemTypes';
import { Item } from '../../../../shared/interfaces/item';
import { TOOL_EVENTS } from '../lists/event-names';

export const plantTools: Array<Item> = [
    {
        name: 'Plant Pot',
        icon: 'crate',
        description: 'Used to grow some plants.',
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CONSUMABLE | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.IS_TOOLBAR | ITEM_TYPE.CAN_STACK,
        data: {
            event: TOOL_EVENTS.GROW_PLANT,
            // faction: 'YourFaction' | Need to think about this further.
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
            event: TOOL_EVENTS.FERTILIZE_PLANT,
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
            event: TOOL_EVENTS.WATER_PLANT,
        },
        quantity: 1,
        dbName: 'PlantController-Plantwater',
        version: 1,
    },
    {
        name: 'Plant Harvester',
        icon: 'crate',
        description: 'Used to harvest plants.',
        behavior: ITEM_TYPE.CAN_DROP,
        data: {
            event: TOOL_EVENTS.WATER_PLANT,
        },
        quantity: 1,
        dbName: 'PlantController-Plantharvester',
        version: 1,
    }
];