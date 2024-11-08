const dom = document.getElementById('sketch-path');
console.log('Hello World', dom.content);

// fetch(dom.content, {
//   responseType: 'blob'
// }).then((res) => {
//   console.log(res);

//   var zip = new JSZip();

//   zip.loadAsync(res.blob()).then((zipfiles) => {
//     console.log(zipfiles);

//     zipfiles
//       .file('previews/preview.png')
//       .async('uint8array')
//       .then((image) => {
//         const url = window.URL.createObjectURL(image);
//         const img = document.createElement('image');
//         img.src = url;
//         document.body.appendChild(img);
//       });
//   });
// });
