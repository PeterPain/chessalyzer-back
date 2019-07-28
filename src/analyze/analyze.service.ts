import { Injectable } from '@nestjs/common';
import * as Chessalyzer from 'chessalyzer.js';
import * as Heatmaps from './HeatmapConfig.js';

@Injectable()
export class AnalyzeService {
	private Trackers: object;
	private db: Array<object>;

	constructor() {
		// get the base trackers
		const baseTrackers = Chessalyzer.Tracker;

		// build the tracker list; key = Class name of Tracker
		this.Trackers = {};
		Object.keys(baseTrackers).forEach(key => {
			this.Trackers[baseTrackers[key].name] = baseTrackers[key];
		});

		// init db (TODO: load saved db)
		this.db = [];
	}

	// return a list of all available trackers
	getAvailableAnalyzers(): Array<string> {
		return Object.keys(this.Trackers);
	}

	getAvailableHeatmaps(): Array<object> {
		const heatmaps = [];
		Object.keys(Heatmaps).forEach(h => {
			const obj = {};
			obj['short_name'] = h;
			obj['long_name'] = Heatmaps[h]['long_name'];
			obj['scope'] = Heatmaps[h]['scope'];
			obj['unit'] = Heatmaps[h]['unit'];
			heatmaps.push(obj);
		});
		return heatmaps;
	}

	// return a list of all available trackers
	getDbInfo(): Array<object> {
		const info = [];

		this.db.forEach(entry => {
			const obj = {};
			obj['cntMoves'] = entry['cntMoves'];
			obj['cntGames'] = entry['cntGames'];
			obj['name'] = entry['name'];
			obj['filter'] = entry['filter'];
			obj['trackers'] = Object.keys(entry['trackerData']);
			info.push(obj);
		});
		return info;
	}

	// main analysis function
	async analyze(
		path: string,
		name: string,
		trackers: Array<string>,
		nGames: number,
		f: object
	): Promise<number> {
		const filter = this.buildFilter(f);

		// create new trackers
		const trackerArray: Array<any> = [];
		trackers.forEach(t => {
			trackerArray.push(new this.Trackers[t]());
		});

		// analyze
		const result = await Chessalyzer.startBatchMultiCore(
			path,
			trackerArray,
			{
				cntGames: nGames,
				filter
			}
		);

		// add to db
		const analysis: object = {};
		analysis['name'] = name;
		analysis['cntGames'] = result.cntGames;
		analysis['cntMoves'] = result.cntMoves;
		analysis['filter'] = filter;
		analysis['trackerData'] = {};
		trackerArray.forEach(t => {
			analysis['trackerData'][t.constructor.name] = t;
		});

		this.db.push(analysis);

		return this.db.length - 1;
	}

	generateHeatmap(id: number, name: string, square: string) {
		const { type, calc } = Heatmaps[name];
		const tracker = this.db[id]['trackerData'][type];
		return Chessalyzer.generateHeatmap(tracker, square, calc);
	}

	buildFilter(filter): object {
		return game => {
			if (filter.whitePlayer !== '' && game.White !== filter.whitePlayer)
				return false;

			if (filter.blackPlayer !== '' && game.Black !== filter.blackPlayer)
				return false;

			if (
				game.WhiteElo < filter.whiteElo[0] ||
				game.WhiteElo > filter.whiteElo[1]
			)
				return false;

			if (
				game.BlackElo < filter.blackElo[0] ||
				game.BlackElo > filter.blackElo[1]
			)
				return false;

			let validResult = false;
			filter.result.forEach(res => {
				if (game.Result === res) validResult = true;
			});
			if (!validResult) return false;

			// console.log(game);
			return true;
		};
	}
}
