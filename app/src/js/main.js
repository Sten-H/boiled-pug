import $ from 'npm-zepto';

function* aGenerator() {
  var index = 1;
  while(true)
    yield index++;
}

const getPromise = () => {
  return new Promise(function(resolve, reject) {
    setTimeout(resolve, 100, true);
  })
}

$(() => {
  console.log('Can you do these things?');
  getPromise().then(val => console.log(`promise? ${!!val}`));
  var gen = aGenerator();  
  console.log('generator?', !!gen.next().value)
  console.log('includes?', ['suh', 'hehe', 'haha'].includes('hehe'));
})