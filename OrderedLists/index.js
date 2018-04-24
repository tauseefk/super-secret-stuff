document.addEventListener('DOMContentLoaded', (e) => {
  let list = document.querySelector('#list');
  let subList = document.querySelector('#subList');
  let subSubList = document.querySelector('#subSubList');
  list.addEventListener('change', (e) => {
    document.querySelector('label[for="list"]').textContent = e.target.value;
    Array.prototype.slice.call(document.querySelectorAll('body>ol')).map(el => {
      el.style.marginLeft = `${e.target.value}px`;
    });
  });
  subList.addEventListener('change', (e) => {
    document.querySelector('label[for="subList"]').textContent = e.target.value;
    Array.prototype.slice.call(document.querySelectorAll('body>ol>li>ol')).map(el => {
      el.style.marginLeft = `${e.target.value}px`;
    });
  });
  subSubList.addEventListener('change', (e) => {
    document.querySelector('label[for="subList"]').textContent = e.target.value;
    Array.prototype.slice.call(document.querySelectorAll('body>ol>li>ol>li>ol')).map(el => {
      el.style.marginLeft = `${e.target.value}px`;
    });
  });
});
