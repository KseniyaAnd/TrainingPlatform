import { Injectable } from '@angular/core';
import { Document, HeadingLevel, Packer, Paragraph, TextRun } from 'docx';
import { saveAs } from 'file-saver';

@Injectable({
  providedIn: 'root',
})
export class DocumentGeneratorService {
  /**
   * Generates and downloads a DOCX document
   * @param doc - The Document object to convert and download
   * @param filename - The name of the file to download (without extension)
   */
  async downloadDocx(doc: Document, filename: string): Promise<void> {
    try {
      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${filename}.docx`);
    } catch (error) {
      console.error('Error generating DOCX:', error);
      throw new Error('Не удалось создать документ');
    }
  }

  /**
   * Creates a simple document with a title and paragraphs
   * @param title - Document title
   * @param paragraphs - Array of paragraph texts
   * @returns Document object
   */
  createSimpleDocument(title: string, paragraphs: string[]): Document {
    const docParagraphs: Paragraph[] = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 300 },
      }),
    ];

    paragraphs.forEach((text) => {
      docParagraphs.push(
        new Paragraph({
          text,
          spacing: { after: 200 },
        }),
      );
    });

    return new Document({
      sections: [
        {
          properties: {},
          children: docParagraphs,
        },
      ],
    });
  }

  /**
   * Creates a document with sections (title + content)
   * @param title - Main document title
   * @param sections - Array of sections with heading and content
   * @returns Document object
   */
  createSectionedDocument(
    title: string,
    sections: Array<{ heading: string; content: string[] }>,
  ): Document {
    const docParagraphs: Paragraph[] = [
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 400 },
      }),
    ];

    sections.forEach((section) => {
      docParagraphs.push(
        new Paragraph({
          text: section.heading,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 200 },
        }),
      );

      section.content.forEach((text) => {
        docParagraphs.push(
          new Paragraph({
            text,
            spacing: { after: 100 },
          }),
        );
      });

      docParagraphs.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    });

    return new Document({
      sections: [
        {
          properties: {},
          children: docParagraphs,
        },
      ],
    });
  }

  /**
   * Creates a bulleted list paragraph
   * @param items - Array of list items
   * @returns Array of Paragraph objects
   */
  createBulletList(items: string[]): Paragraph[] {
    return items.map(
      (item) =>
        new Paragraph({
          text: `• ${item}`,
          spacing: { after: 100 },
          indent: { left: 720 },
        }),
    );
  }

  /**
   * Creates a paragraph with bold and regular text
   * @param boldText - Text to be bold
   * @param regularText - Regular text
   * @returns Paragraph object
   */
  createLabeledParagraph(boldText: string, regularText: string): Paragraph {
    return new Paragraph({
      children: [new TextRun({ text: boldText, bold: true }), new TextRun({ text: regularText })],
      spacing: { after: 100 },
    });
  }
}
