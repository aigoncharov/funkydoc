import { ParserOutput } from './staticdocs-parser'

export interface DocNodeProcessed {
  id: string
  title: string
  edgesIn: string[]
  edgedOut: string[]
  // Used in the UI to highlight unhealthy nodes
  health: { status: 'success' } | { status: 'warn'; message: string } | { status: 'danger'; message: string }
}

interface Config {
  maxRoots: {
    warn: number
    danger: number
  }
  edgesIn: {
    warn: number
    danger: number
  }
  edgesOut: {
    warn: number
    danger: number
  }
}

export interface ProcessorOutput {
  docs: {
    nodes: DocNodeProcessed[]
    // Used in the UI to display warnings and errors for the entire documentation
    health: { status: 'success' } | { status: 'warn'; message: string } | { status: 'danger'; message: string }
  }
  entryPoint: string
  config: Config
}

// TODO: Implement me
export const process = (parserOutput: ParserOutput, config: Config): Promise<ProcessorOutput> => {}
