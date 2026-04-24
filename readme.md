\# Web Canvas to PDF Extractor



A lightweight Chrome extension that captures locally rendered HTML5 `<canvas>` elements and image blobs from web document viewers and stitches them into a single, offline PDF file. 



This tool was built to enhance accessibility (enabling offline OCR for screen readers) and to facilitate offline studying for educators and students who need stable access to their study materials.



☕ \*\*\[Link to your Buy Me a Coffee / Ko-fi here]\*\* - \*If this tool saved you hours of manual screenshots, consider buying me a coffee!\*



\## Installation (Unpacked)

Because this extension interacts with local DOM elements on complex web viewers, it is not hosted on the Chrome Web Store. You can install it locally in Developer Mode:



1\. Download this repository as a `.zip` file and extract it to a folder.

2\. Download the required \[jsPDF library (v2.5.1)](https://unpkg.com/jspdf@2.5.1/dist/jspdf.umd.min.js) and place `jspdf.umd.min.js` directly inside the extracted folder.

3\. Open your browser and navigate to `chrome://extensions/` (or equivalent for your Chromium browser).

4\. Toggle \*\*Developer mode\*\* ON (usually in the top right corner).

5\. Click \*\*Load unpacked\*\* and select the folder containing your extension files.



\## Usage

1\. Open your target web document viewer.

2\. \*\*Scroll completely to the bottom\*\* of the document. The extension can only capture pages that your browser has actually loaded into memory.

3\. Click the extension icon in your toolbar.

4\. Confirm the page count in the prompt, and the script will generate your PDF.



\## ⚠️ Disclaimer \& Terms of Use

This tool is provided strictly for \*\*educational purposes, offline personal studying, and accessibility enhancement\*\*. 



\* This extension does not bypass server-side authentication; you can only extract documents your account already has legitimate access to view.

\* Users are solely responsible for ensuring they have the explicit right to download, store, and manipulate the content they extract.

\* Do not use this tool to distribute copyrighted material or intellectual property without the owner's consent.

\* The author of this extension assumes no liability for how this tool is used or any violation of third-party Terms of Service. Provided "AS IS" under the MIT License.

