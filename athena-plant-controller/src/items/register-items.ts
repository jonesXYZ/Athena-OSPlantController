import * as alt from 'alt-server';
import { ItemFactory } from '../../../../server/systems/item';
import { SYSTEM_EVENTS } from '../../../../shared/enums/system';
import { plantBuds } from './buds';
import { seeds } from './seeds';
import { plantTools } from './tools';

const itemsToAdd = [
    ...plantTools, 
    ...seeds, 
    ...plantBuds
];

alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, async () => {
    for (let x = 0; x < itemsToAdd.length; x++) {
        const item = itemsToAdd[x];
        item ? {} : alt.log(`PlantController => ${item.name} was added to the ItemFactory.`);
        await ItemFactory.add(item);
    }
});
