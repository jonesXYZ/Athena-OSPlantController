import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { PluginSystem } from '../../server/systems/plugins';

import './src/items/register-items';
import './src/plant-controller';
import './src/server-events';
import './src/functions';

export const OSPlants = {
    name: 'PlantController',
    version: 'v1.0',
    collection: 'plants',
    updateTime: 60000, // One Minute
    textLabelDistance: 5,
    objectDistance: 5,
    everyoneCanInteract: false,
    plantsPerPlayer: -1, // Place whatever you want
};

PluginSystem.registerPlugin(OSPlants.name, async () => {
    await Database.createCollection(OSPlants.collection);
    alt.log(`~lg~${OSPlants.name} ${OSPlants.version} => successfully initialized.`);
});
