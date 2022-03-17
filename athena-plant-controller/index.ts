import * as alt from 'alt-server';
import Database from '@stuyk/ezmongodb';
import { PluginSystem } from '../../server/systems/plugins';

import './src/plant-controller';
import './src/server-events';
import './src/server-items';
import './src/functions';

export const Plant_Controller = {
    name: 'PlantController',
    version: 'v1.0',
    collection: 'plants',
    updateTime: 60000, // One Minute
};

PluginSystem.registerPlugin(Plant_Controller.name, async () => {
    await Database.createCollection(Plant_Controller.collection);
    alt.log(`~lg~${Plant_Controller.name} ${Plant_Controller.version} => successfully initialized.`);
});
