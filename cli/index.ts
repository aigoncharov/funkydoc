import { parse } from './src/staticdocs-parser'
import { process, Config, ProcessorOutput } from './src/processor'

export const gogogo = async (entryPoint: string, config: Config): Promise<ProcessorOutput> => {
  const parserOut = await parse(entryPoint)
  const processorOut = process(parserOut, config)
  return processorOut
}
