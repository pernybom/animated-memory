import React, { Component } from 'react';
import './App.css';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import axios from 'axios';
import Cookies from 'js-cookie';

const generateRoom = object => {
  //walls
  const roomSize = 100;
  const positions = [
    [roomSize, roomSize, 0],
    [-roomSize, roomSize, 0],
    [0, 1.2 * roomSize, 0],
    [0, 0, 0],
    [0, roomSize, roomSize],
    [0, roomSize, -roomSize]
  ];
  let geometry = new THREE.PlaneBufferGeometry(roomSize * 2, roomSize * 2);
  positions.forEach(position => {
    let material = new THREE.MeshPhongMaterial({
      color: Math.random() * 0xffffff
    });
    let plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    plane.position.set(position[0], position[1], position[2]);
    plane.lookAt(0, roomSize, 0);
    object.scene.add(plane);
  });

  //desk
  const deskSize = 6;
  let deskGeometry = new THREE.BoxBufferGeometry(
    roomSize * 0.8,
    deskSize,
    deskSize
  );
  let deskMaterial = new THREE.MeshPhongMaterial({
    color: 0xff0a30
  });
  let desk = new THREE.Mesh(deskGeometry, deskMaterial);
  desk.position.set(0, deskSize / 2, -roomSize * 0.6);
  desk.receiveShadow = true;
  desk.castShadow = true;
  object.scene.add(desk);
  //products
  const cubeSize = 6;
  const shelfSize = 2;
  let cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

  let xCoord = -roomSize * 0.6;
  let yCoord = 10 + cubeSize / 2 + shelfSize;

  object.products.data.forEach((product, index) => {
    let cubeCanvas = document.createElement('canvas');
    let cubeCanvasContext = cubeCanvas.getContext('2d');
    cubeCanvas.width = cubeCanvas.height = 256;
    cubeCanvasContext.shadowColor = '#000';
    cubeCanvasContext.shadowBlur = 7;
    cubeCanvasContext.fillStyle = 'orange';
    cubeCanvasContext.font = '15pt arial bold';
    cubeCanvasContext.fillText(product.item + ' ' + product.price, 0, 128);

    let cubeMaterial = new THREE.MeshPhongMaterial({
      map: new THREE.Texture(cubeCanvas)
    });
    cubeMaterial.map.needsUpdate = true;

    let cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.data = product;
    cube.velocity = new THREE.Vector3(0, 0, 0);
    cube.position.set(xCoord, yCoord, -97);
    xCoord += cubeSize * 4 - 2;
    if ((index + 1) % 6 === 0) {
      xCoord = -roomSize * 0.6;
      yCoord += 15;
    }
    cube.doubleSided = true;

    cube.castShadow = true;
    cube.receiveShadow = true;
    object.cubeArray.push(cube);
    object.scene.add(cube);
  });

  //shelves
  let shelfGeometry = new THREE.BoxBufferGeometry(
    1.5 * roomSize,
    shelfSize,
    3 * shelfSize
  );
  let shelfMaterial = new THREE.MeshPhongMaterial({
    color: 0x014f15
  });

  for (let i = 10 + shelfSize / 2; i < 71; i += 15) {
    let shelf = new THREE.Mesh(shelfGeometry, shelfMaterial);
    shelf.position.set(0, i, -97);
    shelf.castShadow = true;
    shelf.receiveShadow = true;
    object.scene.add(shelf);
  }
};

export default generateRoom;
