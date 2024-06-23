import { wordsChange, IWordsChangeType } from 'word-to-upper-lower';

/** 判断是否只有中文 */
export function isChinese(str: string) {
  return /^[\u4e00-\u9fff]+$/.test(str);
}

interface IEnumType {
  /** 枚举的中文描述 */
  chinese: string;
  /** 枚举的值 */
  value: number;
  /** 枚举的变量名 */
  variableName: string;
}

/** 把字符串中所有的数字都找出来，返回下标数组 */
function getNumberInString(str: string): number[] {
  const numberReg = /\d+/g;
  const result = [];
  let match
  // eslint-disable-next-line no-cond-assign
  while (match = numberReg.exec(str)) {
    result.push(match.index);
  }
  return result;
}

/** 根据说明获取枚举 */
export async function getEnumByDescAndVarFunc({ desc, varFunc }: { desc: string, varFunc: (desc: string) => Promise<string> }) {
  // 先找到各个数字的位，记录下来
  const res = getNumberInString(desc)
  if (res.length > 1) {
    // 把数字之间的字符串拿出来，去掉前后的标点符号，得到枚举的描述数组
    const descArr: IEnumType[] = []
    for (let i = 0; i < res.length; i++) {
      let subStr = desc.substring(res[i] + 1, res[i + 1]).trim()
      // 去掉开头的一些特殊符号
      subStr = subStr.replace(/[.、。，,]/, '')
      // 去掉结尾的一些特殊符号
      subStr = subStr.replace(/(.*)[.、。，,;；]/, '$1')
      if (subStr.length) {
        const variableName = await varFunc(subStr)
        if (variableName) {
          descArr.push({
            chinese: subStr,
            value: Number(desc.substring(res[i], res[i] + 1)),
            variableName: wordsChange({ words: variableName, type: IWordsChangeType.AllInitialUpper }),
          })
        }
      }
    }
    return descArr.length ? descArr : undefined
  }
  return undefined
}

export function enumTSFormat(enumArr: IEnumType[]) {
  const enumStr = enumArr.map((item) => `/** ${item.chinese} */\n${item.variableName} = ${item.value}`).join(',\n')
  return `
    export enum Enum {
      ${enumStr}
    } 
  `
}

