import { ITEM_TYPE } from "../../../../shared/enums/itemTypes";
import { Item } from "../../../../shared/interfaces/item";
import { TOOL_EVENTS } from "../lists/event-names";

export const seeds: Array<Item> = [
    {
        name: 'Lemon Haze Seeds',
        icon: 'crate',
        description: 'Used to seed a plant.',
        behavior:
            ITEM_TYPE.CAN_DROP |
            ITEM_TYPE.CONSUMABLE |
            ITEM_TYPE.SKIP_CONSUMABLE |
            ITEM_TYPE.IS_TOOLBAR |
            ITEM_TYPE.CAN_STACK,
        data: {
            event: TOOL_EVENTS.SEED_PLANT,
            type: 'Lemon Haze',
            time: 120, // 120 Minutes to grow.
        },
        quantity: 1,
        dbName: 'PlantController-LemonHazeSeeds',
        version: 1,
    },
]