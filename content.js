(async function() {
  if (window.isExtractingPdf) {
    alert("Extraction or Setup is already in progress!");
    return;
  }
  window.isExtractingPdf = true;

  // 1. SCAN FIRST: Find the loaded pages
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
    window.isExtractingPdf = false;
    return;
  }

  // 2. BUILD THE SETUP MENU (Bypassing TrustedHTML)
  const setupUi = document.createElement('div');
  setupUi.style.cssText = `
    position: fixed; top: 60px; right: 30px; width: 300px; 
    background: white; border: 2px solid #1a73e8; border-radius: 8px; 
    padding: 20px; z-index: 2147483647; box-shadow: 0 10px 25px rgba(0,0,0,0.5); 
    font-family: Arial, sans-serif;
  `;

  const setupTitle = document.createElement('h4');
  setupTitle.style.cssText = 'margin: 0 0 10px 0; color: #333;';
  setupTitle.textContent = 'Configure Extraction';
  setupUi.appendChild(setupTitle);

  const infoText = document.createElement('p');
  infoText.style.cssText = 'font-size: 13px; color: #555; margin-bottom: 15px;';
  infoText.textContent = `Found ${validImgs.length} pages in memory. Choose your range below (e.g., start at page 4 to skip promo pages).`;
  setupUi.appendChild(infoText);

  // Start Page Input
  const startDiv = document.createElement('div');
  startDiv.style.cssText = 'margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;';
  const startLabel = document.createElement('label');
  startLabel.textContent = 'Start Page:';
  startLabel.style.fontSize = '14px';
  const startInput = document.createElement('input');
  startInput.type = 'number';
  startInput.value = 1;
  startInput.min = 1;
  startInput.max = validImgs.length;
  startInput.style.cssText = 'width: 80px; padding: 4px;';
  startDiv.appendChild(startLabel);
  startDiv.appendChild(startInput);
  setupUi.appendChild(startDiv);

  // End Page Input
  const endDiv = document.createElement('div');
  endDiv.style.cssText = 'margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center;';
  const endLabel = document.createElement('label');
  endLabel.textContent = 'End Page:';
  endLabel.style.fontSize = '14px';
  const endInput = document.createElement('input');
  endInput.type = 'number';
  endInput.value = validImgs.length;
  endInput.min = 1;
  endInput.max = validImgs.length;
  endInput.style.cssText = 'width: 80px; padding: 4px;';
  endDiv.appendChild(endLabel);
  endDiv.appendChild(endInput);
  setupUi.appendChild(endDiv);

  // Buttons
  const btnDiv = document.createElement('div');
  btnDiv.style.cssText = 'display: flex; gap: 10px;';
  
  const cancelBtn = document.createElement('button');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style.cssText = 'flex: 1; padding: 8px; cursor: pointer; background: #f1f3f4; border: 1px solid #ccc; border-radius: 4px; color: #333;';
  
  const startBtn = document.createElement('button');
  startBtn.textContent = 'Extract PDF';
  startBtn.style.cssText = 'flex: 1; padding: 8px; cursor: pointer; background: #1a73e8; border: none; border-radius: 4px; color: white; font-weight: bold;';
  
  btnDiv.appendChild(cancelBtn);
  btnDiv.appendChild(startBtn);
  setupUi.appendChild(btnDiv);
  
  document.documentElement.appendChild(setupUi);

  // --- EVENT LISTENERS FOR THE MENU ---

  cancelBtn.addEventListener('click', () => {
    setupUi.remove();
    window.isExtractingPdf = false;
  });

  startBtn.addEventListener('click', async () => {
    let startIdx = parseInt(startInput.value) - 1; // Convert to 0-based array index
    let endIdx = parseInt(endInput.value); // Slice goes up to, but not including, the end

    // Basic validation
    if (startIdx < 0 || endIdx > validImgs.length || startIdx >= endIdx) {
      alert("Invalid page range. Please check your numbers.");
      return;
    }

    // Isolate only the images the user requested
    let targetImgs = validImgs.slice(startIdx, endIdx);
    
    // Remove the setup UI and build the Progress UI
    setupUi.remove();
    buildAndRunProgress(targetImgs);
  });

  // 3. THE EXTRACTION LOGIC (Runs after user clicks Extract)
  async function buildAndRunProgress(targetImgs) {
    const ui = document.createElement('div');
    ui.style.cssText = `
      position: fixed; top: 60px; right: 30px; width: 320px; 
      background: white; border: 2px solid #1a73e8; border-radius: 8px; 
      padding: 20px; z-index: 2147483647; box-shadow: 0 10px 25px rgba(0,0,0,0.5); 
      font-family: Arial, sans-serif; pointer-events: none;
    `;

    const title = document.createElement('h4');
    title.style.cssText = 'margin: 0 0 10px 0; color: #333;';
    title.textContent = 'Processing PDF...';
    ui.appendChild(title);

    const progressBar = document.createElement('progress');
    progressBar.value = 0;
    progressBar.max = 100;
    progressBar.style.cssText = 'width: 100%; height: 22px;';
    ui.appendChild(progressBar);

    const statusText = document.createElement('div');
    statusText.style.cssText = 'margin-top: 10px; font-weight: bold; color: #1a73e8; font-size: 14px; text-align: center;';
    statusText.textContent = 'Initializing...';
    ui.appendChild(statusText);
    
    document.documentElement.appendChild(ui);

    try {
      const { jsPDF } = window.jspdf;
      if (!jsPDF) throw new Error("Library failed to load.");

      let pdf = null;

      for (let i = 0; i < targetImgs.length; i++) {
        let img = targetImgs[i];
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

        let percent = Math.floor(((i + 1) / targetImgs.length) * 100);
        progressBar.value = percent;
        statusText.textContent = `Stitching Page ${i + 1} of ${targetImgs.length} (${percent}%)`;

        await new Promise(r => setTimeout(r, 1)); 
      }

      let titleText = document.querySelector('meta[itemprop="name"]')?.content || document.title || 'Extracted_Document';
      if (!titleText.toLowerCase().endsWith(".pdf")) titleText += ".pdf";

      // Optional: Append the page range to the file name so you know what it is!
      titleText = titleText.replace('.pdf', ` (Pages ${startInput.value}-${endInput.value}).pdf`);

      statusText.textContent = "Downloading...";
      statusText.style.color = "green";
      
      pdf.save(titleText, { returnPromise: true }).then(() => {
        setTimeout(() => {
          ui.remove();
          window.isExtractingPdf = false;
        }, 3000);
      });

    } catch (e) {
      statusText.textContent = e.message;
      statusText.style.color = "red";
      setTimeout(() => { 
        ui.remove(); 
        window.isExtractingPdf = false; 
      }, 5000);
    }
  }
})();
