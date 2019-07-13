import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
	getHello(): string {
		return 'Hello World!';
	}

	async analyze() {
		const Chessalyzer = require('chessalyzer.js');
		const CustomTracker = require('../src/CustomTracker');
		const { Tracker } = Chessalyzer;

		const a = new Tracker.Game();
		const b = new Tracker.Piece();
		const c = new Tracker.Tile();
		const d = new CustomTracker.MyCustomTracker();
		let fun = (data, sqrData, loopSqrData) => {
			let val = 0;
			const { coords } = sqrData;
			const { piece } = loopSqrData;
			if (piece.color !== '') {
				val =
					data.tiles[coords[0]][coords[1]][piece.color][piece.name]
						.movedTo;
			}
			return val;
		};
		await Chessalyzer.startBatchMultiCore(
			'./test/lichess_db_standard_rated_2013-12.pgn',
			[c, d],
			{
				cntGames: 100000
			}
		);
		// generate a heat map for the data of 'a1' based on your evaluation function
		return Chessalyzer.generateHeatmap(c, 'a1', fun);
	}
}
