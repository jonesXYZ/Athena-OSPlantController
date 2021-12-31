/**************************************************************************
 * The most configurable PlantSystem for the Athena Framework by Stuyk.   *
 * https://github.com/Stuyk/altv-athena                                   *
 * ---------------------------------------------------------------------- *
 * Written by Der Lord!                                                   *
 * ---------------------------------------------------------------------- *
 * Feel free to change whatever you need or dont want.                    *
 * Leave some feedback in the forums if you want to! I'd appreciate it.   *
 * Also feel free to open a PR / issue on my GitHub if you need something *
 * https://github.com/Booster1212/AthenaPlantsystem                       *
 **************************************************************************/
import * as alt from 'alt-server';
export default interface IPlants {
	_id?: string;
	model: string;
	data: {
		owner?: string;
		variety?: string;
		type?: string;
		seeds?: boolean;
		fertilized?: boolean;
		state?: string;
		remaining?: number;
		water?: number;
		harvestable?: boolean;
	}
	position: alt.Vector3;
}
