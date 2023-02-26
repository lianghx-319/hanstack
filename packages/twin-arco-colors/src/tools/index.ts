import {join} from 'node:path';
import {dest, src} from 'gulp';
import cleanCSS from 'gulp-clean-css';
import less from 'gulp-less';
import postcss from 'gulp-postcss';
import {typescriptify} from './create-ts-file';
import {normalizeCssVars} from './normalize-css-vars';

export function arco(cb: () => void) {
	src(join(__dirname, '../index.less'))
		.pipe(less({relativeUrls: true, paths: ['node_modules']}))
		.pipe(cleanCSS({format: 'beautify'}))
		.pipe(postcss([normalizeCssVars()]))
		.pipe(typescriptify())
		.pipe(dest(join(__dirname, '../')));
	cb();
}
