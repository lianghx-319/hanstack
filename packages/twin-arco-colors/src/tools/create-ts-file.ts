import PluginError from 'plugin-error';
import postcss from 'postcss';
import through2 from 'through2';
// @ts-expect-error
import postcssJs from 'postcss-js';
import {ArcoColor} from './ArcoColor';

const PLUGIN_NAME = 'gulp-javascriptify';

export function typescriptify() {
	return through2.obj(async function (file, _enc, cb) {
		if (file.isNull()) {
			cb(null, file); return;
		}

		if (file.isStream()) {
			this.emit(
				'error',
				new PluginError(PLUGIN_NAME, 'Streaming not supported!'),
			);
			cb(null, file); return;
		}

		try {
			const root = postcss.parse(file.contents.toString());
			const {theme, palette} = postcssJs.objectify(root);
			const generator = new ArcoColor({theme, palette});
			await generator.create();
			//   File.contents = Buffer.from(`${JSON.stringify(obj, null, 2)}\n`);
			//   file.extname = '.json';
		} catch (error: any) {
			this.emit('error', new PluginError(PLUGIN_NAME, error));
		}

		cb(null, null);
	});
}

/* eslint-enable @babel/no-invalid-this */
