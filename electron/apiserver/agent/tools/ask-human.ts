import { StructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import logger from 'electron-log';

class AskHumanTool extends StructuredTool {
  name = 'askHuman';
  description = '询问用户的输入.';
  schema = z.string();

  protected async _call(input: string) {
    logger.info('[AskHumanTool] 询问用户', input);
    return '用户说: XYZ';
  }
}

const askHuman = new AskHumanTool();

export default askHuman;