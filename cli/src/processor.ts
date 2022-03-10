import { ParserOutput } from './staticdocs-parser'

export interface DocNodeProcessed {
  id: string
  title: string
  edgesIn: string[]
  edgesOut: string[]
  // Used in the UI to highlight unhealthy nodes
  health: { status: 'success' } | { status: 'warn'; message: string } | { status: 'danger'; message: string }
}

export interface Config {
  // TODO: Implement me
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

export const process = ({ entryPoint, nodes }: ParserOutput, config: Config): ProcessorOutput => {
  const nodesProcessed: DocNodeProcessed[] = nodes.map((node) => {
    const processed: DocNodeProcessed = {
      ...node,
      health: { status: 'success' },
    }

    if (!node.edgesIn) {
      processed.health = {
        status: 'warn',
        message: 'Page has no links to it',
      }

      if (!node.edgesOut) {
        processed.health = {
          status: 'danger',
          message: 'Isolated page. Page has no links to it and from it.',
        }
      }
    }

    return processed
  })

  return {
    docs: {
      nodes: nodesProcessed,
      health: {
        status: 'success',
      },
    },
    entryPoint,
    config,
  }
}
