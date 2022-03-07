import { Core } from '@zenweb/core';
import log from '@zenweb/log';
import body from '../src';

const app = new Core();
app.setup(log());
app.setup(body({
  xml: true,
}));
app.setup(function test(setup) {
  setup.middleware((ctx) => {
    console.log('bodytype:', ctx.request.bodyType);
    console.log('body:', ctx.request.body);
  });
})
app.start();
