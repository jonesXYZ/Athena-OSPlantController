import * as alt from 'alt-server';
import IPlants from './interfaces/IPlants';

alt.on('PlantController:Server:CreatePot', (player: alt.Player, data: IPlants) => {
    alt.log(`${player.data.name} placed a weedpot!`);
});