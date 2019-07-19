import { Controller, Get, Body, Post } from '@nestjs/common';
import { AnalyzeService } from './analyze.service';

@Controller('analyze')
export class AnalyzeController {
	constructor(private readonly analyzeService: AnalyzeService) {}

	@Get()
	getAnalyzers(): Array<string> {
		return this.analyzeService.getAvailableAnalyzers();
	}

	@Post('runbatch')
	async analyze(
		@Body('path') path: string,
		@Body('trackers') trackers: Array<string>
	): Promise<object> {
		return await this.analyzeService.analyze(path, trackers, 100000);
	}

	@Post('getheatmap')
	getHeatmap(
		@Body('name') name: string,
		@Body('square') square: string
	): Array<Array<number>> {
		return this.analyzeService.getHeatmap(name, square);
	}
}
