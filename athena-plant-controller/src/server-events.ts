import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { OSPlants } from '../index';
import { PolygonShape } from '../../../server/extensions/extColshape';
import { playerFuncs } from '../../../server/extensions/extPlayer';
import { ServerObjectController } from '../../../server/streamers/object';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import { ServerBlipController } from '../../../server/systems/blip';
import { ItemEffects } from '../../../server/systems/itemEffects';
import { INVENTORY_TYPE } from '../../../shared/enums/inventoryTypes';
import { SYSTEM_EVENTS } from '../../../shared/enums/system';
import { Item } from '../../../shared/interfaces/item';
import iPlant from './interfaces/iPlant';
import { TOOL_EVENTS } from './lists/event-names';
import fields from './lists/fields';
import { PlantController } from './plant-controller';

ItemEffects.add(TOOL_EVENTS.GROW_PLANT, async (player: alt.Player, item: Item, slot: number, type: INVENTORY_TYPE) => {
    const isToolbar = playerFuncs.inventory.isInToolbar(player, { name: item.name });
    
    if(!player.getMeta('Weedfield') === true && OSPlants.usePolygonSystem) {
        playerFuncs.emit.notification(player, 'You are not on a weedfield.');
        return;
    }

    if (!isToolbar) {
        playerFuncs.emit.notification(player, `Item should be in Toolbar.`);
        return;
    }

    if (await PlantController.isPlayerInRangeOfPlant(player, 3)) {
        playerFuncs.emit.notification(player, `Standing to close to another plant!`);
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

        for (let x = 0; x < fields.length; x++) {
            const field = fields[x];
            if (field.isBlip) {
                ServerBlipController.append({
                    sprite: 469,
                    color: 2,
                    pos: { x: field.x, y: field.y, z: field.z },
                    scale: 1,
                    shortRange: true,
                    text: 'Weedfield',
                });
            }

            if(OSPlants.usePolygonSystem) {
                const polygon = new PolygonShape(field.z, field.z + 2.5, field.vertices, true, false);
            
                polygon.addEnterCallback(fieldEnter);
                polygon.addLeaveCallback(fieldLeave);
            }
        }
    }
});

function fieldEnter(polygon: PolygonShape, player: alt.Player) {
    if (!(player instanceof alt.Player)) {
        return;
    }
    playerFuncs.emit.notification(player, `Welcome to the Weed Field! Feel free to grow your plants.`);
    player.setMeta('Weedfield', true);
}

function fieldLeave(polygon: PolygonShape, player: alt.Player) {
    if (!(player instanceof alt.Player)) {
        return;
    }
    playerFuncs.emit.notification(player, `You've left the weed field.`);
    player.setMeta('Weedfield', false);
}
