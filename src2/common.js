import path from 'node:path';

export const ROUTES_PATH = 'src/routes';
export const GEN_CODE_DIR_PATH = '.router';
export const ROUTER_PATH = path.join(GEN_CODE_DIR_PATH, '/router.ts');
export const TSCONFIG_PATH = path.join(GEN_CODE_DIR_PATH, '/tsconfig.json');
export const GEN_CODE_ALIAS = 'sv-router/generated';
