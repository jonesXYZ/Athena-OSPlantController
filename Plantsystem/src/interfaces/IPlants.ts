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
