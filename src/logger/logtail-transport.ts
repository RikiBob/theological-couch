import * as Transport from 'winston-transport';
import { Logtail } from '@logtail/node';

export class LogtailTransport extends Transport {
  private logtail: Logtail;

  constructor(sourceToken: string) {
    super();
    this.logtail = new Logtail(sourceToken);
  }

  async log(info: any, callback: () => void) {
    const { level, message, ...meta } = info;
    await this.logtail.log(message, { level, ...meta });
    callback();
  }
}
