import * as alt from 'alt-server';
import { plantAdd, PLANTCONTROLLER_SETTINGS } from '..';
import { Item } from '../../../shared/interfaces/item';

/**
 * When the player clicks on the Plant Pot in inventory, the server will create a new pot for the
player.
 */
alt.on('PlantController:Server:CreatePot', (player: alt.Player, data: Item) => {
    plantAdd(player, PLANTCONTROLLER_SETTINGS.smallPot, data.data.variety, data.data.type, data.data.remaining, data.data.water);
});