import * as alt from 'alt-server';
import { PLANTCONTROLLER_SETTINGS, PLANTCONTROLLER_TRANSLATIONS } from '../index';
import { Item } from '../../../shared/interfaces/item';
import { PlantController } from '../PlantController';

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
            variety: '..Testing?',
            type: 'Weed?',
            seeds: false,
            fertilized: false,
            state: PLANTCONTROLLER_TRANSLATIONS.seedsRequired,
            remaining: 60*12, // 12 Hour.
            startTime: 60*12, // 720 Minutes. Same as Remaining but wont decrease on updating.
            water: 0,
            harvestable: false,
        },
        position: { x: player.pos.x, y: player.pos.y, z: player.pos.z - 1 } as alt.Vector3,
    });
});
