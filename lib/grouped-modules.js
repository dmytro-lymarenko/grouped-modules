'use strict';
const path = require('path');

const _packages = {
};

function dirPkg(dirname) {
	if(typeof dirname != 'string') {
		throw new Error('The dirname must be set. Use require(\'package\')(__dirname) for it.');
	}
	let pkg = function(name, insidePath) {
		if(typeof _packages['root'] != 'string') {
			throw new Error('The root package must be set. Use pkg.set(\'root\', \'path/to/project/root\') for it.');
		}
		if(typeof name != 'string') {
			throw new TypeError('The package name must be a string.');
		}
		let res;
		if(insidePath === undefined) {
			res = path.resolve(_packages['root'], _packages[name]);
		} else {
			res = path.resolve(_packages['root'], _packages[name], insidePath);
		}
		let r = path.resolve(_packages['root']);
		res = path.relative(dirname, res);
		if(res[0] != '.') {
			res = './' + res;
		}
		return res;
	};

	pkg.set = function(name, path) {
		if(typeof name != 'string') {
			throw new TypeError('The package name must be a string.');
		}
		if(typeof path != 'string') {
			throw new TypeError('The package path must be a string.');
		}
		_packages[name] = path;
	};

	pkg.get = function(name) {
		if(typeof name != 'string') {
			throw new TypeError('The package name must be a string.');
		}
		return _packages[name];
	};

	pkg.remove = function(name) {
		delete _packages[name];
	};

	return pkg;
}

module.exports = dirPkg;