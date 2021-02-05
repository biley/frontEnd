## TypeScript
### 1. 基本类型
TS 支持与 JS 几乎相同的数据类型，此外还提供来一些其他类型以方便使用：
1. boolean、number、string
2. 数组：`let list: number[] = [1, 2]`或`let list: Array<number> = [1, 2]`;
3. 元祖（Tuple）：`let x: [string, number]` 允许表示一个已知元素数量和类型的数组，对应位置的元素为对应的类型。当发生越界后，会使用联合类型来替代，进行后续操作。
4. 枚举（enum）：`enum Color { Red }`是对 JS 标准数据类型的一个补充，可以为一组**数值**赋予友好的名字：
    - 默认情况从 0 开始为元素编号，也可以手动指定成员的值，之后再递增。
    - 另一个便利是可以由枚举的值得到名字，可以认为定义枚举时：
      ```js
      var Color;
      (function (Color) {
        Color[Color['Red'] = 0] = "Red";
      })(Color || (Color = {}))
      //Color.Red = 0; Color[0] = "Red";
      ```
5. Any：不希望类型检查器对这些值进行检查而是直接让它们通过编译阶段的检查，一般用于那些在编程阶段还不清楚类型的变量。

   在对现有代码进行改的对时候，any 类型十分有用，它允许在编译时可选择地包含或移除类型检查。

   当只知道一部分数据的类型时，any 也很有用，比如包含来不同类型的数组。

6. void：表示没有任何类型。一个没有返回值的函数，其返回的类型是 void；而一个 void 类型的变量，只能赋值 undefined 和 null。
7. Null 和 Undefined：默认情况下是除了 never 之外类型的子类型，因此可以赋值给其他几乎所有类型的变量。指定了 --strictNullChecks 标记后，null 和 undefined 只能赋值给 void 和自身类型的变量；在某处可能传入多种类型变量的话，可以使用联合类型。
8. never：表示那些用不存在的值的类型，比如总是会抛出异常的函数等。never 是所有类型的子类型，除了自身，没有其他类型可以赋值给它，即使是 any 也不行。
9. Object：引用类型。

**类型断言**

有时开发人员会比 TS 更了解某个值的详细信息，通常是知道一个实体具有比现有类型更确切的类型。类型断言好比其他语言中的类型转换，但是不进行特殊的数据检查和解构，它没有运行时的影响，只是在编译阶段起作用。

类型断言有两种形式，假设有变量 `let value: any = "this is a string"`：
- 尖括号语法：`let strLength: number = (<string>value).length`。
- `as`语法：`let strLength: number = (value as string).length`。在 TS 中使用 JSX 时，只有 as 语法断言被允许。
