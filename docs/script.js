function downloadStickers() {
  var url = document.getElementById('url').value;
  var errorMessageElement = document.getElementById('error-message');
  var successMessageElement = document.getElementById('success-message');
  errorMessageElement.innerHTML = ''; // エラーメッセージを初期化

  // Check if the URL is correct
  if (!url.includes('store.line.me')) {
    errorMessageElement.style.display = 'block';
    errorMessageElement.innerHTML = '正しいURLを入力してください';
    return;
  }

  // Fetch metadata
  var id = url.match(/product\/(\d+)\//)[1];
  var metaUrl = 'http://dl.stickershop.line.naver.jp/products/0/0/1/' + id + '/android/productInfo.meta';

  fetch(metaUrl)
    .then(function(response) {
      return response.json();
    })
    .then(function(metadata) {
      var stickerIds = metadata.stickers.map(function(sticker) {
        return sticker.id;
      });
      var stickerTitle = metadata.title.ja.replace(/[<>:"/\\|?*]/g, '');

      var downloadDir = stickerTitle;
      
      // Download stickers
      var downloadPromises = stickerIds.map(function(stickerId, index) {
        var stickerUrl = 'http://dl.stickershop.line.naver.jp/products/0/0/1/' + id + '/android/stickers/' + stickerId + '.png';
        return fetch(stickerUrl)
          .then(function(response) {
            return response.blob();
          })
          .then(function(blob) {
            return { blob: blob, filename: id + '_' + index.toString().padStart(2, '0') + '.png' };
          });
      });

      Promise.all(downloadPromises)
        .then(function(stickerDataArray) {
          // Create and download ZIP file
          createAndDownloadZip(downloadDir, stickerTitle, stickerDataArray);
          // Display success message
          successMessageElement.style.display = 'block';
        });
    })
    .catch(function(error) {
      errorMessageElement.style.display = 'block';
      errorMessageElement.innerHTML = 'メタデータの取得中にエラーが発生しました。';
      console.error(error);
    });
}


function createAndDownloadZip(directory, zipFilename, stickerDataArray) {
  var zip = new JSZip();
  var folder = zip.folder(zipFilename);

  // Add stickers to the zip folder
  stickerDataArray.forEach(function(stickerData) {
    folder.file(stickerData.filename, stickerData.blob);
  });

  // Generate and save the zip file
  zip.generateAsync({ type: 'blob' })
    .then(function(content) {
      saveBlob(content, '', zipFilename + '.zip');
    });
}

function saveBlob(blob, directory, filename) {
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(a.href);
}
