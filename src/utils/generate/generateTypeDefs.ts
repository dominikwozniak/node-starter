import * as path from 'path'
import { loadFilesSync } from '@graphql-tools/load-files'
import { mergeTypeDefs } from '@graphql-tools/merge'

const graphqlTypes = loadFilesSync(
  path.join(__dirname, '../../modules/**/*.graphql')
)

export const typeDefs = mergeTypeDefs(graphqlTypes)
