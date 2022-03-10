#! /usr/bin/env node

import yargs from 'yargs/yargs'
import { gogogo } from './index'
import { writeFile } from 'fs/promises'
import path from 'path'

const argv = yargs(process.argv.slice(2)).argv

let [input, output] = argv._ as [string, string]

input = path.isAbsolute(input) ? input : path.join(process.cwd(), input)
output = path.isAbsolute(output) ? output : path.join(process.cwd(), output)

gogogo(input, {})
  .then((res) => writeFile(output, JSON.stringify(res)))
  .catch((e) => {
    console.error('Failed to process graph', input, output)
  })
