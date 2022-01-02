import * as alt from 'alt-server';
import { PLANTCONTROLLER_SETTINGS, PLANTCONTROLLER_SPOTS, PLANTCONTROLLER_TRANSLATIONS } from '../index';
import { Item } from '../../../shared/interfaces/item';
import { PlantController } from '../PlantController';
import { getVectorInFrontOfPlayer } from '../../../server/utility/vector';
import { ITEM_TYPE } from '../../../shared/enums/itemTypes';

/**
 * When the player clicks on the Plant Pot in inventory, the server will create a new pot for the
player.
 */
alt.on('PlantController:Server:CreatePot', (player: alt.Player, data: Item) => {
    const vectorInFront = getVectorInFrontOfPlayer(player, 1);
    for(let i= 0; i < PLANTCONTROLLER_SPOTS.length;i++) {
        if(player.pos.isInRange(PLANTCONTROLLER_SPOTS[i], 2)) {
            PlantController.addPlant(player, {
                model: PLANTCONTROLLER_SETTINGS.smallPot,
                shaIdentifier: PlantController.generateShaId(player),
                data: {
                    owner: player.data.name,
                    variety: '',
                    type: '',
                    seeds: false,
                    fertilized: false,
                    state: PLANTCONTROLLER_TRANSLATIONS.seedsRequired,
                    remaining: 1337, // Keep at Zero. Different Times for Different Seeds? ;)
                    startTime: 1337, // Don't touch.
                    water: 0,
                    harvestable: false,
                },
                position: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 1 } as alt.Vector3,
            });
        } else {
            return;
        }
    }
});
