import { MigrationInterface, QueryRunner } from "typeorm";

export class Auto1741006341954 implements MigrationInterface {
    name = 'Auto1741006341954'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" ADD "telegram_id" bigint`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "questions" DROP COLUMN "telegram_id"`);
    }

}
