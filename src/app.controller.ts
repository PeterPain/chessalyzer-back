import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	async analyze(): Promise<any> {
		const data = await this.appService.analyze();
		return data;
	}
}
