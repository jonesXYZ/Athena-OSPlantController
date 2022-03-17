import Database from '@stuyk/ezmongodb';
import * as alt from 'alt-server';
import { Plant_Controller } from '../index';
import { ServerTextLabelController } from '../../../server/streamers/textlabel';
import iPlant, { iPlantData } from './interfaces/iPlant';
import { ServerObjectController } from '../../../server/streamers/object';
import { playerFuncs } from '../../../server/extensions/extPlayer';

export class PlantController implements iPlant {
    _id?: string;
    owner: string;
    plants: iPlantData[];
    
    constructor(data: iPlant) {
        this._id = data._id;
        this.owner = data.owner;
        this.plants = data.plants;
    }

    public static async growPlant(player: alt.Player) {
        // const hasPlantPot = playerFuncs.inventory.isInInventory(player, )
        const vectorInFront = playerFuncs.utility.getPositionFrontOf(player, 1);
        const data = await Database.fetchData<iPlant>('owner', player.data.name, Plant_Controller.collection);
        const plantDocument: iPlantData = {
            object: 'bkr_prop_weed_01_small_01a',
            isSeeds: false,
            isFertilized: false,
            water: 0,
            isHarvestable: false,
            dimension: 0,
            interior: null,
            position: { x: player.pos.x, y: player.pos.y, z: player.pos.z } as alt.Vector3,
        };

        ServerTextLabelController.append({
            pos: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 0.5 },
            data: '1 Funny Textlabel.',
            dimension: 0,
            maxDistance: 15,
            uid: '',
        });

        ServerObjectController.append({
            pos: { x: vectorInFront.x, y: vectorInFront.y, z: vectorInFront.z - 1 },
            model: plantDocument.object,
            uid: '',
        });

        data.plants.push({ ...plantDocument });
        const updated = await Database.updatePartialData(data._id, { plants: data.plants }, Plant_Controller.collection);
        alt.log(updated);
    }

    public static async seedPlant(player: alt.Player) {

    }

    public static async fertilizePlant(player: alt.Player) {

    }

    public static async waterPlant(player: alt.Player) {

    }

    public static async harvestPlant(player: alt.Player) {}

    private static refreshObjects() {}

    private static refreshLabels() {}
}
