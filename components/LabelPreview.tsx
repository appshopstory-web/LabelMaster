
import React from 'react';
import { LabelConfig, LabelStyle } from '../types';
import { QRCodeSVG } from 'qrcode.react';
import Barcode from 'react-barcode';

interface Props {
  config: LabelConfig;
  id?: string;
}

const LabelPreview: React.FC<Props> = ({ config, id }) => {
  const pxWidth = config.width * 3.78;
  const pxHeight = config.height * 3.78;

  const containerBaseStyle: React.CSSProperties = {
    width: `${pxWidth}px`,
    height: `${pxHeight}px`,
    backgroundColor: 'white',
    color: 'black',
    border: '1px solid #ccc',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    position: 'relative',
    margin: '0 auto',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    fontFamily: 'sans-serif',
    paddingTop: `${config.paddingTop}px`,
    paddingLeft: `${config.paddingLeft}px`,
    paddingRight: `${config.paddingRight}px`,
    paddingBottom: `${config.paddingBottom}px`,
    gap: `${config.internalSpacing}px`,
  };

  const Logo = () => config.logoUrl ? (
    <img 
      src={config.logoUrl} 
      alt="Logo" 
      style={{ width: `${config.logoWidth}px`, height: `${config.logoHeight}px` }} 
      className="object-contain shrink-0" 
    />
  ) : (
    <div className="w-12 h-12 bg-slate-50 rounded flex items-center justify-center text-[7px] text-slate-400 border border-dashed border-slate-200 shrink-0">LOGO</div>
  );

  const QR = (sizeOverride?: number) => config.qrCode ? <QRCodeSVG value={config.qrCode} size={sizeOverride || config.qrCodeSize} level="M" /> : null;
  
  const BC = (h = 25, w = 1.2) => config.barcode ? (
    <Barcode value={config.barcode} width={w} height={h} fontSize={8} margin={0} displayValue={true} />
  ) : null;

  const Nutrition = () => (
    <div className="border border-black p-1 flex flex-col h-full overflow-hidden">
      <span className="text-[8px] font-bold block text-center uppercase mb-1 border-b border-black pb-0.5">Informação Nutricional</span>
      <table className="w-full text-[6px] border-collapse flex-1">
        <thead>
          <tr className="border-b border-black">
            <th className="text-left py-0.5">Nutriente</th>
            <th className="text-right py-0.5">Quant.</th>
            <th className="text-right py-0.5">%VD*</th>
          </tr>
        </thead>
        <tbody>
          {config.nutrition.map((item, idx) => (
            <tr key={idx} className="border-b border-slate-100 last:border-0">
              <td className="py-0.5 font-medium">{item.name}</td>
              <td className="text-right py-0.5">{item.amount}</td>
              <td className="text-right py-0.5">{item.dailyValue}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-[5px] mt-1 leading-none italic">* % Valores Diários (2.000kcal).</p>
    </div>
  );

  // --- RENDERING STRATEGIES ---

  const renderClassic = () => (
    <>
      <div className="flex justify-between items-center border-b border-black pb-2 gap-2 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <Logo />
          <div className="flex-1 min-w-0">
            <h2 style={{ fontSize: `${config.companyFontSize + 2}px` }} className="font-bold leading-tight truncate uppercase">{config.companyName}</h2>
            <p style={{ fontSize: `${config.companyFontSize - 1}px` }} className="leading-tight line-clamp-2">{config.companyContact}</p>
            <div className="flex flex-wrap gap-x-2 mt-0.5">
              <span style={{ fontSize: `${config.companyFontSize - 1}px` }} className="leading-tight">Wpp: {config.whatsapp}</span>
              <span style={{ fontSize: `${config.companyFontSize - 1}px` }} className="leading-tight italic">{config.email}</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 ml-auto">{QR()}</div>
      </div>
      <div className="text-center shrink-0">
        <h1 style={{ fontSize: `${config.productNameFontSize}px` }} className="font-black uppercase tracking-tight leading-none">{config.productName}</h1>
      </div>
      <div className="grid grid-cols-2 gap-3 flex-1 overflow-hidden min-h-0">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex flex-col" style={{ gap: `${Math.max(2, config.internalSpacing / 4)}px` }}>
            <div>
              <span className="text-[8px] font-bold block uppercase border-b border-black tracking-wider">Ingredientes</span>
              <p style={{ fontSize: `${config.globalFontSize}px` }} className="leading-tight mt-1 text-justify line-clamp-[8]">{config.ingredients}</p>
            </div>
            <div>
              <span className="text-[8px] font-bold block uppercase border-b border-black tracking-wider">Dicas de Preparo</span>
              <p style={{ fontSize: `${config.globalFontSize}px` }} className="leading-tight mt-1 italic line-clamp-3">{config.preparation}</p>
            </div>
          </div>
          <div className="mt-auto grid grid-cols-2 gap-1 border-t border-black pt-1">
            <div><span className="text-[7px] font-bold block">Lote:</span><span style={{ fontSize: `${config.globalFontSize + 1}px` }} className="font-mono">{config.batch}</span></div>
            <div><span className="text-[7px] font-bold block">Validade:</span><span style={{ fontSize: `${config.globalFontSize + 1}px` }} className="font-mono">{config.expiry}</span></div>
          </div>
        </div>
        <Nutrition />
      </div>
      <div className="flex flex-col items-center shrink-0">{BC()}</div>
    </>
  );

  const renderModern = () => (
    <>
      <div className="flex flex-col items-center shrink-0" style={{ gap: `${config.internalSpacing}px` }}>
        <Logo />
        <h1 style={{ fontSize: `${config.productNameFontSize + 4}px` }} className="font-black uppercase text-center border-y-2 border-black py-1 w-full leading-none">{config.productName}</h1>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden" style={{ gap: `${config.internalSpacing}px` }}>
        <div className="grid grid-cols-2 gap-4 h-full overflow-hidden">
          <div className="flex flex-col h-full overflow-hidden">
             <div className="bg-black text-white p-1 text-center font-bold text-[8px] uppercase shrink-0">Ficha Técnica</div>
             <p style={{ fontSize: `${config.globalFontSize}px` }} className="leading-relaxed text-justify mt-2 overflow-hidden">{config.ingredients}</p>
             <div className="flex justify-between border-t border-black pt-1 mt-auto shrink-0">
                <div style={{ fontSize: `${config.globalFontSize}px` }}><strong>Lote:</strong> {config.batch}</div>
                <div style={{ fontSize: `${config.globalFontSize}px` }}><strong>VAL:</strong> {config.expiry}</div>
             </div>
          </div>
          <div className="h-full overflow-hidden">
            <Nutrition />
          </div>
        </div>
      </div>
      <div className="flex justify-between items-end border-t border-black pt-2 shrink-0">
        <div style={{ fontSize: `${config.companyFontSize}px` }} className="flex-1">
          <p className="font-bold">{config.companyName}</p>
          <p>{config.whatsapp}</p>
        </div>
        <div className="flex gap-2 items-center">
          {QR()}
          {BC(22, 1)}
        </div>
      </div>
    </>
  );

  const renderMinimal = () => (
    <>
      <div className="text-center shrink-0" style={{ gap: `${config.internalSpacing}px`, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Logo />
        <h1 style={{ fontSize: `${config.productNameFontSize + 8}px` }} className="font-light uppercase tracking-widest leading-none mt-2">{config.productName}</h1>
      </div>
      <div className="flex-1 border-y border-black flex flex-col items-center justify-center overflow-hidden" style={{ gap: `${config.internalSpacing * 1.5}px` }}>
        <p style={{ fontSize: `${config.globalFontSize + 1}px` }} className="text-center max-w-[80%] leading-relaxed">{config.ingredients}</p>
        <div style={{ fontSize: `${config.globalFontSize + 3}px` }} className="flex gap-10 font-mono shrink-0">
           <span>L:{config.batch}</span>
           <span>V:{config.expiry}</span>
        </div>
      </div>
      <div className="py-2 flex flex-col items-center shrink-0" style={{ gap: `${config.internalSpacing}px` }}>
        {BC(35, 1.5)}
        <p style={{ fontSize: `${config.companyFontSize}px` }} className="uppercase font-bold tracking-tighter">{config.companyName} • {config.email}</p>
      </div>
    </>
  );

  const renderCompact = () => (
    <div className="flex flex-col h-full" style={{ gap: `${config.internalSpacing / 2}px` }}>
      <div className="flex gap-2 items-center border-b border-black pb-1 shrink-0">
        <Logo />
        <div className="flex-1 min-w-0">
           <h1 style={{ fontSize: `${config.productNameFontSize - 2}px` }} className="font-bold leading-none truncate">{config.productName}</h1>
           <p style={{ fontSize: `${config.companyFontSize - 2}px` }} className="text-slate-500 truncate">{config.companyName}</p>
        </div>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col" style={{ gap: `${config.internalSpacing / 2}px` }}>
         <p style={{ fontSize: `${config.globalFontSize - 1}px` }} className="leading-tight shrink-0"><strong>Ingr:</strong> {config.ingredients}</p>
         <div className="flex-1 overflow-hidden">
            <Nutrition />
         </div>
      </div>
      <div className="grid grid-cols-2 gap-2 items-center border-t border-black pt-1 shrink-0">
         <div className="flex flex-col gap-1">
            <span style={{ fontSize: `${config.globalFontSize - 1}px` }}>L: {config.batch}</span>
            <span style={{ fontSize: `${config.globalFontSize - 1}px` }}>V: {config.expiry}</span>
         </div>
         <div className="flex justify-end gap-1">
            {QR()}
            {BC(15, 0.8)}
         </div>
      </div>
    </div>
  );

  return (
    <div id={id} style={containerBaseStyle} className="label-content select-none">
      {config.layoutStyle === LabelStyle.CLASSIC && renderClassic()}
      {config.layoutStyle === LabelStyle.MODERN && renderModern()}
      {config.layoutStyle === LabelStyle.MINIMAL && renderMinimal()}
      {config.layoutStyle === LabelStyle.COMPACT && renderCompact()}
    </div>
  );
};

export default LabelPreview;
