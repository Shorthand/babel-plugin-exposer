export function test() {
  console.log('text');
}

export default function initTest() {
  console.log('initTest');
  test();
}
