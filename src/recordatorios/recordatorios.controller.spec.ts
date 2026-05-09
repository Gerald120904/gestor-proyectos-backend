import { Test, TestingModule } from '@nestjs/testing';
import { RecordatoriosController } from './recordatorios.controller';

describe('RecordatoriosController', () => {
  let controller: RecordatoriosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecordatoriosController],
    }).compile();

    controller = module.get<RecordatoriosController>(RecordatoriosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
