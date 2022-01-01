import * as alt from 'alt-server';
import { PLANTCONTROLLER_SETTINGS, PLANTCONTROLLER_TRANSLATIONS } from '../index';
import { Item } from '../../../shared/interfaces/item';
import { PlantController } from '../PlantController';
import { ItemFactory } from '../../../server/systems/item';
import { seeds } from './server-items';
import { playerFuncs } from '../../../server/extensions/Player';

/**
 * When the player clicks on the Plant Pot in inventory, the server will create a new pot for the
player.
 */
alt.on('PlantController:Server:CreatePot', (player: alt.Player, data: Item) => {
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
            remaining: 0, // Keep at Zero. Different Times for Different Seeds? ;)
            startTime: 0, // Don't touch.
            water: 0,
            harvestable: false,
        },
        position: { x: player.pos.x + 1, y: player.pos.y, z: player.pos.z - 1 } as alt.Vector3,
    });
});
