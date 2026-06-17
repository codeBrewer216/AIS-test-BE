import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('APP')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  @ApiOperation({ summary: 'Hello World', description: 'Test Api ' })
  @ApiOkResponse({ description: 'Success', content: { 'text/html': { example: 'Hello World!' } } })
  getHello(): string {
    return this.appService.getHello();
  }
}
