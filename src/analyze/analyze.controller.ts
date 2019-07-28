import { Controller, Get, Body, Post } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';

@Controller('analyze')
export class AnalyzeController {
	constructor(private readonly analyzeService: AnalyzeService) {}

	@Get()
	getAnalyzers(): Array<string> {
		return this.analyzeService.getAvailableAnalyzers();
	}

	@Get('db')
	getDbInfo(): Array<object> {
		return this.analyzeService.getDbInfo();
	}

	@Get('heatmaps')
	getHeatmaps(): Array<object> {
		return this.analyzeService.getAvailableHeatmaps();
	}

	@Post('runbatch')
	async analyze(
		@Body('path') path: string,
		@Body('name') name: string,
		@Body('trackers') trackers: Array<string>,
		@Body('nGames') nGames: number,
		@Body('filter') filter: object
	): Promise<number> {
		return await this.analyzeService.analyze(
			path,
			name,
			trackers,
			nGames,
			filter
		);
	}

	@Post('generateheatmap')
	generateHeatmap(
		@Body('id') id: Array<number>,
		@Body('name') name: string,
		@Body('square') square: string
	): Array<Array<number>> {
		return this.analyzeService.generateHeatmap(id, name, square);
	}
}
