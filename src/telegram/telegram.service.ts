import {
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { Bot, GrammyError, HttpError, Keyboard } from 'grammy';
import { promises as fs } from 'fs';
import * as path from 'path';
import { QuestionService } from '../question/question.service';
import { QuestionEntity } from '../entities/question.entity';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CustomLoggerService } from '../logger/logger.service';

@Injectable()
export class TelegramService {
  private readonly bot;

  constructor(
    private readonly questionService: QuestionService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private logger: CustomLoggerService,
  ) {
    this.bot = new Bot(process.env.BOT_API_KEY);

    this.logger.log('Initializing Telegram Bot', 'TelegramService');

    this.bot.api.setMyCommands([
      { command: 'start', description: 'Start or restart.' },
    ]);

    this.bot.command('start', async (ctx) => {
      this.logger.log(
        `Received /start command from ${ctx.from.id}`,
        'TelegramService',
      );

      try {
        const username = ctx.from.first_name || 'Користувач';
        const personalizedHtmlContent = await this.loadTemplate(
          'welcome.html',
          {
            username: username,
          },
        );

        const keyboard = new Keyboard()
          .text('Запитати')
          .row()
          .text('Відповіді')
          .resized();

        await ctx.reply(personalizedHtmlContent, {
          disable_web_page_preview: true,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
      } catch (e) {
        this.logger.error(
          'Failed to process /start command',
          e.stack,
          'TelegramService',
        );
        throw new InternalServerErrorException(
          'Error processing start command',
        );
      }
    });

    this.bot.hears('Запитати', async (ctx) => {
      this.logger.log(
        `Received 'Запитати' command from ${ctx.from.id}`,
        'TelegramService',
      );

      try {
        await ctx.reply('Напишіть ваше питання:', {
          reply_markup: { force_reply: true },
        });
      } catch (e) {
        this.logger.error(
          `Error getting 'Запитати' listener`,
          e.stack,
          'TelegramService',
        );
        throw new InternalServerErrorException(
          `Error getting 'Запитати' listener`,
        );
      }
    });

    this.bot.hears('Відповіді', async (ctx) => {
      this.logger.log(
        `Received 'Відповідь' command from ${ctx.from.id}`,
        'TelegramService',
      );

      try {
        const page = 1;
        const id_chat = ctx.from.id;
        const questions = await this.questionService.getAnsweredQuestions({
          page: page,
        });

        const answers = await this.parseAnswersMessage(questions);
        const nextPage = await this.questionService.getAnsweredQuestions({
          page: page + 1,
        });

        await this.cacheManager.set(id_chat, page);

        if (questions.length == 0) {
          const keyboard = new Keyboard().text('Меню').resized();

          await ctx.reply('Питань немає', {
            reply_markup: keyboard,
          });
        } else if (nextPage.length == 0) {
          const keyboard = new Keyboard().text('Меню').resized();

          await ctx.reply(answers, {
            reply_markup: keyboard,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          });
        } else {
          const keyboard = new Keyboard()
            .text('Наступна сторінка')
            .row()
            .text('Меню')
            .resized();

          await ctx.reply(answers, {
            reply_markup: keyboard,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          });
        }
      } catch (e) {
        this.logger.error(
          `Error getting 'Відповідь' listener`,
          e.stack,
          `TelegramService`,
        );
        throw new InternalServerErrorException(
          `Error getting 'Відповідь' listener`,
        );
      }
    });

    this.bot.hears('Наступна сторінка', async (ctx) => {
      this.logger.log(
        `Received 'Наступна сторінка' command from ${ctx.from.id}`,
        'TelegramService',
      );

      try {
        const id_chat = ctx.from.id;
        let page: number = await this.cacheManager.get(id_chat);
        const questions = await this.questionService.getAnsweredQuestions({
          page: ++page,
        });

        const answers = await this.parseAnswersMessage(questions);

        await this.cacheManager.set(id_chat, page);

        if (questions.length == 0) {
          const keyboard = new Keyboard()
            .text('Попередня сторінка')
            .row()
            .text('Меню')
            .resized();

          await ctx.reply('Більше питань немає', {
            reply_markup: keyboard,
          });
        } else {
          const keyboard = new Keyboard()
            .text('Наступна сторінка')
            .row()
            .text('Попередня сторінка')
            .row()
            .text('Меню')
            .resized();

          await ctx.reply(answers, {
            reply_markup: keyboard,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          });
        }
      } catch (e) {
        this.logger.error(
          `Error getting 'Наступна сторінка' listener`,
          e.stack,
          `TelegramService`,
        );
        throw new InternalServerErrorException(
          `Error getting 'Наступна сторінка' listener`,
        );
      }
    });

    this.bot.hears('Попередня сторінка', async (ctx) => {
      this.logger.log(
        `Received 'Попередня сторінка' command from ${ctx.from.id}`,
        'TelegramService',
      );

      try {
        const id_chat = ctx.from.id;
        let page: number = await this.cacheManager.get(id_chat);
        const questions = await this.questionService.getAnsweredQuestions({
          page: --page,
        });

        const answers = await this.parseAnswersMessage(questions);

        await this.cacheManager.set(id_chat, page);

        if (page == 1) {
          const keyboard = new Keyboard()
            .text('Наступна сторінка')
            .row()
            .text('Меню')
            .resized();

          await ctx.reply(answers, {
            reply_markup: keyboard,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
          });
        } else {
          const keyboard = new Keyboard()
            .text('Наступна сторінка')
            .row()
            .text('Попередня сторінка')
            .row()
            .text('Меню')
            .resized();

          await ctx.reply(answers, {
            parse_mode: 'HTML',
            reply_markup: keyboard,
            disable_web_page_preview: true,
          });
        }
      } catch (e) {
        this.logger.error(
          `Error getting 'Попередня сторінка' listener`,
          e.stack,
          `TelegramService`,
        );
        throw new InternalServerErrorException(
          `Error getting 'Попередня сторінка' listener`,
        );
      }
    });

    this.bot.hears('Меню', async (ctx) => {
      this.logger.log(`Received 'Меню' command from ${ctx.from.id}`);

      try {
        const id_chat = ctx.from.id;

        await this.cacheManager.del(id_chat);

        const htmlContent = await this.loadTemplate('menu_message.html');
        const keyboard = new Keyboard()
          .text('Запитати')
          .row()
          .text('Відповіді')
          .resized();

        await ctx.reply(htmlContent, {
          disable_web_page_preview: true,
          parse_mode: 'HTML',
          reply_markup: keyboard,
        });
      } catch (e) {
        this.logger.error(
          `Error getting 'Меню' listener`,
          e.stack,
          'TelegramService',
        );
        throw new InternalServerErrorException(`Error getting 'Меню' listener`);
      }
    });

    this.bot.on('message:text', async (ctx) => {
      this.logger.log(
        `Received 'message:text' command from ${ctx.from.id}`,
        'TelegramService',
      );

      try {
        const userId = ctx.chat.id + '';
        const text = ctx.message.text;

        await this.questionService.createQuestion({
          telegram_id: userId,
          question_text: text,
        });

        const username = ctx.from.first_name || 'Користувач';
        const replacements = {
          username: username,
        };

        const personalizedHtmlContent = await this.loadTemplate(
          'thank_you_message.html',
          replacements,
        );

        const keyboard = new Keyboard()
          .text('Запитати')
          .row()
          .text('Відповіді')
          .resized();

        await ctx.reply(personalizedHtmlContent, {
          reply_markup: keyboard,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        });
      } catch (e) {
        this.logger.error(
          `Error getting 'message:text' listener`,
          e.stack,
          'TelegramService',
        );
        throw new InternalServerErrorException(
          `Error getting 'message:text' listener`,
        );
      }
    });

    this.bot.callbackQuery('question', async (ctx) => {
      this.logger.log(
        `Received 'question' callback query from ${ctx.from.id}`,
        'TelegramService',
      );

      try {
        await ctx.answerCallbackQuery();
        await ctx.reply('Напишіть ваше питання:', {
          reply_markup: { force_reply: true },
        });
      } catch (e) {
        this.logger.error(
          `Error getting callback query from 'question'`,
          e.stack,
          'TelegramService',
        );
        throw new InternalServerErrorException(
          `Error getting callback query from 'question'`,
          'TelegramService',
        );
      }
    });

    this.bot.catch((err) => {
      const ctx = err.ctx;
      const e = err.error;

      this.logger.error(
        `Error while handling update: ${ctx.update.update_id}`,
        e.stack,
        `TelegramService`,
      );

      if (e instanceof GrammyError) {
        this.logger.error('Error in request:', e.stack, 'TelegramService');
      } else if (e instanceof HttpError) {
        this.logger.error(
          'Could not contact Telegram:',
          e.stack,
          `TelegramService`,
        );
      } else {
        this.logger.error('Unknown error:', e.stack, `TelegramService`);
      }
    });
  }

  public start() {
    this.logger.log('Starting Telegram bot...', 'TelegramService');
    this.bot.start();
  }

  private async loadTemplate(
    filePath: string,
    replacements?: { [key: string]: string },
  ): Promise<string> {
    try {
      const fullPath = path.join(
        process.cwd(),
        'src',
        'telegram',
        'templates',
        filePath,
      );

      let template = await fs.readFile(fullPath, 'utf8');

      for (const key in replacements) {
        const regex = new RegExp(`{{${key}}}`, 'g');
        template = template.replace(regex, replacements[key]);
      }

      return template;
    } catch (e) {
      this.logger.error(
        `Failed to load email template.`,
        e.stack,
        `TelegramService`,
      );
      throw new InternalServerErrorException('Failed to load email template.');
    }
  }

  private async parseAnswersMessage(
    questions: QuestionEntity[],
  ): Promise<string> {
    try {
      const answersHtml = questions
        .map((q) => `<a href="${q.url_answer}">${q.question_summary}</a>`)
        .join('\n');

      const replacements = {
        answers: answersHtml,
      };

      return await this.loadTemplate('answers_list.html', replacements);
    } catch (e) {
      this.logger.error(
        'Failed to parse answers message',
        e.stack,
        'TelegramService',
      );
      throw new InternalServerErrorException('Error processing answers.');
    }
  }

  public async sendMessage(
    id: string,
    replacements: { [key: string]: string },
  ): Promise<void> {
    try {
      const message = await this.loadTemplate('answer.html', replacements);

      await this.bot.api.sendMessage(id, message, {
        parse_mode: 'HTML',
      });
    } catch (e) {
      this.logger.error('Failed to send message', e.stack, 'TelegramService');
      throw new InternalServerErrorException('Error processing send message.');
    }
  }
}
