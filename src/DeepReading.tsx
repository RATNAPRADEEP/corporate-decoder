import { useState } from "react";
import { FileText, Image as ImageIcon, LoaderCircle, UploadCloud } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import mammoth from "mammoth";
import { createWorker } from "tesseract.js";
import { analyzeMessage } from "./engine/analyzeMessage";
import { translateCorporateMessage } from "./engine/translateCorporate";
import type { Sensitivity } from "./engine/types";
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;
type Props = { text: string; onTextChange: (text: string) => void; sensitivity: Sensitivity };
const MAX_FILE_SIZE = 25 * 1024 * 1024;
const MAX_PDF_PAGES = 40;
function makeReadingNotes(text: string) {
  const lines = text.split(/\r?\n/).map(x => x.trim()).filter(Boolean);
  const headings = lines.filter(x => x.length < 100 && (/^(#{1,6}\s|\d+(?:\.\d+)*[.)]?\s|[A-Z][A-Z\s:&/-]{5,}$)/.test(x) || (x.length < 75 && x === x.toUpperCase())));
  const words = text.toLowerCase().match(/[a-z][a-z'-]{3,}/g) ?? [];
  const stop = new Set(["that","this","with","from","have","will","your","their","they","them","there","which","were","been","being","into","also","than","then","when","what","where","while","about","would","could","should","must","shall","such","more","most","some","each","only","over","under","after","before","between","through","these","those","other","very","does","done","because","here","https","http"]);
  const counts = new Map<string,number>();
  for (const word of words) if (!stop.has(word)) counts.set(word,(counts.get(word)??0)+1);
  const keyTerms = [...counts.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(([word,count])=>({word,count}));
  const paragraphs = text.split(/\n\s*\n/).map(x=>x.trim()).filter(x=>x.length>80);
  return {lines:lines.length,paragraphs:paragraphs.length,headings:headings.slice(0,12),keyTerms};
}
export default function DeepReading({text,onTextChange,sensitivity}:Props) {
  const [fileName,setFileName]=useState(""); const [status,setStatus]=useState(""); const [error,setError]=useState(""); const [busy,setBusy]=useState(false); const [notes,setNotes]=useState<ReturnType<typeof makeReadingNotes>|null>(null);
  async function readFile(file?:File) {
    if(!file)return; setError("");setNotes(null);
    if(file.size>MAX_FILE_SIZE){setError("This file is larger than 25 MB. Choose a smaller file.");return;}
    setBusy(true);setFileName(file.name);setStatus("Preparing local extraction…");
    try {
      const name=file.name.toLowerCase();let extracted="";
      if(name.endsWith(".pdf")||file.type==="application/pdf"){
        setStatus("Extracting PDF text locally…");const pdf=await pdfjsLib.getDocument({data:new Uint8Array(await file.arrayBuffer())}).promise;
        if(pdf.numPages>MAX_PDF_PAGES)throw new Error(`This PDF has ${pdf.numPages} pages. The local reader currently supports up to ${MAX_PDF_PAGES} pages per file.`);
        const pages:string[]=[];for(let n=1;n<=pdf.numPages;n++){setStatus(`Reading PDF page ${n} of ${pdf.numPages}…`);const page=await pdf.getPage(n);const content=await page.getTextContent();pages.push(content.items.map(item=>"str" in item?item.str:"").join(" "));}
        extracted=pages.join("\n\n");if(!extracted.trim())throw new Error("No selectable text was found. If this is a scanned PDF, upload page screenshots as images for OCR.");
      } else if(name.endsWith(".docx")||file.type.includes("wordprocessingml")){
        setStatus("Extracting DOCX text locally…");const result=await mammoth.extractRawText({arrayBuffer:await file.arrayBuffer()});extracted=result.value;
      } else if(name.endsWith(".txt")||name.endsWith(".md")||name.endsWith(".csv")||file.type.startsWith("text/")){
        setStatus("Reading text file locally…");extracted=await file.text();
      } else if(file.type.startsWith("image/")||/\.(png|jpe?g|webp|bmp|tiff?)$/i.test(name)){
        setStatus("Loading OCR engine in your browser…");const worker=await createWorker("eng");
        try{setStatus("Recognizing image text locally…");const result=await worker.recognize(file);extracted=result.data.text;}finally{await worker.terminate();}
      } else throw new Error("Unsupported file. Use PDF, DOCX, TXT, Markdown, CSV, PNG, JPG, WEBP, BMP, or TIFF.");
      if(!extracted.trim())throw new Error("No readable text was extracted from this file.");
      onTextChange(extracted);setNotes(makeReadingNotes(extracted));setStatus(`Extracted ${extracted.length.toLocaleString()} characters. Ready for local analysis.`);
    }catch(cause){setError(cause instanceof Error?cause.message:"Could not read this file.");setStatus("");}finally{setBusy(false);}
  }
  const analysis=text.trim()?analyzeMessage(text,sensitivity):null;const translation=text.trim()?translateCorporateMessage(text):"";const readingNotes=notes??(text.trim()?makeReadingNotes(text):null);
  return <div className="deep-reading">
    <div className="deep-upload"><div className="deep-upload-icon"><UploadCloud size={21}/></div><div className="deep-upload-copy"><strong>Drop a document, screenshot, or image</strong><span>PDF · DOCX · TXT · MD · CSV · PNG · JPG · WEBP · up to 25 MB</span></div><label className="deep-file-button">{busy?<LoaderCircle size={15} className="spin"/>:<FileText size={15}/>} {busy?"Reading…":"Choose file"}<input type="file" accept=".pdf,.docx,.txt,.md,.csv,.png,.jpg,.jpeg,.webp,.bmp,.tif,.tiff,application/pdf,image/*" disabled={busy} onChange={e=>{void readFile(e.target.files?.[0]);e.currentTarget.value="";}}/></label></div>
    <p className="deep-local-note"><ImageIcon size={13}/> Extraction runs in this browser. OCR may download language data; your file is not uploaded.</p>
    {status&&<p className="deep-status" aria-live="polite">{status}</p>}{error&&<p className="deep-error" role="alert">{error}</p>}{fileName&&<p className="deep-filename"><FileText size={13}/> {fileName}</p>}
    {readingNotes&&text.trim()?<><div className="deep-stats"><div><strong>{text.length.toLocaleString()}</strong><span>CHARACTERS</span></div><div><strong>{readingNotes.lines.toLocaleString()}</strong><span>NON-EMPTY LINES</span></div><div><strong>{readingNotes.paragraphs.toLocaleString()}</strong><span>LONG PARAGRAPHS</span></div></div>
      {readingNotes.headings.length>0&&<div className="deep-section"><h3>Detected sections</h3><ul>{readingNotes.headings.map((h,i)=><li key={i}>{h.replace(/^#{1,6}\s/,"")}</li>)}</ul></div>}
      {readingNotes.keyTerms.length>0&&<div className="deep-section"><h3>Frequently used terms</h3><div className="deep-terms">{readingNotes.keyTerms.map(({word,count})=><span key={word}>{word} <b>{count}</b></span>)}</div></div>}
      {analysis&&<div className="deep-section"><h3>Rule-based risk scan</h3><div className={`deep-risk ${analysis.severity.toLowerCase()}`}><strong>{analysis.severity} · {analysis.score}/100</strong><span>{analysis.findings.length} configured indicator(s) matched</span></div><p>{analysis.summary}</p>{analysis.findings.slice(0,5).map(f=><div className="deep-finding" key={f.title}><strong>{f.title}</strong><span>{f.evidence}</span></div>)}</div>}
      <div className="deep-section"><h3>Funny Translator</h3><p className="deep-translation">{translation}</p></div><p className="deep-disclaimer">Local structure overview and pattern scan—not an AI-generated summary or legal, financial, or fraud determination. Check extracted text for OCR or formatting errors.</p></>:!busy&&<div className="deep-empty">Upload a file or paste text in the input area to inspect it here.</div>}
  </div>;
}
