import type { Props, Plugin } from '@docusaurus/types'
import path from 'path'
import fs from 'fs-extra'

const pluginGraph = (): Plugin<void> => {
  return {
    name: 'docusaurus-plugin-graph',
    async postBuild({ routesPaths, outDir }: Props) {
      const generatedGraph = await createGraph(outDir, routesPaths)
      const graphPath = path.join(outDir, 'graph.json')
      try {
        await fs.writeJSON(graphPath, generatedGraph)
      } catch (err) {
        throw new Error(`Writing graph failed: ${err}`)
      }
    },
  }
}

export default pluginGraph

interface DocNode {
  route: string
  edgesIn: string[]
  edgesOut: string[]
}

interface DocNodeLocal {
  route: string
  edgesIn: Set<string>
  edgesOut: string[]
}

const hrefRegex = /href="(.*?)"/g

const createGraph = async (outDir: string, routePaths: string[]): Promise<DocNode[]> => {
  const routePathsSet = new Set(routePaths)

  const files = await Promise.all(
    routePaths.map((routePath) =>
      fs.readFile(path.join(outDir, ...(routePath.endsWith('.html') ? [routePath] : [routePath, 'index.html'])), 'utf-8'),
    ),
  )

  const docNodes = new Map<string, DocNodeLocal>()

  files.forEach((file, i) => {
    const links = [...file.matchAll(hrefRegex)].map((res) => res[1])
    const docLinks = links.filter((link) => routePathsSet.has(link))

    const route = routePaths[i]

    if (!docNodes.has(route)) {
      const docNode: DocNodeLocal = {
        route,
        edgesOut: [],
        edgesIn: new Set(),
      }
      docNodes.set(route, docNode)
    }

    docNodes.get(route)!.edgesOut = docLinks

    for (const edgeOut of docLinks) {
      if (!docNodes.has(edgeOut)) {
        const docNode: DocNodeLocal = {
          route: edgeOut,
          edgesOut: [],
          edgesIn: new Set(),
        }
        docNodes.set(edgeOut, docNode)
      }
      docNodes.get(edgeOut)!.edgesIn.add(route)
    }
  })

  const docNodesFinal = [...docNodes.values()].map(({ route, edgesOut, edgesIn }) => ({
    route,
    edgesOut,
    edgesIn: [...edgesIn],
  }))

  return docNodesFinal
}
