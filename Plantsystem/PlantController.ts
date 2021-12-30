import * as alt from 'alt-server';
import { sha256 } from '../../server/utility/encryption';
import IPlants from './src/interfaces/IPlants';

export enum PLANTCONTROLLER_EVENTS {
    addPlant = 'PlantSystem:Server:CreatePot'
}
export class PlantController {
	player: alt.Player;
	data: IPlants;

	constructor(player: alt.Player, position: alt.Vector3, data: IPlants) {
	    position = this.player.pos;
        data = this.data;
	}

    static addPlant(player: alt.Player, data: IPlants) {
        if(!data._id) {
            data._id = sha256(data._id);
        }
        alt.emit(PLANTCONTROLLER_EVENTS.addPlant, player, data);
    }

    static removePlant() {

    }

    static seedingPlant() {

    }

    static fertilizePlant() {

    }

    static waterPlant() {

    }

    static updatePlant(player: alt.Player, data: IPlants) {

    }
}

            /* data: {
                owner: '',
                type: '',
                seeds: false,
                fertilized: false,
                state: '',
                remaining: 0,
                water: 0,
                harvestable: false
            },
            position: { x: player.pos.x, y: player.pos.y , z: player.pos.z } as alt.Vector3 */