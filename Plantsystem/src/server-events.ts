import * as alt from 'alt-server';
import { plantAdd } from '..';
import { Item } from '../../../shared/interfaces/item';
import IPlants from './interfaces/IPlants';

alt.on('PlantController:Server:CreatePot', (player: alt.Player, data: Item) => {
    plantAdd(player, data.data.variety, data.data.type, data.data.remaining, data.data.water);
});