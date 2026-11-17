import { AppService } from './app.service.js';
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    health(): Promise<{
        status: string;
        service: string;
        database: string;
        timestamp: string;
    }>;
}
