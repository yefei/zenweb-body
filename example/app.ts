import { Core } from '@zenweb/core';
import inject from '@zenweb/inject';
import result from '@zenweb/result';
import messagecode from '@zenweb/messagecode';
import helper from '@zenweb/helper';
import body, { BodyHelper } from '../src';

const app = new Core();
app.setup(result());
app.setup(inject());
app.setup(messagecode());
app.setup(helper());
app.setup(body());
app.setup(function test(setup) {
  setup.middleware(async ctx => {
    const body = await ctx.injector.getInstance(BodyHelper);
    ctx.body = body.get({ age: '!int' });
  });
})
app.start();
