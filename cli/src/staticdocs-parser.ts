import { readFile } from 'fs/promises'

export interface DocNode {
  id: string
  title: string
  edgesIn: string[]
  edgesOut: string[]
}

interface DocNodeRaw {
  route: string
  edgesIn: string[]
  edgesOut: string[]
}

export interface ParserOutput {
  nodes: DocNode[]
  entryPoint: string
}

export const parse = async (entryPoint: string): Promise<ParserOutput> => {
  const graphStr = await readFile(entryPoint, 'utf-8')
  const nodesRaw = JSON.parse(graphStr) as DocNodeRaw[]

  const nodes: DocNode[] = nodesRaw.map(({ route, edgesIn, edgesOut }) => ({ id: route, title: route, edgesIn, edgesOut }))

  return {
    nodes,
    entryPoint,
  }
}
