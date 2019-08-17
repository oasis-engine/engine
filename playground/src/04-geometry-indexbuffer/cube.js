import { DataType } from '@alipay/o3-base';
import { IndexBufferGeometry } from '@alipay/o3-geometry';

function createCubeGeometry(size) {
  var indexValues = [
    0,2,1,3,1,2,0,4,2,6,2,4,5,1,7,3,7,1,6,7,2,3,2,7,0,1,4,5,4,1,4,5,6,7,6,5
  ];

  //-- crete object
  var geometry = new IndexBufferGeometry('cubeIndexGeometry');
  geometry.initialize([
    { semantic: 'POSITION', size: 3, type: DataType.FLOAT, normalized: false},
    { semantic: 'COLOR', size: 3, type: DataType.FLOAT, normalized: false}
  ], 8, indexValues);

  //--
  var pos = [
    [-size, -size, -size],
    [size, -size, -size],
    [-size, size, -size],
    [size, size, -size],
    [-size, -size, size],
    [size, -size, size],
    [-size, size, size],
    [size, size, size]
  ];

  var colors = [
    [0, 0, 0],
    [0.33, 0.33, 0.33],
    [0.33, 0.33, 0.33],
    [0.66, 0.66, 0.66],
    [0.33, 0.33, 0.33],
    [0.66, 0.66, 0.66],
    [0.66, 0.66, 0.66],
    [1.0, 1.0, 1.0]
  ];

  for(var i = 0; i < 8; i++) {
    var values = {
      'POSITION': pos[i],
      'COLOR': colors[i]
    }
    geometry.setVertexValues(i, values)
  }

  return geometry;
}

export default createCubeGeometry;
