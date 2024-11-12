export default class Test {
  constructor() {
    this.testArray = [];
    const test = () => {
      this.testArray.push([3, 25, 1]);
    }
    let array = [1, 234, 43, 12]
    this.testArray.push(array);
    test();
    console.log(JSON.stringify(this.testArray));

    
  }
  
}
