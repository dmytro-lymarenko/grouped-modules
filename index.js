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
			} else if(typeof group === 'object') {
				gmInDeep(group.name, [group.children]);
			} else {
				throw new TypeError('The \'childred\' property must be either array or object');
			}
		}
	}
}

function gm(groupName) {
	let typeofGroupName = (typeof groupName);
	if(typeofGroupName === 'undefined') {
		throw new Error('Not specified group name as string or groups as object or array');
	}

	if(!(typeofGroupName === 'string'
		|| (typeofGroupName === 'object' && !(groupName instanceof RegExp))
		|| Array.isArray(groupName))) {
		throw new TypeError('Group name must be a string, object or array');
	}

	if(typeofGroupName === 'string') {
		return {
			get(modulePath) {
				if(groups[groupName] === undefined) {
					throw new Error(`There is no group with '${groupName}' name. Please use gm('${groupName}').assignTo('path/to/group')`);
				}
				if(modulePath === undefined) {
					return groups[groupName];
				}
				return path.resolve(groups[groupName], modulePath);
			},

			assignTo(groupPath) {
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
						if(typeof groupPath !== 'string') {
							throw new TypeError('The group path must be a string');
						}
						groups[groupName] = path.resolve(groups[parentGroupName], groupPath);
					}
				}
			}
		};
	}
	if(!Array.isArray(groupName)) {
		gm([groupName]);
	}
	let arr = groupName;
	for(let i = 0; i < arr.length; i++) {
		let group = arr[i];
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
			} else if(typeof group === 'object') {
				gmInDeep(group.name, [group.children]);
			} else {
				throw new TypeError('The \'childred\' property must be either array or object');
			}
		}
	}
}

module.exports = gm;