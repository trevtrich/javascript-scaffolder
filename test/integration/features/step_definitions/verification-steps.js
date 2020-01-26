import {Given} from 'cucumber';

Given(/^the project will not be tested$/, async function () {
  this.unitTestAnswer = false;
  this.integrationTestAnswer = false;
  this.tested = false;
});

Given(/^the project will not be transpiled or linted$/, async function () {
  this.transpilationLintAnswer = false;
  this.transpileAndLint = false;
});
