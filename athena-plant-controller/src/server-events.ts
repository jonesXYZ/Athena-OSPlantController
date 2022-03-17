import * as alt from 'alt-server';
import { playerFuncs } from '../../../server/extensions/extPlayer';
import { ItemEffects } from '../../../server/systems/itemEffects';
import { INVENTORY_TYPE } from '../../../shared/enums/inventoryTypes';
import { Item } from '../../../shared/interfaces/item';
import { PLANT_EVENTS } from './items/tools';
import { PlantController } from './plant-controller';

ItemEffects.add(PLANT_EVENTS.GROW_PLANT, (player: alt.Player, item: Item, slot: number, type: INVENTORY_TYPE) => {
    const isToolbar = playerFuncs.inventory.isInToolbar(player, { name: item.name });
    if (!isToolbar) {
        playerFuncs.emit.notification(player, `Item should be in Toolbar.`);
        return;
    }

    const itemInBar = playerFuncs.inventory.isInToolbar(player, { name: item.name});
    if(type === INVENTORY_TYPE.TOOLBAR && player.data.toolbar[itemInBar.index].quantity <= 1) {
        playerFuncs.inventory.toolbarRemove(player, player.data.toolbar[itemInBar.index].slot);
    } else {
        player.data.toolbar[itemInBar.index].quantity --;
    }

    playerFuncs.save.field(player, 'toolbar', player.data.toolbar);
    playerFuncs.sync.inventory(player);
    
    PlantController.growPlant(player, item.data.faction);
});
