(async function() {
  // Prevent duplicate runs
  if (window.isExtractingPdf) {
    alert("Extraction is already in progress!");
    return;
  }

  // 1. SCAN FIRST: Find the pages before doing anything else
  let imgElements = document.getElementsByTagName("img");
  let validImgs = [];
  const checkURLString = "blob:https://drive.google.com/";

  for (let i = 0; i < imgElements.length; i++) {
    if (imgElements[i].src.startsWith(checkURLString)) {
      validImgs.push(imgElements[i]);
    }
  }

  if (validImgs.length === 0) {
    alert("No pages found! Scroll down the document a bit to load it first.");
    return;
  }

  // 2. THE FAILSAFE: Ask the user to verify the page count
  let userConfirmed = confirm(`We captured ${validImgs.length} pages in memory.\n\nIf your document has more pages than this, click "Cancel", scroll all the way to the bottom to load them, and try again.\n\nDo you want to generate the PDF with these ${validImgs.length} pages?`);
  
  if (!userConfirmed) {
    return; // Exit silently if they want to scroll more
  }

  // 3. PROCEED: Lock the extraction and build the safe UI
  window.isExtractingPdf = true;

  const ui = document.createElement('div');
  ui.style.cssText = `
    position: fixed; top: 60px; right: 30px; width: 320px; 
    background: white; border: 2px solid #1a73e8; border-radius: 8px; 
    padding: 20px; z-index: 2147483647; box-shadow: 0 10px 25px rgba(0,0,0,0.5); 
    font-family: Arial, sans-serif; pointer-events: none;
  `;

  const title = document.createElement('h4');
  title.style.cssText = 'margin: 0 0 10px 0; color: #333;';
  title.textContent = 'Canvas to PDF Extractor';
  ui.appendChild(title);

  const progressBar = document.createElement('progress');
  progressBar.id = 'pdf-progress';
  progressBar.value = 0;
  progressBar.max = 100;
  progressBar.style.cssText = 'width: 100%; height: 22px;';
  ui.appendChild(progressBar);

  const statusText = document.createElement('div');
  statusText.id = 'pdf-status';
  statusText.style.cssText = 'margin-top: 10px; font-weight: bold; color: #1a73e8; font-size: 14px; text-align: center;';
  statusText.textContent = 'Initializing...';
  ui.appendChild(statusText);
  
  document.documentElement.appendChild(ui);

  console.log("PDF Extraction Started!");

  try {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) throw new Error("Library failed to load.");

    let pdf = null;

    for (let i = 0; i < validImgs.length; i++) {
      let img = validImgs[i];
      let canvasElement = document.createElement("canvas");
      let con = canvasElement.getContext("2d");
      
      canvasElement.width = img.naturalWidth;
      canvasElement.height = img.naturalHeight;
      con.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight);
      
      let imgData = canvasElement.toDataURL("image/png");

      let orientation = img.naturalWidth > img.naturalHeight ? "l" : "p";
      let pageWidth = img.naturalWidth;
      let pageHeight = img.naturalHeight;

      if (i === 0) {
        pdf = new jsPDF({ orientation: orientation, unit: "px", format: [pageWidth, pageHeight] });
      } else {
        pdf.addPage([pageWidth, pageHeight], orientation);
      }

      pdf.addImage(imgData, "PNG", 0, 0, pageWidth, pageHeight, "", "SLOW");
      
      canvasElement.width = 0;
      canvasElement.height = 0;

      let percent = Math.floor(((i + 1) / validImgs.length) * 100);
      
      progressBar.value = percent;
      statusText.textContent = `Processing: ${percent}%`;
      console.log(`Processing page ${i + 1} of ${validImgs.length} (${percent}%)`);

      // 1ms pause to let the browser visually update the progress bar
      await new Promise(r => setTimeout(r, 1)); 
    }

    let titleText = document.querySelector('meta[itemprop="name"]')?.content || document.title || 'Extracted_Document';
    if (!titleText.toLowerCase().endsWith(".pdf")) titleText += ".pdf";

    statusText.textContent = "Downloading...";
    statusText.style.color = "green";
    console.log("Stitching complete. Triggering download...");
    
    pdf.save(titleText, { returnPromise: true }).then(() => {
      setTimeout(() => {
        ui.remove();
        window.isExtractingPdf = false;
      }, 3000);
    });

  } catch (e) {
    statusText.textContent = e.message;
    statusText.style.color = "red";
    console.error("Extraction failed: ", e.message);
    setTimeout(() => { 
      ui.remove(); 
      window.isExtractingPdf = false; 
    }, 5000);
  }
})();