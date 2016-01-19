'use strict';
const path = require('path');

// Store groups name and its absolute path
const groups = {};

function getDirName() {
	return path.dirname(module.parent.filename);
}

function gmInDeep(parentGroupName, children) {
	for(let i = 0; i < children.length; i++) {
		let group = children[i];
		if(typeof group.name !== 'string') {
			throw new TypeError('The \'name\' property must be a string');
		}
		if(typeof group.path !== 'string') {
			throw new TypeError('The \'path\' property must be a string');
		}
		gm(group.name).in(parentGroupName).assignTo(group.path);
		if(group.children !== undefined) {
			if(Array.isArray(group.children)) {
				gmInDeep(group.name, group.children);
			} else if(typeof group.children === 'object') {
				gmInDeep(group.name, [group.children]);
			} else {
				throw new TypeError('The \'childred\' property must be either array or object');
			}
		}
	}
}

function gmString(groupName) {
	return {
		getPath(modulePath) {
			if(groups[groupName] === undefined) {
				throw new Error(`There is no group with '${groupName}' name. Please use gm('${groupName}').assignTo('path/to/group')`);
			}
			if(modulePath === undefined) {
				return groups[groupName];
			}
			return path.resolve(groups[groupName], modulePath);
		},

		require(modulePath) {
			return require(this.getPath(modulePath));
		},

		assignTo(groupPath) {
			if(groups[groupName] !== undefined) {
				throw new Error(`The group '${groupName}' is already exist`);
			}
			if(typeof groupPath !== 'string') {
				throw new TypeError('The group path must be a string');
			}
			groups[groupName] = path.resolve(getDirName(), groupPath);
		},

		in(parentGroupName) {
			if(typeof parentGroupName !== 'string') {
				throw new TypeError('The parent group name must be a string');
			}
			if(groups[parentGroupName] === undefined) {
				throw new Error(`There is no parent group with '${parentGroupName}' name. Please use gm('${parentGroupName}').assignTo('path/to/group')`);
			}
			if(groupName === parentGroupName) {
				throw new Error('The parent group name must not be equal to group name');
			}
			return {
				assignTo(groupPath) {
					if(groups[groupName] !== undefined) {
						throw new Error(`The group '${groupName}' is already exist`);
					}
					if(typeof groupPath !== 'string') {
						throw new TypeError('The group path must be a string');
					}
					groups[groupName] = path.resolve(groups[parentGroupName], groupPath);
				}
			}
		}
	};
}

function gmArray(groups) {
	for(let i = 0; i < groups.length; i++) {
		let group = groups[i];
		if(typeof group.name !== 'string') {
			throw new TypeError('The \'name\' property must be a string');
		}
		if(typeof group.path !== 'string') {
			throw new TypeError('The \'path\' property must be a string');
		}
		gm(group.name).assignTo(group.path);
		if(group.children !== undefined) {
			if(Array.isArray(group.children)) {
				gmInDeep(group.name, group.children);
			} else if(typeof group.children === 'object') {
				gmInDeep(group.name, [group.children]);
			} else {
				throw new TypeError('The \'childred\' property must be either array or object');
			}
		}
	}
}

function gm(value) {
	let typeofValue = (typeof value);

	if(typeofValue === 'undefined') {
		throw new Error('Not specified group name as string or groups as object or array');
	}

	if(typeofValue === 'string') {
		return gmString(value);
	}

	if(Array.isArray(value)) {
		return gmArray(value);
	}

	if(typeofValue === 'object' && !(value instanceof RegExp)) {
		return gmArray([value]);
	}

	throw new TypeError('First parameter must be a string, object or array');
}

module.exports = gm;