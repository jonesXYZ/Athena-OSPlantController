import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import iPlant from './interfaces/iPlant';
import { ATHENA_EVENTS_PLAYER } from '../../../shared/enums/athenaEvents';
import { PlayerEvents } from '../../../server/events/playerEvents';
import { OSPlants } from '../index';

PlayerEvents.on(ATHENA_EVENTS_PLAYER.SELECTED_CHARACTER, async (player: alt.Player) => {
    const dataExist = await Database.fetchData<iPlant>('owner', player.data.name, OSPlants.collection);
    const plantDocument: iPlant = {
        owner: player.data.name,
        plants: [],
    };

    if (!dataExist) {
        await Database.insertData(plantDocument, OSPlants.collection);
        alt.logWarning(`PlantController => Created PlantController Data for ${player.data.name}.`);
    } else {
        alt.logWarning(`PlantController => Successfully loaded data for ${player.data.name}.`);
    }
});
