import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { OSPlants } from '..';
import { playerFuncs } from '../../../server/extensions/extPlayer';
import { ServerObjectController } from '../../../server/streamers/object';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { ItemEffects } from '../../../server/systems/itemEffects';
import { INVENTORY_TYPE } from '../../../shared/enums/inventoryTypes';
import { SYSTEM_EVENTS } from '../../../shared/enums/system';
import { Item } from '../../../shared/interfaces/item';
import iPlant from './interfaces/iPlant';
import { PLANT_EVENTS } from './items/tools';
import { PlantController } from './plant-controller';

ItemEffects.add(PLANT_EVENTS.GROW_PLANT, (player: alt.Player, item: Item, slot: number, type: INVENTORY_TYPE) => {
    const isToolbar = playerFuncs.inventory.isInToolbar(player, { name: item.name });
    if (!isToolbar) {
        playerFuncs.emit.notification(player, `Item should be in Toolbar.`);
        return;
    }

    const itemInBar = playerFuncs.inventory.isInToolbar(player, { name: item.name });
    if (type === INVENTORY_TYPE.TOOLBAR && player.data.toolbar[itemInBar.index].quantity <= 1) {
        playerFuncs.inventory.toolbarRemove(player, player.data.toolbar[itemInBar.index].slot);
    } else {
        player.data.toolbar[itemInBar.index].quantity--;
    }

    playerFuncs.save.field(player, 'toolbar', player.data.toolbar);
    playerFuncs.sync.inventory(player);

    PlantController.growPlant(player, item.data.faction);
});

alt.on(SYSTEM_EVENTS.BOOTUP_ENABLE_ENTRY, async () => {
    const playerPlantDocument = await Database.fetchAllData<iPlant>(OSPlants.collection);

    for (let x = 0; x < playerPlantDocument.length; x++) {
        let plantsToAdd = [...playerPlantDocument[x].plants];
        plantsToAdd.forEach((entry, index) => {
            ServerObjectController.append({
                model: entry.object.model,
                pos: entry.position,
                uid: entry._id,
                dimension: entry.general.dimension,
                maxDistance: OSPlants.objectDistance,
            });

            ServerTextLabelController.append({
                data: entry.textLabel.data,
                pos: entry.textLabel.position as alt.Vector3,
                uid: entry._id,
                dimension: entry.general.dimension,
                maxDistance: OSPlants.textLabelDistance,
            });
        });
    }
});
