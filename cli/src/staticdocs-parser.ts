export interface DocNode {
  id: string
  title: string
  edgesIn: string[]
  edgedOut: string[]
}

export interface ParserOutput {
  nodes: DocNode[]
  entryPoint: string
}

// TODO: Implement me
export const parse = async (entryPoint: string): Promise<ParserOutput> => {
  return {
    nodes: [],
    entryPoint,
  }
}
