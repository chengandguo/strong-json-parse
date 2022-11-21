export default function (func, wait, ...args) {
  window.setTimeout(() => {
    func.apply(this, args);
  }, wait);
}