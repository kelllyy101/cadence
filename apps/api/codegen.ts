import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'src/schema/**/*.graphql',
  generates: {
    'src/generated/resolvers-types.ts': {
      plugins: ['typescript', 'typescript-resolvers'],
      config: {
        contextType: '../graphql/context#GraphQLContext',
        useTypeImports: true,
        strictScalars: true,
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
