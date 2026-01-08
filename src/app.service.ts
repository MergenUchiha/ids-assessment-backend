import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'IDS Assessment Platform API',
      version: '1.0.0',
      endpoints: {
        scenarios: '/api/scenarios',
        tests: '/api/tests',
        dashboard: '/api/dashboard',
        lab: '/api/lab',
        reports: '/api/reports',
      },
    };
  }
}