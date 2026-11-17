export declare class AppService {
    getHello(): string;
    health(): Promise<{
        status: string;
        service: string;
        database: string;
        timestamp: string;
    }>;
}
