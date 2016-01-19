'use strict';
const proxyquire = require('proxyquire').noPreserveCache();
const should = require('should');
const path = require('path');

const GROUPED_MODULES = '../index.js';

function requireOneTime(pathToModule) {
	delete require.cache[require.resolve(pathToModule)];
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
		const errorMessage = 'Group name must be a string, object or array';

		gm.bind(null, 4).should.throw(errorMessage);
		gm.bind(null, true).should.throw(errorMessage);
		gm.bind(null, () => {}).should.throw(errorMessage);
		gm.bind(null, /re/).should.throw(errorMessage);
	});

	it('should throw error if there is no group added', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'root';

		const errorMessage = `There is no group with '${groupName}' name. Please use gm('${groupName}').assignTo('path/to/group')`;

		gm(groupName).get.should.throw(errorMessage);
	});

	it('should return nothing if we call it with object or array', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		
		should(gm({
			name: 'root',
			path: 'root'
		})).be.undefined();

		should(gm([{
			name: 'root',
			path: 'root'
		},{
			name: 'root2',
			path: 'root2'
		}
		])).be.undefined();
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

		res = gm(groupName).get();
		should(res).be.String();
		res.should.be.eql(absGroupPath);

		res = gm(groupName).get(innerModulePath);
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

		res = gm(innerGroupName).get();
		should(res).be.String();
		res.should.be.eql(absInnerGroupPath);

		res = gm(innerGroupName).get(innerModulePath);
		should(res).be.String();
		res.should.be.eql(absInnerModulePath);
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
		
		res = gm('root').get();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path'));

		res = gm('root').get('something');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'something'));

		res = gm('group').get();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'groupPath/'));

		res = gm('group').get('file');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'groupPath/', 'file'));

		res = gm('other group').get();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'otherFolder'));

		res = gm('other group').get('index');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'otherFolder', 'index'));

		res = gm('test').get();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, 'test'));

		res = gm('test').get('something');
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
		
		res = gm('root').get();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path'));

		res = gm('root').get('something');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'something'));

		res = gm('group').get();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'groupPath/'));

		res = gm('group').get('file');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'groupPath/', 'file'));

		res = gm('other group').get();
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'otherFolder'));

		res = gm('other group').get('index');
		should(res).be.String();
		res.should.be.eql(path.resolve(__dirname, '../path', 'otherFolder', 'index'));
	});
});