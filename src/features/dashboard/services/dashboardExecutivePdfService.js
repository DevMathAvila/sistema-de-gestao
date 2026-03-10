import React from 'react';
import { createRoot } from 'react-dom/client';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import DashboardExecutivePdfDocument from '../components/DashboardExecutivePdfDocument';

async function renderDocument(metrics, periodoLabel) {
  const host = document.createElement('div');
  host.setAttribute('data-executive-pdf-root', 'true');
  document.body.appendChild(host);

  const root = createRoot(host);
  root.render(React.createElement(DashboardExecutivePdfDocument, { metrics, periodoLabel }));

  await new Promise((resolve) => window.requestAnimationFrame(() => window.requestAnimationFrame(resolve)));

  const pages = Array.from(host.querySelectorAll('[data-pdf-page="true"]'));
  if (!pages.length) {
    root.unmount();
    document.body.removeChild(host);
    throw new Error('Falha ao montar o documento do PDF.');
  }

  return {
    pages,
    dispose: () => {
      root.unmount();
      document.body.removeChild(host);
    },
  };
}

export async function exportDashboardExecutivePdf({ metrics, periodoLabel }) {
  if (!metrics) return;

  const { pages, dispose } = await renderDocument(metrics, periodoLabel);

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'a4',
      compress: true,
    });

    for (let index = 0; index < pages.length; index += 1) {
      const page = pages[index];
      const image = await toPng(page, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#f8fafc',
      });

      if (index > 0) pdf.addPage();
      pdf.addImage(image, 'PNG', 0, 0, 446, 631, undefined, 'FAST');
    }

    pdf.save(`relatorio-performance-operacional-${Date.now()}.pdf`);
  } finally {
    dispose();
  }
}
