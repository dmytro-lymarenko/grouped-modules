'use strict';
const proxyquire = require('proxyquire').noPreserveCache();
const should = require('should');
const path = require('path');

const GROUPED_MODULES = '../index.js';

function clearCache(pathToModule) {
	delete require.cache[require.resolve(pathToModule)];
}

function requireOneTime(pathToModule) {
	clearCache(pathToModule);
	return require(pathToModule);
}

describe('grouped-modules.js', () => {
	it('gm should be a function', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		should(gm).be.a.Function();
	});

	it('should throw error if there is no group name in gm', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const errorMessage = 'Not specified group name as string or groups as object or array';

		gm.should.throw(errorMessage);
	});

	it('should throw error if group name is not a string, object or array', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const errorMessage = 'First parameter must be a string, object or array';

		gm.bind(null, 4).should.throw(errorMessage);
		gm.bind(null, true).should.throw(errorMessage);
		gm.bind(null, () => {}).should.throw(errorMessage);
		gm.bind(null, /re/).should.throw(errorMessage);
	});

	it('should throw error if there is no group added', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'root';

		const errorMessage = `There is no group with '${groupName}' name. Please use gm('${groupName}').assignTo('path/to/group')`;

		gm(groupName).getPath.should.throw(errorMessage);
	});

	it('should return nothing if we call it with object or array', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		
		should(gm({
			name: 'root',
			path: 'root'
		})).be.undefined();

		should(gm([{
			name: 'root1',
			path: 'root'
		},{
			name: 'root2',
			path: 'root2'
		}
		])).be.undefined();
	});

	it('should throw error if group name is already exist', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'root';
		const errorMessage = `The group '${groupName}' is already exist`;

		gm(groupName).assignTo('somewhere');
		gm(groupName).assignTo.bind(null, 'here').should.throw(errorMessage);
	});

	it('should throw error if group path is not a string in assignTo method', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const errorMessage = 'The group path must be a string';

		gm('root').assignTo.bind(null, 2).should.throw(errorMessage);
		gm('root').assignTo.bind(null, false).should.throw(errorMessage);
		gm('root').assignTo.bind(null, []).should.throw(errorMessage);
		gm('root').assignTo.bind(null, {}).should.throw(errorMessage);
		gm('root').assignTo.bind(null, undefined).should.throw(errorMessage);
		gm('root').assignTo.bind(null, () => {}).should.throw(errorMessage);
		gm('root').assignTo.bind(null, /rth/).should.throw(errorMessage);
	});

	it('should save group name and path to it that must be changed to absolute', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'module';
		const groupPath = '../path';
		const absGroupPath = path.resolve(__dirname, groupPath);

		const innerModulePath = 'inner/module';
		const absInnerModulePath = path.resolve(absGroupPath, innerModulePath);

		gm(groupName).assignTo(groupPath);

		let res;

		res = gm(groupName).getPath();
		should(res).be.String();
		res.should.be.eql(absGroupPath);

		res = gm(groupName).getPath(innerModulePath);
		should(res).be.String();
		res.should.be.eql(absInnerModulePath);
	});

	it('should throw error if parent group name is not a string', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const errorMessage = 'The parent group name must be a string';

		gm('root').assignTo('root');

		gm('root').in.bind(null, 2).should.throw(errorMessage);
		gm('root').in.bind(null, false).should.throw(errorMessage);
		gm('root').in.bind(null, []).should.throw(errorMessage);
		gm('root').in.bind(null, {}).should.throw(errorMessage);
		gm('root').in.bind(null, undefined).should.throw(errorMessage);
		gm('root').in.bind(null, () => {}).should.throw(errorMessage);
		gm('root').in.bind(null, /rth/).should.throw(errorMessage);
	});

	it('should throw error if there is no group added to add inner', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'root';

		const errorMessage = `There is no parent group with '${groupName}' name. Please use gm('${groupName}').assignTo('path/to/group')`;

		gm('innerGroupName').in.bind(null, groupName).should.throw(errorMessage);
	});

	it('should throw error if parent group name is as the group name', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const errorMessage = 'The parent group name must not be equal to group name';

		gm('root').assignTo('root');

		gm('root').in.bind(null, 'root').should.throw(errorMessage);
	});

	it('should throw error if group name is already exist in in.assignTo', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'root';
		const errorMessage = `The group '${groupName}' is already exist`;

		gm('parent').assignTo('root');
		gm(groupName).assignTo('somewhere');
		gm(groupName).in('parent').assignTo.bind(null, 'here').should.throw(errorMessage);
	});

	it('should throw error if group path is not a string in in.assignTo method', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const errorMessage = 'The group path must be a string';

		gm('root').assignTo('./');

		gm('innerGroupName').in('root').assignTo.bind(null, 2).should.throw(errorMessage);
		gm('innerGroupName').in('root').assignTo.bind(null, false).should.throw(errorMessage);
		gm('innerGroupName').in('root').assignTo.bind(null, []).should.throw(errorMessage);
		gm('innerGroupName').in('root').assignTo.bind(null, {}).should.throw(errorMessage);
		gm('innerGroupName').in('root').assignTo.bind(null, undefined).should.throw(errorMessage);
		gm('innerGroupName').in('root').assignTo.bind(null, () => {}).should.throw(errorMessage);
		gm('innerGroupName').in('root').assignTo.bind(null, /rth/).should.throw(errorMessage);
	});

	it('should build inner groups', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'module';
		const groupPath = '../path';
		const absGroupPath = path.resolve(__dirname, groupPath);

		const innerGroupName = 'innerGroupName';
		const innerGroupPath = 'innerGroup/path';
		const absInnerGroupPath = path.resolve(absGroupPath, innerGroupPath);

		const innerModulePath = 'inner/module';
		const absInnerModulePath = path.resolve(absInnerGroupPath, innerModulePath);

		gm(groupName).assignTo(groupPath);
		gm(innerGroupName).in(groupName).assignTo(innerGroupPath);

		let res;

		res = gm(innerGroupName).getPath();
		should(res).be.String();
		res.should.be.eql(absInnerGroupPath);

		res = gm(innerGroupName).getPath(innerModulePath);
		should(res).be.String();
		res.should.be.eql(absInnerModulePath);
	});

	it('should throw error if name property is incorrect', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		gm.bind(null, [
			{
				path: '../path',
				children: [
					{
						name: 'group',
						path: 'groupPath/'
					},
					{
						name: 'other group',
						path: 'otherFolder',
						children: [
							{
								name: 'inner',
								path: 'inner'
							}
						]
					}
				]
			},
			{
				name: 'test',
				path: 'test'
			}
		]).should.throw('The \'name\' property must be a string');
		gm.bind(null, [
			{
				name: 'root',
				path: '../path',
				children: [
					{
						name: 'group',
						path: 'groupPath/'
					},
					{
						name: 'other group',
						path: 'otherFolder',
						children: [
							{
								path: 'inner'
							}
						]
					}
				]
			},
			{
				name: 'test',
				path: 'test'
			}
		]).should.throw('The \'name\' property must be a string');
	});

	it('should throw error if path property is incorrect', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		gm.bind(null, [
			{
				name: 'root',
				children: [
					{
						name: 'group',
						path: 'groupPath/'
					},
					{
						name: 'other group',
						path: 'otherFolder',
						children: [
							{
								name: 'inner',
								path: 'inner'
							}
						]
					}
				]
			},
			{
				name: 'test',
				path: 'test'
			}
		]).should.throw('The \'path\' property must be a string');
		gm.bind(null, [
			{
				name: 'root',
				path: '../path',
				children: [
					{
						name: 'group',
						path: 'groupPath/'
					},
					{
						name: 'other group',
						children: [
							{
								name: 'inner',
								path: 'inner'
							}
						]
					}
				]
			},
			{
				name: 'test',
				path: 'test'
			}
		]).should.throw('The \'path\' property must be a string');
	});

	it('should throw error if children property is incorrect', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		gm.bind(null, [
			{
				name: 'root',
				path: '../path',
				children: 'children'
			},
			{
				name: 'test',
				path: 'test'
			}
		]).should.throw('The \'childred\' property must be either array or object');
		gm.bind(null, [
			{
				name: 'root1',
				path: '../path',
				children: [
					{
						name: 'group',
						path: 'groupPath/'
					},
					{
						name: 'other group',
						path: 'otherFolder',
						children: function() {}
					}
				]
			},
			{
				name: 'test1',
				path: 'test'
			}
		]).should.throw('The \'childred\' property must be either array or object');
	});

	it('should configure gm using array of objects as parameter', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groups = [
			{
				name: 'root',
				path: '../path',
				children: [
					{
						name: 'group',
						path: 'groupPath/'
					},
					{
						name: 'other group',
						path: 'otherFolder',
						children: [
							{
								name: 'inner',
								path: 'inner'
							}
						]
					}
				]
			},
			{
				name: 'test',
				path: 'test'
			}
		];
		gm(groups);

		let res;
		
		res = gm('root').getPath();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path'));

		res = gm('root').getPath('something');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'something'));

		res = gm('group').getPath();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'groupPath/'));

		res = gm('group').getPath('file');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'groupPath/', 'file'));

		res = gm('other group').getPath();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'otherFolder'));

		res = gm('other group').getPath('index');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'otherFolder', 'index'));

		res = gm('test').getPath();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, 'test'));

		res = gm('test').getPath('something');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, 'test', 'something'));
	});

	it('should configure gm using object as parameter', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const group = {
			name: 'root',
			path: '../path',
			children: [
				{
					name: 'group',
					path: 'groupPath/'
				},
				{
					name: 'other group',
					path: 'otherFolder',
					children: [
						{
							name: 'inner',
							path: 'inner'
						}
					]
				}
			]
		};
		gm(group);

		let res;
		
		res = gm('root').getPath();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path'));

		res = gm('root').getPath('something');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'something'));

		res = gm('group').getPath();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'groupPath/'));

		res = gm('group').getPath('file');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'groupPath/', 'file'));

		res = gm('other group').getPath();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'otherFolder'));

		res = gm('other group').getPath('index');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'otherFolder', 'index'));
	});

	it('should require module', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		gm('root').assignTo('./');

		const actual = gm('root').require('someModuleForTests');
		clearCache('./someModuleForTests');
		const expected = require('./someModuleForTests');

		actual.should.be.an.Object();
		actual.should.be.eql(expected);
	});
});