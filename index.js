var PDFJS = require('./pdf.js');

class PdfReader {
   constructor(dataBuffer) {
      this.dataBuffer = dataBuffer;
   }

   async forEach(cb) {
      PDFJS.disableWorker = true;
      const document = await PDFJS.getDocument(this.dataBuffer);

      for (var i = 1; i <= document.pdfInfo.numPages; i++) {
         try {
            const pageData = await document.getPage(i);
            const lines = await this.renderPage(pageData);

            cb({ number: i, lines });
         } catch (ex) {
            cb(i, '');
         }
      }

      document.destroy();
   }

   renderPage(pageData) {
      const render_options = {
         normalizeWhitespace: false,
         disableCombineTextItems: false
      };

      return pageData
         .getTextContent(render_options)
         .then(function (textContent) {
            let lastY;
            let text = '';

            for (let item of textContent.items) {
               if (lastY == item.transform[5] || !lastY) {
                  text += item.str + ' ';
               } else {
                  text += '\n' + item.str + ' ';
               }

               lastY = item.transform[5];
            }
            
            return text.split('\n').map(line => line.trim());
         });
   }
}

module.exports = PdfReader;
