import * as alt from 'alt-server';
/**
 * A plant is a plant.
 * @property {string} _id - The database unique identifier for the plant.
 * @property {string} shaIdentifier - The server unique identifier for the plant.
 * @property {string} model - The model of the plant.
 * @property {typeliteral} data - {
 * @property {alt.Vector3} position - The position of the plant.
 */
export default interface IPlants {
	_id?: string;
	shaIdentifier: string;
	model: string;
	data: {
		owner?: string;
		variety?: string;
		type?: string;
		seeds?: boolean;
		fertilized?: boolean;
		state?: string;
		remaining: number;
		startTime: number;
		water?: number;
		harvestable?: boolean;
	}
	position: alt.Vector3;
}
