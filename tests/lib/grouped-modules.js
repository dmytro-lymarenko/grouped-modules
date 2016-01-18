'use strict';
const proxyquire = require('proxyquire').noPreserveCache();
const sinon = require('sinon');
const should = require('should');
const path = require('path');

const GROUPED_MODULES = '../../lib/grouped-modules';

function requireOneTime(pathToModule) {
	delete require.cache[require.resolve(pathToModule)];
	return require(pathToModule);
}

describe('grouped-modules.js', () => {
	it('should work', () => {
		true.should.be.true();
	});

	it('should throw error if there is no group name in gm', () => {
		const gm = requireOneTime(GROUPED_MODULES);

		gm.should.throw('Not specified group name');
	});

	it('should throw error if group name is not a string', () => {
		const gm = requireOneTime(GROUPED_MODULES);

		gm.bind(null, 4).should.throw('Group name must be a string');
		gm.bind(null, {}).should.throw('Group name must be a string');
		gm.bind(null, []).should.throw('Group name must be a string');
		gm.bind(null, () => {}).should.throw('Group name must be a string');
		gm.bind(null, /re/).should.throw('Group name must be a string');
	});

	it('should throw error if there is no group added', () => {
		const gm = requireOneTime(GROUPED_MODULES);

		const groupName = 'root';

		gm(groupName).get.should.throw(`There is no group with '${groupName}' name. Please use gm('${groupName}').assignTo('path/to/group').`);
	});

	it('should save group name and path to it that must be changed to absolute', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'module';
		const groupPath = '../path';
		const absGroupPath = path.resolve(groupPath);

		const innerModulePath = 'inner/module';
		const absInnerModulePath = path.resolve(groupPath, innerModulePath);

		gm(groupName).assignTo(groupPath);

		let res;

		res = gm(groupName).get();
		should(res).be.String();
		res.should.be.eql(absGroupPath);

		res = gm(groupName).get(innerModulePath);
		should(res).be.String();
		res.should.be.eql(absInnerModulePath);
	});

	it('should build inner groups', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		const groupName = 'module';
		const groupPath = '../path';
		const absGroupPath = path.resolve(groupPath);

		const innerGroupName = 'innerGroupName';
		const innerGroupPath = 'innerGroup/path';
		const absInnerGroupPath = path.resolve(groupPath, innerGroupPath);

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
		//gm('group').assignTo('../../'); // set group path
		//gm('group').get(); // return group path
		//gm('group').get('module name'); // return path to module name that is in group
		//gm('new group').in('group').assignTo('path to new group relatively to group path');
		// ...
		//gm('new group').get();
		// or
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
		res.should.be.eql(path.resolve('../path'));

		res = gm('root').get('something');
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'something'));

		res = gm('group').get();
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'groupPath/'));

		res = gm('group').get('file');
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'groupPath/', 'file'));

		res = gm('other group').get();
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'groupPath/', 'other group'));

		res = gm('other group').get('index');
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'groupPath/', 'other group', 'index'));

		res = gm('test').get();
		should(res).be.String();
		res.should.be.eql(path.resolve('test'));

		res = gm('test').get('something');
		should(res).be.String();
		res.should.be.eql(path.resolve('test', 'something'));
	});

	it('should configure gm using object as parameter', () => {
		const gm = requireOneTime(GROUPED_MODULES);
		//gm('group').assignTo('../../'); // set group path
		//gm('group').get(); // return group path
		//gm('group').get('module name'); // return path to module name that is in group
		//gm('new group').in('group').assignTo('path to new group relatively to group path');
		// ...
		//gm('new group').get();
		// or
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
		res.should.be.eql(path.resolve('../path'));

		res = gm('root').get('something');
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'something'));

		res = gm('group').get();
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'groupPath/'));

		res = gm('group').get('file');
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'groupPath/', 'file'));

		res = gm('other group').get();
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'groupPath/', 'other group'));

		res = gm('other group').get('index');
		should(res).be.String();
		res.should.be.eql(path.resolve('../path', 'groupPath/', 'other group', 'index'));
	});
});