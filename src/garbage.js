const size = canvas.clientHeight / 1500;

let cubeArray = [];

// const generateCubes = () => {
//   const cubeOfCubeSize = 1;
//   for (
//     let xIndex = -cubeOfCubeSize;
//     xIndex <= cubeOfCubeSize;
//     xIndex += 5
//   ) {
//     for (
//       let yIndex = -cubeOfCubeSize;
//       yIndex <= cubeOfCubeSize;
//       yIndex += 5
//     ) {
//       for (
//         let zIndex = -cubeOfCubeSize;
//         zIndex <= cubeOfCubeSize;
//         zIndex += 5
//       ) {
//         var geometry = new THREE.BoxGeometry(size, size, size);

//         var material = new THREE.MeshPhongMaterial({
//           color: Math.random() * 0xffffff,
//           shininess: 100
//         });

//         var cube = new THREE.Mesh(geometry, material);
//         cube.castShadow = true;
//         cube.receiveShadow = true;
//         cube.position.set(xIndex, yIndex, zIndex);
//         cube.velocity = new THREE.Vector3(0, 0, 0);
//         cubeArray.push(cube);
//       }
//     }
//   }
// };
// generateCubes();
// cubeArray.forEach(cube => {
//   scene.add(cube);
// });
