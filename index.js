PDFJS.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

var pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    scale = 1,
    canvas = document.getElementById('canvas'),
    ctx = canvas.getContext('2d');
var pdf = new jsPDF();
var urls = [];

function renderPage(num, callback) {
  pageRendering = true;
  // Using promise to fetch the page
  pdfDoc.getPage(num).then(function(page) {
    var viewport = page.getViewport(scale);
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);

    // Wait for rendering to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      callback();
    });
  });
}

function addCanvasDisplayToResultPDF() {
  // only jpeg is supported by jsPDF
  var imgData = canvas.toDataURL("image/jpeg", 1.0);
  pdf.addImage(imgData, 'JPEG', 0, 0);
}

function loadPdfs(urls) {
  var url = urls.shift();
  var lastImport = urls.length === 0;

  PDFJS.getDocument(url).then(function(pdfDoc_) {
    pdfDoc = pdfDoc_;

    // Initial/first page rendering
    var pageIndex = 1;
    function renderCallback() {
      addCanvasDisplayToResultPDF();

      var lastPage = lastImport && pageIndex === pdfDoc.numPages;
      if (!lastPage) pdf.addPage();

      pageIndex++;
      if (pageIndex > pdfDoc.numPages) return;

      renderPage(pageIndex, renderCallback);
    }
    renderPage(pageIndex, renderCallback);

    loadPdfs(urls);
  });
}

urls.push('https://cdn.mozilla.net/pdfjs/helloworld.pdf');
urls.push('https://cdn.mozilla.net/pdfjs/tracemonkey.pdf');
loadPdfs(urls);

/*

// Asynchronous download of PDF
var loadingTask = PDFJS.getDocument(url);
loadingTask.promise.then(function(pdf) {
  console.log('PDF loaded');

  // Fetch the first page
  var pageNumber = 1;
  pdf.getPage(pageNumber).then(function(page) {
    console.log('Page loaded');

    var scale = 1.5;
    var viewport = page.getViewport(scale);

    // Prepare canvas using PDF page dimensions
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    // Render PDF page into canvas context
    var renderContext = {
      canvasContext: context,
      viewport: viewport
    };
    var renderTask = page.render(renderContext);
    renderTask.then(function () {
      console.log('Page rendered');
    });
  });
}, function (reason) {
  // PDF loading error
  console.error(reason);
});
*/
download.addEventListener("click", function() {
  pdf.save("download.pdf");
}, false);
