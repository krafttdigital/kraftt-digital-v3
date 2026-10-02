'use client';

import { useMemo, useState } from 'react';
import { Field, formatINR } from './CalculatorPrimitives';
import { Button, ResultActions } from './ToolSuite';

type Party = { name: string; address: string; gstin: string; state: string };
type LineItem = { id: string; description: string; hsn: string; qty: string; unit: string; rate: string; gstRate: string };

const emptyParty: Party = { name: '', address: '', gstin: '', state: '' };
const newLine = (id = '1'): LineItem => ({ id, description: '', hsn: '', qty: '1', unit: 'Nos', rate: '', gstRate: '18' });
const pdfMoney = (value: number) => `INR ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function GstInvoiceGenerator() {
  const [seller, setSeller] = useState<Party>(emptyParty);
  const [buyer, setBuyer] = useState<Party>(emptyParty);
  const [invoice, setInvoice] = useState({ number: '', date: '', dueDate: '', placeOfSupply: '' });
  const [items, setItems] = useState<LineItem[]>([newLine()]);
  const [notes, setNotes] = useState('');
  const [bankDetails, setBankDetails] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const supplyState = invoice.placeOfSupply.trim() || buyer.state.trim();
  const sameState = Boolean(seller.state.trim() && supplyState && seller.state.trim().toLowerCase() === supplyState.toLowerCase());

  const calculatedItems = useMemo(() => items.map((item) => {
    const taxable = Number(item.qty || 0) * Number(item.rate || 0);
    const gst = taxable * Number(item.gstRate || 0) / 100;
    return { ...item, taxable, gst, total: taxable + gst };
  }), [items]);
  const totals = useMemo(() => calculatedItems.reduce((sum, item) => ({ taxable: sum.taxable + item.taxable, gst: sum.gst + item.gst, total: sum.total + item.total }), { taxable: 0, gst: 0, total: 0 }), [calculatedItems]);

  const requiredChecks = [seller.name, seller.address, seller.gstin, seller.state, buyer.name, buyer.address, buyer.state, invoice.number, invoice.date, invoice.dueDate, invoice.placeOfSupply, ...items.flatMap((item) => [item.description, item.qty, item.rate, item.gstRate])];
  const missing = requiredChecks.filter((value) => !String(value).trim()).length;

  function updateParty(kind: 'seller' | 'buyer', field: keyof Party, value: string) {
    const setter = kind === 'seller' ? setSeller : setBuyer;
    setter((current) => ({ ...current, [field]: value }));
  }
  function updateItem(id: string, field: keyof LineItem, value: string) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, [field]: value } : item));
  }

  async function downloadPdf() {
    if (missing > 0) return;
    setIsDownloading(true);
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF({ unit: 'mm', format: 'a4' });
      const pageWidth = 210;
      const left = 16;
      const right = 194;
      let y = 17;

      const line = () => { doc.setDrawColor(210); doc.line(left, y, right, y); y += 6; };
      const addHeader = () => {
        doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.text('TAX INVOICE', left, y);
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9); doc.text(`Invoice: ${invoice.number}`, right, y, { align: 'right' });
        y += 7; line();
      };
      const addTableHeader = () => {
        doc.setFillColor(242, 239, 233); doc.rect(left, y - 4, right - left, 8, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(8);
        doc.text('Description', left + 2, y); doc.text('Qty', 91, y); doc.text('Rate', 111, y); doc.text('Taxable', 139, y); doc.text('GST', 162, y); doc.text('Total', right - 2, y, { align: 'right' });
        y += 8;
      };

      addHeader();
      doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.text(seller.name, left, y);
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5);
      const sellerLines = doc.splitTextToSize(`${seller.address}\nGSTIN: ${seller.gstin}\nState: ${seller.state}`, 78); doc.text(sellerLines, left, y + 5);
      doc.setFont('helvetica', 'bold'); doc.text('BILL TO', 112, y);
      doc.setFont('helvetica', 'normal');
      const buyerLines = doc.splitTextToSize(`${buyer.name}\n${buyer.address}${buyer.gstin ? `\nGSTIN: ${buyer.gstin}` : ''}\nState: ${buyer.state}`, 80); doc.text(buyerLines, 112, y + 5);
      y += Math.max(sellerLines.length, buyerLines.length) * 4.5 + 10;
      line();
      doc.setFontSize(8.5);
      doc.text(`Invoice date: ${invoice.date}`, left, y); doc.text(`Due date: ${invoice.dueDate}`, 76, y); doc.text(`Place of supply: ${invoice.placeOfSupply}`, 133, y); y += 9;
      addTableHeader();

      for (const item of calculatedItems) {
        if (y > 257) { doc.addPage(); y = 17; addHeader(); addTableHeader(); }
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8);
        const description = doc.splitTextToSize(`${item.description}${item.hsn ? `\nHSN/SAC: ${item.hsn}` : ''}`, 68);
        doc.text(description, left + 2, y); doc.text(`${item.qty} ${item.unit}`, 91, y); doc.text(pdfMoney(Number(item.rate)), 111, y); doc.text(pdfMoney(item.taxable), 139, y); doc.text(`${item.gstRate}%`, 162, y); doc.text(pdfMoney(item.total), right - 2, y, { align: 'right' });
        y += Math.max(10, description.length * 4 + 4); doc.setDrawColor(230); doc.line(left, y - 3, right, y - 3);
      }

      if (y > 225) { doc.addPage(); y = 17; addHeader(); }
      y += 3; doc.setFontSize(9); doc.setFont('helvetica', 'normal');
      doc.text('Taxable subtotal', 132, y); doc.text(pdfMoney(totals.taxable), right, y, { align: 'right' }); y += 6;
      if (sameState) {
        doc.text('CGST', 132, y); doc.text(pdfMoney(totals.gst / 2), right, y, { align: 'right' }); y += 6;
        doc.text('SGST', 132, y); doc.text(pdfMoney(totals.gst / 2), right, y, { align: 'right' }); y += 6;
      } else { doc.text('IGST', 132, y); doc.text(pdfMoney(totals.gst), right, y, { align: 'right' }); y += 6; }
      doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.text('Grand total', 132, y); doc.text(pdfMoney(totals.total), right, y, { align: 'right' }); y += 10;
      line(); doc.setFontSize(8.5);
      if (notes) { doc.setFont('helvetica', 'bold'); doc.text('Notes / payment terms', left, y); y += 5; doc.setFont('helvetica', 'normal'); doc.text(doc.splitTextToSize(notes, 82), left, y); }
      if (bankDetails) { doc.setFont('helvetica', 'bold'); doc.text('Bank details', 112, y); y += 5; doc.setFont('helvetica', 'normal'); doc.text(doc.splitTextToSize(bankDetails, 82), 112, y); }
      doc.setFont('helvetica', 'normal'); doc.setTextColor(115); doc.setFontSize(7.5); doc.text('Generated with Kraftt Digital', pageWidth / 2, 289, { align: 'center' });
      doc.save(`${invoice.number.replace(/[^a-z0-9-_]/gi, '-') || 'invoice'}.pdf`);
    } finally { setIsDownloading(false); }
  }

  return (
    <section className="tool-invoice tool-wrap-wide" id="tool-workspace" aria-labelledby="invoice-workspace-title">
      <div className="tool-invoice-grid">
        <section className="tool-invoice-form">
          <div className="tool-form-heading"><p className="tool-eyebrow">Invoice details</p><h2 id="invoice-workspace-title">Enter the details once. Totals update live.</h2></div>
          <fieldset><legend>Seller</legend><div className="tool-field-grid"><Field label="Business name"><input value={seller.name} onChange={(event) => updateParty('seller', 'name', event.target.value)} required /></Field><Field label="GSTIN"><input value={seller.gstin} onChange={(event) => updateParty('seller', 'gstin', event.target.value)} required /></Field><Field label="Address" wide><textarea rows={2} value={seller.address} onChange={(event) => updateParty('seller', 'address', event.target.value)} required /></Field><Field label="State"><input value={seller.state} onChange={(event) => updateParty('seller', 'state', event.target.value)} required /></Field></div></fieldset>
          <fieldset><legend>Buyer</legend><div className="tool-field-grid"><Field label="Buyer name"><input value={buyer.name} onChange={(event) => updateParty('buyer', 'name', event.target.value)} required /></Field><Field label="GSTIN — optional"><input value={buyer.gstin} onChange={(event) => updateParty('buyer', 'gstin', event.target.value)} /></Field><Field label="Address" wide><textarea rows={2} value={buyer.address} onChange={(event) => updateParty('buyer', 'address', event.target.value)} required /></Field><Field label="State"><input value={buyer.state} onChange={(event) => updateParty('buyer', 'state', event.target.value)} required /></Field></div></fieldset>
          <fieldset><legend>Invoice</legend><div className="tool-field-grid"><Field label="Invoice number"><input value={invoice.number} onChange={(event) => setInvoice((current) => ({ ...current, number: event.target.value }))} required /></Field><Field label="Invoice date"><input type="date" value={invoice.date} onChange={(event) => setInvoice((current) => ({ ...current, date: event.target.value }))} required /></Field><Field label="Due date"><input type="date" value={invoice.dueDate} onChange={(event) => setInvoice((current) => ({ ...current, dueDate: event.target.value }))} required /></Field><Field label="Place of supply"><input value={invoice.placeOfSupply} onChange={(event) => setInvoice((current) => ({ ...current, placeOfSupply: event.target.value }))} placeholder="State" required /></Field></div></fieldset>

          <fieldset><legend>Line items</legend><div className="tool-line-items">{items.map((item, index) => <div className="tool-line-item" key={item.id}><div className="tool-line-item-head"><strong>Item {index + 1}</strong>{items.length > 1 && <button type="button" onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))}>Remove</button>}</div><div className="tool-field-grid"><Field label="Description" wide><input value={item.description} onChange={(event) => updateItem(item.id, 'description', event.target.value)} required /></Field><Field label="HSN/SAC — optional"><input value={item.hsn} onChange={(event) => updateItem(item.id, 'hsn', event.target.value)} /></Field><Field label="Quantity"><input type="number" min="0.01" step="0.01" value={item.qty} onChange={(event) => updateItem(item.id, 'qty', event.target.value)} required /></Field><Field label="Unit"><input value={item.unit} onChange={(event) => updateItem(item.id, 'unit', event.target.value)} /></Field><Field label="Rate (₹)"><input type="number" min="0" step="0.01" value={item.rate} onChange={(event) => updateItem(item.id, 'rate', event.target.value)} required /></Field><Field label="GST %"><input type="number" min="0" step="0.01" value={item.gstRate} onChange={(event) => updateItem(item.id, 'gstRate', event.target.value)} required /></Field></div><div className="tool-line-total"><span>Taxable {formatINR(calculatedItems[index].taxable)}</span><span>GST {formatINR(calculatedItems[index].gst)}</span><strong>{formatINR(calculatedItems[index].total)}</strong></div></div>)}</div><button type="button" className="tool-add-line" onClick={() => setItems((current) => [...current, newLine(`${Date.now()}-${current.length}`)])}>+ Add another line item</button></fieldset>
          <fieldset><legend>Optional notes</legend><div className="tool-field-grid"><Field label="Notes / payment terms"><textarea rows={3} value={notes} onChange={(event) => setNotes(event.target.value)} /></Field><Field label="Bank details"><textarea rows={3} value={bankDetails} onChange={(event) => setBankDetails(event.target.value)} /></Field></div></fieldset>
        </section>

        <aside className="tool-invoice-summary">
          <p className="tool-eyebrow">Live invoice total</p><h2>{formatINR(totals.total)}</h2>
          <p className="tool-tax-mode">{seller.state && supplyState ? sameState ? 'Same state · CGST + SGST' : 'Different state · IGST' : 'Add seller state and place of supply'}</p>
          <dl><div><dt>Taxable amount</dt><dd>{formatINR(totals.taxable)}</dd></div>{sameState ? <><div><dt>CGST</dt><dd>{formatINR(totals.gst / 2)}</dd></div><div><dt>SGST</dt><dd>{formatINR(totals.gst / 2)}</dd></div></> : <div><dt>IGST</dt><dd>{formatINR(totals.gst)}</dd></div>}<div><dt>Grand total</dt><dd>{formatINR(totals.total)}</dd></div></dl>
          <p className="tool-disclaimer">This tool formats an invoice from the details you provide. It does not verify GSTIN validity or tax compliance — confirm accuracy with your accountant. Not tax or legal advice.</p>
          <Button type="button" onClick={downloadPdf} disabled={missing > 0 || isDownloading}>{isDownloading ? 'Preparing PDF…' : missing > 0 ? `Download PDF (${missing} fields needed)` : 'Download Invoice PDF'}</Button>
          <ResultActions serviceHref="/services/dashboards-internal-tools" serviceLabel="Explore Business Tools & Dashboards" auditHref={`/audit?tool=gst-invoice-generator&invoiceTotal=${totals.total.toFixed(2)}`} />
        </aside>
      </div>
    </section>
  );
}
