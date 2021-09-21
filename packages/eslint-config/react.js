module.exports = {
	extends: [
		'plugin:react/recommended',
		'./typescript.js',
	],
	settings: {
		react: {
			version: '17.0',
		},
	},
	rules: {
		'jsx-quotes': [
			'error',
			'prefer-double',
		],
	},
}
