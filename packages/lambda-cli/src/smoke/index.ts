#!/usr/bin/env node
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { BUNDLE_FILE } from './constants.ts';

await import(pathToFileURL(resolve(BUNDLE_FILE)).href);
