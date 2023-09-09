// ==UserScript==
// @name         B站字幕遮挡工具-第二语言学习(Subtitle-Overlay)
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Create a floating button and resizable rectangle
// @author       You
// @match        *://*/*
// @license      MIT License
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  let rectangle = null;
  let isResizing = false;
  let isMoving = false;
  let isButtonMoving = false;
  let lastDownX = 0;
  let lastDownY = 0;
  let hideButtonTimeout = null;

  // 防抖函数
  function debounce(func, wait) {
    let timeout;
    return function () {
      let context = this;
      let args = arguments;
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        func.apply(context, args);
      }, wait);
    }
  }

  // 使用
  let debouncedEventHandler = function(rawHandler){
    return debounce(rawHandler, 100);
  }

  function getFullscreenElement() {
    return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
  }

  function appendElement(element) {
    const fullscreenElement = getFullscreenElement();
    if (fullscreenElement) {
      fullscreenElement.appendChild(element);
    } else {
      document.body.appendChild(element);
    }
  }

  function handleFullscreenChange() {
    const fullscreenElement = getFullscreenElement();
    if (button.parentElement) {
      button.parentElement.removeChild(button);
    }
    if (rectangle && rectangle.parentElement) {
      rectangle.parentElement.removeChild(rectangle);
    }
    appendElement(button);
    if (rectangle) {
      appendElement(rectangle);
    }
    // 显示圆球按钮
    showButton();
  }

  function resetHideButtonTimeout() {
    if (hideButtonTimeout) {
      clearTimeout(hideButtonTimeout);
    }
    hideButtonTimeout = setTimeout(() => {
      button.style.display = 'none';
    }, 2000);
  }

  function showButton() {
    button.style.display = 'block';
    resetHideButtonTimeout();
  }

  document.addEventListener('fullscreenchange', handleFullscreenChange);
  document.addEventListener('mozfullscreenchange', handleFullscreenChange);
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
  document.addEventListener('MSFullscreenChange', handleFullscreenChange);

  // Create the floating button
  const button = document.createElement('button');
  button.textContent = 'R';
  button.style.position = 'fixed';
  button.style.zIndex = '9999';
  button.style.left = '20px';
  button.style.bottom = '100px';
  button.style.width = '30px';
  button.style.height = '30px';
  button.style.borderRadius = '50%';
  button.style.background = 'rgb(220, 53, 69)';
  button.style.color = 'white';
  button.style.cursor = 'move';

  // 点击按钮时创建矩形
  button.addEventListener('click',debouncedEventHandler( (e) => {
    e.stopPropagation();
    if (rectangle) {
      rectangle.parentNode.removeChild(rectangle);
      rectangle = null;
    } else {
      rectangle = document.createElement('div');
      rectangle.style.position = 'fixed';
      rectangle.style.zIndex = '9999';
      rectangle.style.left = '50px';
      rectangle.style.bottom = '50px';
      rectangle.style.width = '200px';
      rectangle.style.height = '200px';
      rectangle.style.background = 'rgba(255, 255, 255, 0.2)';
      rectangle.style.backdropFilter = 'blur(4px)'
      rectangle.style.cursor = 'move';
      appendElement(rectangle);

      // Create resizable handle
      const div = document.createElement('div');
      div.style.width = '10px';
      div.style.height = '10px';
      div.style.background = 'rgba(255, 255, 255, 0.2)';
      div.style.backdropFilter = 'blur(4px)'
      div.style.borderRadius = '50%';
      div.style.position = 'absolute';
      div.style.cursor = 'se-resize';
      div.style.zIndex = '10000';
      div.style.right = '-5px';
      div.style.bottom = '-5px';
      rectangle.appendChild(div);

      // 绑定鼠标按下事件
      rectangle.addEventListener('mousedown', (e) => {
        e.preventDefault(); // 将 e.preventDefault() 移动到这里
        if (e.target === rectangle) {
          isMoving = true;
        } else {
          isResizing = true;
        }

        lastDownX = e.clientX;
        lastDownY = e.clientY;
      });

      // 绑定鼠标拖拽事件
      document.addEventListener('mousemove', (e) => {
        if (isMoving) {
          rectangle.style.left = (rectangle.offsetLeft - lastDownX + e.clientX) + 'px';
          rectangle.style.top = (rectangle.offsetTop - lastDownY + e.clientY) + 'px';
          lastDownX = e.clientX;
          lastDownY = e.clientY;
        }
        if (isResizing) {
          const offsetX = e.clientX - lastDownX;
          const offsetY = e.clientY - lastDownY;

          rectangle.style.width = (rectangle.offsetWidth + offsetX) + 'px';
          rectangle.style.height = (rectangle.offsetHeight + offsetY) + 'px';

          lastDownX = e.clientX;
          lastDownY = e.clientY;
        }
      });

      // 绑定鼠标抬起事件
      document.addEventListener('mouseup', () => {
        isMoving = false;
        isResizing = false;
      });
    }
  }));

  // 绑定按钮鼠标按下事件
  button.addEventListener('mousedown', debouncedEventHandler((e) => {
    e.preventDefault(); // 将 e.preventDefault() 移动到这里
    e.stopPropagation();
    isButtonMoving = true;
    lastDownX = e.clientX;
    lastDownY = e.clientY;
  }));

  // 绑定按钮鼠标拖拽事件
  document.addEventListener('mousemove', debouncedEventHandler((e) => {
    if (isButtonMoving) {
      button.style.left = (button.offsetLeft - lastDownX + e.clientX) + 'px';
      button.style.top = (button.offsetTop - lastDownY + e.clientY) + 'px';
      lastDownX = e.clientX;
      lastDownY = e.clientY;
    }
  }));

  // 绑定按钮鼠标抬起事件
  document.addEventListener('mouseup', debouncedEventHandler(() => {
    isButtonMoving = false;
  }));

  // 绑定鼠标移动事件，显示圆球
  document.addEventListener('mousemove', debouncedEventHandler(() => {
    showButton();
  }));

  // 绑定鼠标点击事件，显示圆球
  document.addEventListener('mousedown', debouncedEventHandler(() => {
    showButton();
  }));

  appendElement(button);
  resetHideButtonTimeout();

})();
