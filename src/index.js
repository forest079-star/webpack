// 試著關閉 console.log 的檢查
import $ from "jquery";
import './css/app.scss';
// import { add } from '@/utils';
import foo from './IMHappyCode'


/* // 這裡有測試 eslint 的 code
var abc=10
var test = function(a,b ){
return a+b
}
// */

console.log("i'm_happy", foo(2,3));
// console.log(add(1, 1));

$(() => {
  console.log('hi jQuery Ready');
});


// 排除 eslint
var ignoreESLintLine = 0; // eslint-disable-line

/* eslint-disable */
var a = 0;
var b = 1;
/* eslint-enable */



