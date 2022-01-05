import { sha256 } from "../../../../server/utility/encryption";
import { ITEM_TYPE } from "../../../../shared/enums/itemTypes";
import { Item } from "../../../../shared/interfaces/item";

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