import { ItemFactory } from "../../../../server/systems/item";
import { sha256 } from "../../../../server/utility/encryption";
import { ITEM_TYPE } from "../../../../shared/enums/itemTypes";
import { Item } from "../../../../shared/interfaces/item";

export const seeds = [
    { name: 'Northern Haze Seeds', description: 'Casual seeds for the casual grower.', type: 'Indica', variety: 'Northern Haze', time: 10 },
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
        behavior: ITEM_TYPE.CAN_DROP | ITEM_TYPE.CAN_TRADE | ITEM_TYPE.SKIP_CONSUMABLE | ITEM_TYPE.CAN_STACK,
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