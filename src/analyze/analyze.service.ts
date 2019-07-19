import { Injectable } from '@nestjs/common';
import * as Chessalyzer from 'chessalyzer.js';
import * as Heatmaps from './HeatmapConfig.js';

@Injectable()
export class AnalyzeService {
	private Trackers: object;
	private currentTrackers: object;

	constructor() {
		const baseTrackers = Chessalyzer.Tracker;

		this.Trackers = {};
		Object.keys(baseTrackers).forEach(key => {
			this.Trackers[baseTrackers[key].name] = baseTrackers[key];
		});
	}

	getAvailableAnalyzers(): Array<string> {
		return Object.keys(this.Trackers);
	}

	async analyze(
		path: string,
		trackers: Array<string>,
		nGames: number
	): Promise<object> {
		// create new tracker objects
		this.currentTrackers = {};
		trackers.forEach(t => {
			this.currentTrackers[t] = new this.Trackers[t]();
		});

		// convert into array
		const trackerArray = [];
		Object.keys(this.currentTrackers).forEach(key => {
			trackerArray.push(this.currentTrackers[key]);
		});

		// analyze
		const result = await Chessalyzer.startBatchMultiCore(
			path,
			trackerArray,
			{
				cntGames: nGames
			}
		);
		return {
			cntGames: result.cntGames,
			cntMoves: result.cntMoves
		};
	}

	getHeatmap(name: string, square: string) {
		const { type, calc } = Heatmaps[name];
		const tracker = this.currentTrackers[type];
		return Chessalyzer.generateHeatmap(tracker, square, calc);
	}
}
