'use strict';

const matrix = {};

//矩阵对称
matrix.transpose = arr => {
  const result = new Array(arr[0].length);

  for(let i = 0; i < arr[0].length; i++) {
    result[i] = new Array(arr.length);

    for(let j = 0; j < arr.length; j++) {
      result[i][j] = arr[j][i];
    }
  }

  return result;
};

//矩阵乘法
matrix.multiply = (arrA, arrB) => {
    if(arrA[0].length !== arrB.length) {
        throw new Error('Matrix mismatch');
    }

    const result = new Array(arrA.length);
    for (let x = 0; x < arrA.length; x++) {
        result[x] = new Array(arrB[0].length);
    }

    const arrB_T = matrix.transpose(arrB);

    for (var i = 0; i < result.length; i++) {
        for (var j = 0; j < result[i].length; j++) {
            result[i][j] = matrix.dotproduct(arrA[i], arrB_T[j]);
        }
    }
    return result;
};

//向量点乘
matrix.dotproduct = (vectorA, vectorB) => {
  if (vectorA.length !== vectorB.length) {
    throw new Error('Vector mismatch');
  }

  let result = 0;
  for(let i = 0; i < vectorA.length; i++) {
    result += vectorA[i] * vectorB[i];
  }
  return result;
};

export default matrix;
