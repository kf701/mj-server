'use strict';
var algo_mj = require('./../algo_mj');
var assert = require('assert');

describe('Algo_mj', function() {
    describe('#checkHoldsChi', function() {
        it('检查各种情况下是否能被吃', function() {
            assert.equal(true, algo_mj.checkHoldsChi([0,1,2,3,4,5,6,7,8,9,10,11,12,13], 0));
            assert.equal(false, algo_mj.checkHoldsChi([0,1,1,3,4,5,6,7,8,9,10,11,12,13], 0));
            assert.equal(true, algo_mj.checkHoldsChi([0,1,2,3,4,6,7,7,8,9,10,11,12,13], 4));
            assert.equal(true, algo_mj.checkHoldsChi([0,1,1,3,4,5,7,7,8,9,10,11,12,13], 4));
            assert.equal(true, algo_mj.checkHoldsChi([0,1,1,1,4,5,6,7,8,9,10,11,12,13], 4));
            assert.equal(false, algo_mj.checkHoldsChi([0,1,2,2,4,5,7,7,8,9,10,11,12,13], 4));
            assert.equal(false, algo_mj.checkHoldsChi([0,1,1,4,4,5,5,7,8,9,10,11,12,13], 4));
            assert.equal(false, algo_mj.checkHoldsChi([0,1,1,3,4,6,6,7,8,9,10,11,12,13], 4));
            assert.equal(true, algo_mj.checkHoldsChi([1,2,3,4,5,6,9,9,9,10,11,12,13], 7));
            assert.equal(true, algo_mj.checkHoldsChi([1,2,3,4,4,6,7,8,9,10,11,12,13], 7));
            assert.equal(false, algo_mj.checkHoldsChi([1,2,3,4,5,5,8,8,9,10,11,12,13], 7));
            assert.equal(true, algo_mj.checkHoldsChi([1,2,3,4,5,6,7,8,9,10,11,12,13], 8));
            assert.equal(false, algo_mj.checkHoldsChi([1,2,3,4,5,6,8,8,9,10,11,12,13], 8));
            assert.equal(false, algo_mj.checkHoldsChi([0,1,2,3,4,5,6,7,8,9,10,11,12,13], 18));
            assert.equal(false, algo_mj.checkHoldsChi([0,1,2,3,4,5,6,7,8,9,10,11,12,13], 27));
        });
    });
});
